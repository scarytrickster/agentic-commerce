import asyncio

from app.database.session import AsyncSessionLocal
from app.rag.hybrid_search import hybrid_search


async def main():
    query = "gaming accessories under ₹2000"
    async with AsyncSessionLocal() as db:
        results = await hybrid_search(
            db=db,
            query=query,
            candidate_limit=50,
            result_limit=5,
        )

    print(f"\nQuery: {query}")
    print(f"Results: {len(results)}\n")

    for product in results:
        print(
            round(product["rerank_score"], 3),
            "|",
            product["name"],
            "|",
            product["category"],
            "| ₹",
            product["price"],
        )


if __name__ == "__main__":
    asyncio.run(main())