from sqlalchemy.ext.asyncio import AsyncSession

from app.services.product_recommendation import recommend_products
from app.services.query_parser import parse_shopping_query


async def search_products_from_text(
    db: AsyncSession,
    text: str,
):
    intent = parse_shopping_query(text)

    products = await recommend_products(
        db=db,
        query=intent.query,
        category=intent.category,
        min_price=intent.min_price,
        max_price=intent.max_price,
        in_stock=intent.in_stock,
        limit=intent.limit,
    )

    return intent, products