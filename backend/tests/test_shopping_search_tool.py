import pytest

from app.agent.tools import shopping_search_tool
from app.database.session import AsyncSessionLocal


@pytest.mark.asyncio
async def test_shopping_search_tool():
    async with AsyncSessionLocal() as db:
        result = await shopping_search_tool(
            db=db,
            query="running shoes under 4000",
        )

    assert result["products"]
    assert result["cross_sell_products"]

    assert all(
        product.category == "Running Shoes"
        for product in result["products"]
    )

    assert all(
        product.category == "Accessories"
        for product in result["cross_sell_products"]
    )