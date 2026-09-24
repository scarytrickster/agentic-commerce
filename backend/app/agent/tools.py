from sqlalchemy.ext.asyncio import AsyncSession

from app.services.shopping_search import search_products_from_text
from app.services.cross_sell import get_cross_sell_products


async def search_products_tool(
    db: AsyncSession,
    query: str,
):
    return await search_products_from_text(
        db=db,
        text=query,
    )

async def cross_sell_products_tool(
    db: AsyncSession,
    category: str,
):
    return await get_cross_sell_products(
        db=db,
        category=category,
    )