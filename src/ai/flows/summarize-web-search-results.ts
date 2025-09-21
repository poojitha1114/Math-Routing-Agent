'use server';
/**
 * @fileOverview Summarizes web search results into a step-by-step solution for math questions.
 *
 * - summarizeWebSearchResults - A function that summarizes web search results.
 * - summarizeWebSearchResultsInput - The input type for the summarizeWebSearchResults function.
 * - summarizeWebSearchResultsOutput - The return type for the summarizeWebSearchResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {knowledgeBaseSearch} from '../tools/kb-search';
import {redactPII} from '../tools/pii-redaction';
import {verifyMath} from '../tools/math-verifier';

const SummarizeWebSearchResultsInputSchema = z.object({
  query: z.string().describe('The original math question asked by the user.'),
  searchResults: z
    .array(
      z.object({
        url: z.string(),
        chunk_id: z.string(),
        text: z.string(),
      })
    )
    .describe('An array of web search result chunks.'),
});
export type SummarizeWebSearchResultsInput = z.infer<
  typeof SummarizeWebSearchResultsInputSchema
>;

const SummarizeWebSearchResultsOutputSchema = z.object({
  isMathQuestion: z
    .boolean()
    .describe('Whether the query is a math-related question.'),
  stepByStepSolution: z
    .string()
    .describe(
      'A clear and concise step-by-step solution to the math question, including a "Final Answer" section. Provide a fallback message if it\'s not a math question.'
    ),
  route_decision: z
    .enum(['kb', 'web', 'blocked'])
    .describe('The routing decision made.'),
  kb_hit_ids: z.array(z.string()).optional().describe('IDs of the KB hits.'),
  isVerified: z
    .boolean()
    .optional()
    .describe('Whether the final numeric answer was verified.'),
  confidence: z.number().optional().describe('The confidence score.'),
  provenance: z
    .array(
      z.object({
        url: z.string(),
        chunk_id: z.string(),
      })
    )
    .optional()
    .describe('Citations for the web search results used.'),
});
export type SummarizeWebSearchResultsOutput = z.infer<
  typeof SummarizeWebSearchResultsOutputSchema
>;

export async function summarizeWebSearchResults(
  input: SummarizeWebSearchResultsInput
): Promise<SummarizeWebSearchResultsOutput> {
  return summarizeWebSearchResultsFlow(input);
}

const solutionExtractionPrompt = ai.definePrompt({
  name: 'solutionExtractionPrompt',
  input: {
    schema: z.object({
      query: z.string(),
      searchResults: SummarizeWebSearchResultsInputSchema.shape.searchResults,
    }),
  },
  output: {
    schema: z.object({
      isMathQuestion: z
        .boolean()
        .describe('Whether the query is a math-related question.'),
      stepByStepSolution: z
        .string()
        .describe(
          'A clear and concise step-by-step solution to the math question, including a "Final Answer" section. Provide a fallback message if it\'s not a math question.'
        ),
      finalAnswerExpression: z
        .string()
        .optional()
        .describe(
          'The mathematical expression for the final answer, for verification. e.g., "x = 6" or "12/4".'
        ),
      finalAnswerNumeric: z
        .number()
        .optional()
        .describe('The numeric value of the final answer for verification.'),
    }),
  },
  prompt: `You are a Mathematics Teaching Assistant.
First, determine if the user's query is a math-related question based on the query and the search results.

If it is a math question, you must solve the problem step-by-step in a structured way.
Use the web search results to help you formulate the answer. Cite the sources you use.
Format your answer exactly like this:

Step 1: [first step explanation]
[calculation/work shown]

Step 2: [second step explanation]
[calculation/work shown]

... continue until the final result.

Finally, write:
Final Answer: [result]

If the query is not a math question, provide a polite response indicating that you can only answer math-related questions.

Extract the final mathematical expression (like 'x=6') and its numeric value for verification.

User's Question: {{{query}}}
Web Search Results:
{{#each searchResults}}
- Source URL: {{{this.url}}} (chunk: {{{this.chunk_id}}})
  Content: {{{this.text}}}
{{/each}}
`,
});

const summarizeWebSearchResultsFlow = ai.defineFlow(
  {
    name: 'summarizeWebSearchResultsFlow',
    inputSchema: SummarizeWebSearchResultsInputSchema,
    outputSchema: SummarizeWebSearchResultsOutputSchema,
  },
  async input => {
    // 1. Input Guardrail: Redact PII
    const redactedQuery = await redactPII(input.query);
    if (redactedQuery.wasRedacted) {
      console.log(`[Guardrail] PII redacted from query.`);
      // Optionally, you could block the query entirely if PII is detected.
    }

    // 2. Routing: KB lookup first
    const kbResult = await knowledgeBaseSearch(redactedQuery.text);

    // 3. If KB hit, return it.
    if (kbResult.length > 0) {
      const topHit = kbResult[0]; // Use the best match
      console.log(`[Routing] KB hit found: ${topHit.id}`);
      return {
        isMathQuestion: true,
        stepByStepSolution: topHit.solution,
        route_decision: 'kb',
        kb_hit_ids: kbResult.map(hit => hit.id),
        isVerified: topHit.verified, // Use the verified status from the KB
        confidence: topHit.score,
      };
    }

    // 4. If KB miss -> call LLM with web extraction.
    console.log(`[Routing] KB miss, proceeding to web search.`);
    const {output} = await solutionExtractionPrompt({
      query: redactedQuery.text,
      searchResults: input.searchResults,
    });

    if (!output || !output.isMathQuestion) {
      return {
        isMathQuestion: false,
        stepByStepSolution:
          output?.stepByStepSolution ||
          "I can only answer math-related questions. Please ask something else.",
        route_decision: 'blocked',
      };
    }

    // 5. Output Guardrail: Verify the answer
    let isVerified = false;
    if (
      output.finalAnswerExpression !== undefined &&
      output.finalAnswerNumeric !== undefined
    ) {
      try {
        isVerified = await verifyMath({
          expression: output.finalAnswerExpression,
          expectedResult: output.finalAnswerNumeric,
        });
        console.log(`[Guardrail] Answer verification result: ${isVerified}`);
      } catch (e) {
        console.error('[Guardrail] Math verification failed', e);
      }
    }

    return {
      isMathQuestion: true,
      stepByStepSolution: output.stepByStepSolution,
      route_decision: 'web',
      isVerified,
      provenance: input.searchResults.map(r => ({
        url: r.url,
        chunk_id: r.chunk_id,
      })),
      confidence: 0.8, // Example confidence score for web-based answers
    };
  }
);
