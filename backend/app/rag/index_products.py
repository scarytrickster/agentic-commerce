import asyncio

from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
)
from sqlalchemy import select

from app.database.session import AsyncSessionLocal
from app.models.product import Product
from app.rag.embeddings import embedding_model
from app.rag.qdrant import COLLECTION_NAME, client


BATCH_SIZE = 64


def build_product_text(product: Product) -> str:
    parts = [
        f"Product: {product.name}",
        f"Category: {product.category}",
    ]

    if product.description:
        parts.append(
            f"Description: {product.description}"
        )

    return "\n".join(parts)


async def load_products():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Product)
        )

        return result.scalars().all()


async def index_products():
    products = await load_products()

    print(
        f"Products loaded from PostgreSQL: "
        f"{len(products)}"
    )

    if not products:
        print("No products found.")
        return

    # Create or recreate the collection.
    if client.collection_exists(COLLECTION_NAME):
        print(
            f"Deleting existing collection: "
            f"{COLLECTION_NAME}"
        )

        client.delete_collection(
            COLLECTION_NAME
        )

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=384,
            distance=Distance.COSINE,
        ),
    )

    print(
        f"Created Qdrant collection: "
        f"{COLLECTION_NAME}"
    )

    for start in range(
        0,
        len(products),
        BATCH_SIZE,
    ):
        batch = products[
            start:start + BATCH_SIZE
        ]

        texts = [
            build_product_text(product)
            for product in batch
        ]

        vectors = list(
            embedding_model.embed(texts)
        )

        points = []

        for product, vector in zip(
            batch,
            vectors,
        ):
            points.append(
                PointStruct(
                    id=product.id,
                    vector=vector.tolist(),
                    payload={
                        "product_id": product.id,
                        "name": product.name,
                        "category": product.category,
                        "price": str(product.price),
                        "stock": product.stock,
                        "image_url": product.image_url,
                    },
                )
            )

        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points,
        )

        print(
            f"Indexed "
            f"{min(start + BATCH_SIZE, len(products))}"
            f"/{len(products)} products"
        )

    print()
    print("==============================")
    print("QDRANT INDEXING COMPLETE")
    print("==============================")

    info = client.get_collection(
        COLLECTION_NAME
    )

    print(
        f"Vectors stored: "
        f"{info.points_count}"
    )


if __name__ == "__main__":
    asyncio.run(index_products())