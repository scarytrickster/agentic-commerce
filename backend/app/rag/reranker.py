from flashrank import Ranker, RerankRequest


ranker = Ranker()


def rerank_products(query: str, products: list[dict], limit: int = 5):
    passages = []

    for product in products:
        passages.append(
            {
                "id": product["id"],
                "text": (
                    f"{product['name']} "
                    f"{product['category']}"
                ),
            }
        )

    request = RerankRequest(
        query=query,
        passages=passages,
    )

    results = ranker.rerank(request)

    reranked = []

    for result in results[:limit]:
        product = next(
            p for p in products
            if p["id"] == result["id"]
        )

        product = product.copy()
        product["rerank_score"] = result["score"]

        reranked.append(product)

    return reranked