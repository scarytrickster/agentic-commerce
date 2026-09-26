import json
from decimal import Decimal
from pathlib import Path

from sqlalchemy import delete

from app.database.session import AsyncSessionLocal
from app.models.product import Product


DATASET_FILE = Path(
    "../dataset/abo/selected_products_with_images.json"
)


PRICE_RANGES = {
    "Running Shoes": [2499, 2999, 3499, 3999, 4499, 4999],
    "Clothing": [799, 999, 1299, 1499, 1799, 1999],
    "Electronics": [1499, 1999, 2499, 2999, 3499, 3999],
    "Bags & Accessories": [599, 799, 999, 1299, 1599, 1999],
    "Wearables": [1999, 2499, 2999, 3499, 3999, 4499],
    "Home & Lifestyle": [699, 999, 1299, 1599, 1999, 2499],
}


def load_products():
    with DATASET_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def create_description(product):
    brand = product.get("brand")
    product_type = product.get("product_type")

    parts = []

    if brand:
        parts.append(f"Brand: {brand}")

    if product_type:
        parts.append(f"Product type: {product_type}")

    return " • ".join(parts) if parts else None


async def seed():
    products = load_products()

    print(f"Dataset products loaded: {len(products)}")

    async with AsyncSessionLocal() as db:
        # Remove existing demo products
        await db.execute(delete(Product))

        for index, product in enumerate(products):
            category = product["category"]

            prices = PRICE_RANGES[category]
            price = prices[index % len(prices)]

            db_product = Product(
                name=product["name"],
                description=create_description(product),
                price=Decimal(str(price)),
                category=category,
                stock=10 + (index % 21),
                image_url=product["image_url"],
            )

            db.add(db_product)

        await db.commit()

    print()
    print("==============================")
    print("DATABASE SEED COMPLETE")
    print("==============================")
    print(f"Products inserted: {len(products)}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(seed()) 