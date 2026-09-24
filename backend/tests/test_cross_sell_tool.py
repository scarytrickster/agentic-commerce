import pytest

from app.agent.tools import cross_sell_products_tool
from app.database.session import AsyncSessionLocal


@pytest.mark.asyncio
async def test_cross_sell_products_tool():
    async with AsyncSessionLocal() as db:
        products = await cross_sell_products_tool(
            db=db,
            category="running shoes",
        )

    assert products
    assert all(product.category == "Accessories" for product in products)
    assert all(product.stock > 0 for product in products)