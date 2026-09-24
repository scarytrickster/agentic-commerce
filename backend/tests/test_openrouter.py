import pytest

from app.core.config import settings
from app.llm.client import client


@pytest.mark.asyncio
async def test_openrouter_connection():
    response = await client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[
            {
                "role": "user",
                "content": "Reply with exactly: OpenRouter works",
            }
        ],
    )

    print(response.choices[0].message.content)

    assert response.choices[0].message.content