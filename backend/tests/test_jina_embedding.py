from fastembed import TextEmbedding


MODEL_NAME = "jinaai/jina-embeddings-v3"

model = TextEmbedding(model_name=MODEL_NAME)

query = "gaming accessories under ₹2000"

query_vector = next(
    model.embed([query])
)

print("Model:", MODEL_NAME)
print("Vector dimensions:", len(query_vector))
print("First 5 values:", query_vector[:5])