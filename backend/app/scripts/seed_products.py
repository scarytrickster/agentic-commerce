import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.database.session import AsyncSessionLocal
from app.models.product import Product


PRODUCTS = [
    Product(
        name="Nike Pegasus 41",
        description="Responsive daily running shoe for road running.",
        price=Decimal("4799.00"),
        category="Running Shoes",
        stock=25,
    ),
    Product(
        name="Adidas Runfalcon 5",
        description="Lightweight running shoe for everyday training.",
        price=Decimal("3499.00"),
        category="Running Shoes",
        stock=30,
    ),
    Product(
        name="ASICS Gel-Contend 9",
        description="Comfortable running shoe with cushioning for daily runs.",
        price=Decimal("3999.00"),
        category="Running Shoes",
        stock=20,
    ),
    Product(
        name="Adidas Running Socks",
        description="Breathable cushioned socks designed for running.",
        price=Decimal("399.00"),
        category="Accessories",
        stock=50,
    ),
    Product(
        name="Nike Dri-FIT Running Socks",
        description="Moisture-wicking socks for running and training.",
        price=Decimal("499.00"),
        category="Accessories",
        stock=40,
    ),
    Product(
        name="Running Waist Bag",
        description="Compact waist bag for carrying keys, phone, and cards.",
        price=Decimal("799.00"),
        category="Accessories",
        stock=15,
    ),
]


async def seed_products() -> None:
    async with AsyncSessionLocal() as session:
        existing_products = await session.execute(select(Product))

        if existing_products.scalars().first():
            print("Products already exist. Skipping seed.")
            return

        session.add_all(PRODUCTS)
        await session.commit()

        print(f"Seeded {len(PRODUCTS)} products.")


if __name__ == "__main__":
    asyncio.run(seed_products())