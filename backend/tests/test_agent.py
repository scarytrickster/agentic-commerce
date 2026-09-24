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
    assert isinstance(result, str)
    normalized_result = " ".join(result.split())

    assert "ASICS Gel-Contend 9" in normalized_result
    assert "Adidas Runfalcon 5" in normalized_result
    assert "3,999" in result or "3999" in result
    assert "3,499" in result or "3499" in result