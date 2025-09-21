"use server";
/**
 * @fileOverview A tool to perform a lookup in the knowledge base.
 */
import { ai } from "@/ai/genkit";
import { z } from "genkit";
import kbData from "../kb.json";

interface KBEntry {
  id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  solution: string;
  verified: boolean;
  keywords?: string[];
}

const knowledgeBase: KBEntry[] = kbData.entries;

const KBLookupOutputSchema = z.object({
  id: z.string(),
  solution: z.string(),
});

/**
 * Performs a simple case-insensitive exact match lookup.
 * In a real-world scenario, this would use a vector DB for semantic search.
 */
export const knowledgeBaseLookup = ai.defineTool(
  {
    name: "knowledgeBaseLookup",
    description: "Looks up a question in the internal knowledge base for an exact match.",
    inputSchema: z.string().describe("The user's math question."),
    outputSchema: z.nullable(KBLookupOutputSchema),
  },
  async (question) => {
    console.log(`[KB] Searching for exact match: "${question}"`);
    const normalizedQuestion = question.trim().toLowerCase();
    const match = knowledgeBase.find(
      (entry) => entry.question.toLowerCase() === normalizedQuestion
    );

    if (match && match.verified) {
      console.log(`[KB] Found verified exact match: ${match.id}`);
      return { id: match.id, solution: match.solution };
    }
    console.log("[KB] No verified exact match found.");
    return null;
  }
);
