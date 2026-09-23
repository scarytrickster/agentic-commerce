from sqlalchemy.ext.asyncio import AsyncSession

from app.services.shopping_search import search_products_from_text


async def search_products_tool(
    db: AsyncSession,
    query: str,
):
    return await search_products_from_text(
        db=db,
        text=query,
    )