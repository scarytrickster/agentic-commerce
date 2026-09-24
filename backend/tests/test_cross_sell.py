import pytest

from app.database.session import AsyncSessionLocal
from app.services.cross_sell import get_cross_sell_products


@pytest.mark.asyncio
async def test_cross_sell_running_shoes():
    async with AsyncSessionLocal() as db:
        products = await get_cross_sell_products(
            db=db,
            category="running shoes",
        )

    assert products
    assert all(product.category == "Accessories" for product in products)
    assert all(product.stock > 0 for product in products)