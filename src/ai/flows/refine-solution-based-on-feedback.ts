'use server';

/**
 * @fileOverview A flow to refine the step-by-step solution based on user feedback.
 *
 * - refineSolutionBasedOnFeedback - A function that refines the solution based on feedback.
 * - RefineSolutionInput - The input type for the refineSolutionBasedOnFeedback function.
 * - RefineSolutionOutput - The return type for the refineSolutionBasedOnFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineSolutionInputSchema = z.object({
  originalSolution: z
    .string()
    .describe('The original step-by-step solution to the math problem.'),
  feedback: z
    .string()
    .describe(
      'The user feedback on the original solution, including specific areas of confusion or suggestions for improvement.'
    ),
  question: z.string().describe('The original math question asked by the user.'),
});
export type RefineSolutionInput = z.infer<typeof RefineSolutionInputSchema>;

const RefineSolutionOutputSchema = z.object({
  refinedSolution: z
    .string()
    .describe(
      'The refined step-by-step solution, incorporating the user feedback to provide a clearer and more helpful explanation.'
    ),
});
export type RefineSolutionOutput = z.infer<typeof RefineSolutionOutputSchema>;

export async function refineSolutionBasedOnFeedback(
  input: RefineSolutionInput
): Promise<RefineSolutionOutput> {
  return refineSolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineSolutionPrompt',
  input: {schema: RefineSolutionInputSchema},
  output: {schema: RefineSolutionOutputSchema},
  prompt: `You are an expert math tutor. A student has provided feedback on a step-by-step solution you generated for a math problem.
  Your task is to refine the solution based on the feedback, making it clearer and easier to understand.

  Original Question: {{{question}}}

  Original Solution: {{{originalSolution}}}

  Feedback: {{{feedback}}}

  Refined Solution:`,
});

const refineSolutionFlow = ai.defineFlow(
  {
    name: 'refineSolutionFlow',
    inputSchema: RefineSolutionInputSchema,
    outputSchema: RefineSolutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {refinedSolution: output!.refinedSolution};
  }
);
