from sqlalchemy.ext.asyncio import AsyncSession

from app.services.cross_sell import get_cross_sell_products
from app.services.shopping_search import search_products_from_text


async def get_shopping_results(
    db: AsyncSession,
    query: str,
):
    intent, products = await search_products_from_text(
        db=db,
        text=query,
    )

    cross_sell_products = []

    if products:
        category = products[0].category

        cross_sell_products = await get_cross_sell_products(
            db=db,
            category=category,
        )

    return {
        "intent": intent,
        "products": products,
        "cross_sell_products": cross_sell_products,
    }