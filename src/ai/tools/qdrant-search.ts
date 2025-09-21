// Qdrant semantic KB search for MathMind AI (Node.js)

import { QdrantClient } from "@qdrant/js-client-rest";
import fetch from "node-fetch";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const COLLECTION_NAME = "mathmind-kb";
const EMBED_SERVICE_URL = process.env.EMBED_SERVICE_URL || "http://localhost:8000/embed";

const qdrant = new QdrantClient({ url: QDRANT_URL });

async function embedQuestion(question: string): Promise<number[]> {
  const response = await fetch(EMBED_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: question }),
  });
  if (!response.ok) throw new Error("Embedding service error");
  const data = await response.json();
  return data.embedding;
}

export async function searchKB(question: string) {
  const vector = await embedQuestion(question);
  const searchResult = await qdrant.search(COLLECTION_NAME, {
    vector,
    limit: 3,
    with_payload: true,
  });
  return searchResult;
}
