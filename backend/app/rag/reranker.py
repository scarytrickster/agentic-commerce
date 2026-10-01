from fastembed.rerank.cross_encoder import TextCrossEncoder


MODEL_NAME = "jinaai/jina-reranker-v1-turbo-en"

reranker = TextCrossEncoder(model_name=MODEL_NAME)


def rerank_products(
    query: str,
    products: list[dict],
    limit: int = 5,
) -> list[dict]:

    if not products:
        return []

    passages = [
        (
            f"Product: {product['name']}\n"
            f"Category: {product['category']}"
        )
        for product in products
    ]

    scores = list(
        reranker.rerank(
            query=query,
            documents=passages,
        )
    )

    ranked = []

    for product, score in zip(products, scores):
        product_copy = product.copy()
        product_copy["rerank_score"] = float(score)
        ranked.append(product_copy)

    ranked.sort(
        key=lambda product: product["rerank_score"],
        reverse=True,
    )

    return ranked[:limit]