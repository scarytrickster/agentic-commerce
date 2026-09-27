from app.rag.search import search_products


def hybrid_search(query: str, limit: int = 20):
    """
    Retrieve semantic product candidates from Qdrant.

    PostgreSQL filtering and reranking will be added next.
    """

    results = search_products(query, limit=limit)

    products = []

    for result in results:
        payload = result.payload

        products.append(
            {
                "id": payload["product_id"],
                "name": payload["name"],
                "category": payload["category"],
                "price": payload["price"],
                "stock": payload["stock"],
                "image_url": payload["image_url"],
                "score": result.score,
            }
        )

    return products