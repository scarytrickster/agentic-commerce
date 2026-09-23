import pytest

from app.agent.tools import search_products_tool
from app.database.session import AsyncSessionLocal


@pytest.mark.asyncio
async def test_search_products_tool():
    async with AsyncSessionLocal() as db:
        intent, products = await search_products_tool(
            db=db,
            query="running shoes under 4000",
        )

    assert intent.category == "running shoes"
    assert intent.max_price == 4000
    assert products