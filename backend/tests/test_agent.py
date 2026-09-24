import pytest

from app.agent.agent import run_agent
from app.database.session import AsyncSessionLocal


@pytest.mark.asyncio
async def test_agent_can_search_products():
    async with AsyncSessionLocal() as db:
        result = await run_agent(
            db=db,
            user_message="Find me running shoes under 4000",
        )

    print("\nAGENT RESULT:")
    print(result)

    assert result
    assert "products" in result
    assert result["products"]