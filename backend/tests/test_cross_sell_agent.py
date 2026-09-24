import pytest

from app.agent.agent import run_agent
from app.database.session import AsyncSessionLocal


@pytest.mark.asyncio
async def test_agent_can_find_cross_sell_products():
    async with AsyncSessionLocal() as db:
        result = await run_agent(
            db=db,
            user_message="What accessories go well with running shoes?",
        )

    print("\nCROSS-SELL AGENT RESULT:")
    print(result)

    assert result
    assert isinstance(result, str)
    assert "Accessories" in result or "accessories" in result