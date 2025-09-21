import json
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams

# Load KB data
with open("studio-main/src/ai/kb.json", "r", encoding="utf-8") as f:
    kb_data = json.load(f)["entries"]

# Initialize embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Connect to Qdrant
qdrant = QdrantClient(host="localhost", port=6333)
collection_name = "mathmind-kb"
vector_size = 384  # all-MiniLM-L6-v2 output size

# Create collection if not exists
if collection_name not in [c.name for c in qdrant.get_collections().collections]:
    qdrant.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance="Cosine")
    )

# Upload KB entries
points = []

for i, entry in enumerate(kb_data):
    vector = model.encode(entry["question"]).tolist()
    payload = {
        "question": entry["question"],
        "solution": entry["solution"],
        "verified": entry.get("verified", False)
    }
    points.append(PointStruct(id=i+1, vector=vector, payload=payload))

qdrant.upsert(collection_name=collection_name, points=points)
print(f"Uploaded {len(points)} KB entries to Qdrant.")
