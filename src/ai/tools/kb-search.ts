'use server';
/**
 * @fileOverview A tool to perform a semantic search in the knowledge base.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import kbData from '../kb.json';

interface KBEntry {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  solution: string;
  verified: boolean;
  keywords?: string[];
}

const knowledgeBase: KBEntry[] = kbData.entries;

const KBSearchOutputSchema = z.object({
  id: z.string(),
  question: z.string(),
  solution: z.string(),
  verified: z.boolean(),
  score: z.number(),
});

/**
 * Simulates a vector DB search by performing keyword matching.
 * It returns a ranked list of matches based on keyword overlap.
 */
export const knowledgeBaseSearch = ai.defineTool(
  {
    name: 'knowledgeBaseSearch',
    description: 'Searches the knowledge base for relevant math problems.',
    inputSchema: z.string().describe("The user's math question."),
    outputSchema: z.array(KBSearchOutputSchema),
  },
  async question => {
    console.log(`[KB Search] Simulating vector search for: "${question}"`);
    const queryWords = question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 1); // Ignore short words

    const matches: (z.infer<typeof KBSearchOutputSchema>)[] = [];

    knowledgeBase.forEach(entry => {
      const entryKeywords = entry.keywords || [];
      const commonWords = entryKeywords.filter(kw => queryWords.includes(kw));

      if (commonWords.length > 0) {
        // Simple scoring: more common words = higher score
        const score = commonWords.length / queryWords.length;
        if (score > 0.3) {
          // Only include if score is above a certain threshold
          matches.push({
            id: entry.id,
            question: entry.question,
            solution: entry.solution,
            verified: entry.verified,
            score: parseFloat(score.toFixed(2)),
          });
        }
      }
    });

    // Sort by score descending
    const sortedMatches = matches.sort((a, b) => b.score - a.score);

    if (sortedMatches.length > 0) {
      console.log(
        `[KB Search] Found ${sortedMatches.length} potential matches.`
      );
    } else {
      console.log('[KB Search] No relevant matches found.');
    }

    return sortedMatches;
  }
);
