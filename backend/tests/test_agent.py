import pytest

from app.agent.agent import run_agent
from app.database.session import AsyncSessionLocal


@pytest.mark.asyncio
async def test_agent_can_search_products():
    async with AsyncSessionLocal() as db:
        result = await run_agent(
            db=db,
            user_message="running shoes under 4000",
        )

    assert result
    assert isinstance(result, dict)

    assert result["response"]

    assert result["products"]
    assert result["cross_sell_products"]

    product_names = [
        product["name"]
        for product in result["products"]
    ]

    assert "ASICS Gel-Contend 9" in product_names
    assert "Adidas Runfalcon 5" in product_names

    cross_sell_names = [
        product["name"]
        for product in result["cross_sell_products"]
    ]

    assert "Running Waist Bag" in cross_sell_names