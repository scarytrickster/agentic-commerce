import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings


@pytest.mark.asyncio
async def test_database_connection():
    engine = create_async_engine(settings.database_url)

    async with engine.connect() as connection:
        result = await connection.execute(text("SELECT 1"))

    assert result.scalar() == 1

    await engine.dispose()