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

async def get_products_by_ids(
    db: AsyncSession,
    product_ids: list[int],
    category: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    in_stock: bool = True,
) -> list[Product]:
    if not product_ids:
        return []

    statement = select(Product).where(
        Product.id.in_(product_ids)
    )

    if category:
        category_term = f"%{category.strip()}%"
        statement = statement.where(
            Product.category.ilike(category_term)
        )

    if min_price is not None:
        statement = statement.where(
            Product.price >= min_price
        )

    if max_price is not None:
        statement = statement.where(
            Product.price <= max_price
        )

    if in_stock:
        statement = statement.where(
            Product.stock > 0
        )

    result = await db.execute(statement)

    products = list(result.scalars().all())

    # Restore Qdrant's relevance order
    product_map = {
        product.id: product
        for product in products
    }

    return [
        product_map[product_id]
        for product_id in product_ids
        if product_id in product_map
    ]