
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.models.product import Product


async def create_order(
    db: AsyncSession,
    user_id: int,
    items: list[dict],
) -> Order:
    if not items:
        raise ValueError("Order must contain at least one item")

    product_ids = [item["product_id"] for item in items]

    if len(product_ids) != len(set(product_ids)):
        raise ValueError("Duplicate products are not allowed")

    result = await db.execute(
        select(Product)
        .where(Product.id.in_(product_ids))
        .with_for_update()
    )
    products = result.scalars().all()
    products_by_id = {product.id: product for product in products}

    order_items = []
    total = Decimal("0.00")

    for item in items:
        product = products_by_id.get(item["product_id"])
        quantity = item["quantity"]

        if product is None:
            raise ValueError(f"Product {item['product_id']} not found")

        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero")

        if product.stock < quantity:
            raise ValueError(f"Insufficient stock for {product.name}")

        unit_price = product.price
        total += unit_price * quantity

        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                unit_price=unit_price,
                quantity=quantity,
            )
        )

    order = Order(
        user_id=user_id,
        total_amount=total,
        status="pending",
        payment_status="pending",
        items=order_items,
    )

    db.add(order)

    try:
        await db.commit()

        result = await db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order.id)
        )

        return result.scalar_one()

    except Exception:
        await db.rollback()
        raise
