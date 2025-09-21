// Qdrant client setup for MathMind AI
import { QdrantClient } from "@qdrant/js-client-rest";

// Qdrant server URL (default: localhost)
const QDRANT_URL = typeof process !== 'undefined' && process.env && process.env.QDRANT_URL ? process.env.QDRANT_URL : "http://localhost:6333";

export const qdrant = new QdrantClient({ url: QDRANT_URL });

// Utility to create collection if not exists
export async function ensureCollection(collectionName: string) {
  const collections = await qdrant.getCollections();
  if (!collections.collections.some(c => c.name === collectionName)) {
    await qdrant.createCollection(collectionName, {
      vectors: { size: 1536, distance: "Cosine" }, // Adjust size for your embedding model
    });
  }
}
