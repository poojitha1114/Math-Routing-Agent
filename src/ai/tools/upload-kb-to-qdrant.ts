// Script to upload KB data to Qdrant
import { qdrant, ensureCollection } from "./qdrant-client.ts";
import { config } from "dotenv";
config();
import kbData from "../kb.json";
import { OpenAI } from "openai"; // Or use any embedding provider

const COLLECTION_NAME = "mathmind-kb";
const EMBEDDING_DIM = 1536; // Adjust to your embedding model
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embed(text: string): Promise<number[]> {
  // Use OpenAI or any embedding provider
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

async function uploadKB() {
  await ensureCollection(COLLECTION_NAME);
  for (const entry of kbData.entries) {
    const vector = await embed(entry.question);
    await qdrant.upsert(COLLECTION_NAME, {
      points: [
        {
          id: entry.id,
          vector,
          payload: {
            question: entry.question,
            solution: entry.solution,
            verified: entry.verified || false,
          },
        },
      ],
    });
    console.log(`Uploaded: ${entry.id}`);
  }
  console.log("KB upload complete.");
}

uploadKB().catch(console.error);
