import pytest

from app.agent.agent import run_agent
from app.database.session import AsyncSessionLocal


@pytest.mark.asyncio
async def test_agent_returns_cross_sell_products():
    async with AsyncSessionLocal() as db:
        result = await run_agent(
            db=db,
            user_message="running shoes under 4000",
        )

    print("\nCROSS-SELL AGENT RESULT:")
    print(result)

    assert result
    assert isinstance(result, dict)

    assert result["response"]
    assert result["products"]
    assert result["cross_sell_products"]

    assert all(
        product["category"] == "Running Shoes"
        for product in result["products"]
    )

    assert all(
        product["category"] == "Accessories"
        for product in result["cross_sell_products"]
    )