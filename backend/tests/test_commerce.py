import pytest

from app.database.session import AsyncSessionLocal
from app.services.commerce import get_shopping_results


@pytest.mark.asyncio
async def test_get_shopping_results():
    async with AsyncSessionLocal() as db:
        result = await get_shopping_results(
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