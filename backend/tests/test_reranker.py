from app.rag.hybrid_search import hybrid_search
from app.rag.dedup import deduplicate_products
from app.rag.reranker import rerank_products


query = "accessories for my gaming laptop"

candidates = hybrid_search(query, limit=20)

unique_candidates = deduplicate_products(candidates)

print("Qdrant candidates:", len(candidates))
print("After dedup:", len(unique_candidates))
print()

results = rerank_products(
    query,
    unique_candidates,
    limit=5,
)

print("Final results:")
for product in results:
    print(
        round(product["rerank_score"], 3),
        "|",
        product["name"],
        "|",
        product["category"],
    )