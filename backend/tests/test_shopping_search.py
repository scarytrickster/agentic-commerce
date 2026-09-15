import asyncio

from app.database.session import AsyncSessionLocal
from app.services.shopping_search import search_products_from_text


async def main():
    shopping_query = "running shoes"

    async with AsyncSessionLocal() as db:
        intent, products = await search_products_from_text(
            db=db,
            text=shopping_query,
        )

        print("\nParsed intent:")
        print(intent)

        print("\nRecommended products:")
        for product in products:
            print(
                f"- {product.name} | "
                f"₹{product.price} | "
                f"{product.category}"
            )


if __name__ == "__main__":
    asyncio.run(main())