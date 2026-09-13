from decimal import Decimal

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product


async def recommend_products(
    db: AsyncSession,
    query: str | None = None,
    category: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    in_stock: bool = True,
    limit: int = 5,
) -> list[Product]:

    statement = select(Product)
    filters = []

    if query:
        search_term = f"%{query.strip()}%"

        filters.append(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.category.ilike(search_term),
            )
        )

    if category:
        category_term = f"%{category.strip()}%"

        filters.append(
            Product.category.ilike(category_term)
        )

    if min_price is not None:
        filters.append(Product.price >= min_price)

    if max_price is not None:
        filters.append(Product.price <= max_price)

    if in_stock:
        filters.append(Product.stock > 0)

    if filters:
        statement = statement.where(*filters)

    statement = (
        statement
        .order_by(Product.id.desc())
        .limit(limit)
    )

    result = await db.execute(statement)

    return list(result.scalars().all())