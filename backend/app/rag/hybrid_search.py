
from sqlalchemy.ext.asyncio import AsyncSession

from app.rag.dedup import deduplicate_products
from app.rag.qwen_reranker import rerank_products
from app.rag.search import search_products
from app.services.product_recommendation import get_products_by_ids
from app.services.query_parser import parse_shopping_query


async def hybrid_search(
    db: AsyncSession,
    query: str,
    candidate_limit: int = 20,
    result_limit: int = 5,
):
    # Parse structured constraints such as category and price.
    intent = parse_shopping_query(query)

    # Retrieve semantically relevant candidates from Qdrant.
    qdrant_results = search_products(
        query,
        limit=candidate_limit,
    )

    product_ids = [
        result.payload["product_id"]
        for result in qdrant_results
    ]

    category_filter = intent.category

    # Accessories is a semantic concept, not a strict catalog category.
    if category_filter == "accessories":
        category_filter = None

    # Apply strict business constraints using PostgreSQL.
    products = await get_products_by_ids(
        db=db,
        product_ids=product_ids,
        category=category_filter,
        min_price=intent.min_price,
        max_price=intent.max_price,
        in_stock=True,
    )

    product_map = {
        product.id: product
        for product in products
    }

    candidates = []

    # Preserve Qdrant retrieval order before reranking.
    for result in qdrant_results:
        product_id = result.payload["product_id"]

        if product_id not in product_map:
            continue

        product = product_map[product_id]

        candidates.append({
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "price": str(product.price),
            "stock": product.stock,
            "image_url": product.image_url,
            "semantic_score": result.score,
            "description": product.description,
        })

    # Remove duplicate and near-duplicate variants.
    candidates = deduplicate_products(candidates)

    # Use Qwen to rank the remaining candidates by query relevance.
    results = rerank_products(
        query,
        candidates,
        limit=result_limit,
    )

    return results
