from fastembed import TextEmbedding
from app.rag.qdrant import client


MODEL_NAME = "jinaai/jina-embeddings-v3"
COLLECTION_NAME = "products_jina"

model = TextEmbedding(model_name=MODEL_NAME)

query = "wireless accessories"

query_vector = next(
    model.query_embed([query])
)

results = client.query_points(
    collection_name=COLLECTION_NAME,
    query=query_vector,
    limit=20,
    with_payload=True,
)

print(f"\nQuery: {query}")
print(f"Candidates: {len(results.points)}\n")

for result in results.points:
    print(
        f"{result.score:.4f} | "
        f"{result.payload['name']}"
    )