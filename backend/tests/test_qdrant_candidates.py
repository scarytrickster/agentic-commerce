from app.rag.search import search_products


query = "gaming accessories under ₹2000"

results = search_products(query, limit=20)

print(f"\nQuery: {query}")
print(f"Candidates: {len(results)}\n")

for result in results:
    print(
        f"{result.score:.4f} | "
        f"{result.payload['name']}"
    )