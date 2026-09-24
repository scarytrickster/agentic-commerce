from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product


CROSS_SELL_CATEGORIES = {
    "running shoes": ["Accessories"],
}


async def get_cross_sell_products(
    db: AsyncSession,
    category: str,
    limit: int = 3,
) -> list[Product]:
    related_categories = CROSS_SELL_CATEGORIES.get(
        category.strip().lower(),
        [],
    )

    if not related_categories:
        return []

    statement = (
        select(Product)
        .where(
            Product.category.in_(related_categories),
            Product.stock > 0,
        )
        .order_by(Product.id.desc())
        .limit(limit)
    )

    result = await db.execute(statement)

    return list(result.scalars().all())