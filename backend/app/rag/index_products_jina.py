from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.product import Product

from fastembed import TextEmbedding
from qdrant_client import QdrantClient, models


MODEL_NAME = "jinaai/jina-embeddings-v3"
COLLECTION_NAME = "products_jina"

embedding_model = TextEmbedding(model_name=MODEL_NAME)

qdrant = QdrantClient(path="qdrant_data")


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Product))
        products = list(result.scalars().all())

    print(f"Products loaded from PostgreSQL: {len(products)}")

    if qdrant.collection_exists(COLLECTION_NAME):
        print(f"Deleting existing collection: {COLLECTION_NAME}")
        qdrant.delete_collection(COLLECTION_NAME)

    qdrant.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=1024,
            distance=models.Distance.COSINE,
        ),
    )

    print(f"Created Qdrant collection: {COLLECTION_NAME}")

    batch_size = 64

    for start in range(0, len(products), batch_size):
        batch = products[start:start + batch_size]

        texts = [
            (
                f"Product: {product.name}\n"
                f"Category: {product.category}\n"
                f"Description: {(product.description or '')[:800]}"
            )
            for product in batch
        ]

        vectors = list(
            embedding_model.passage_embed(
                texts,
                batch_size=4,
            )
        )

        points = []

        for product, vector in zip(batch, vectors):
            points.append(
                models.PointStruct(
                    id=product.id,
                    vector=vector.tolist(),
                    payload={
                        "product_id": product.id,
                        "name": product.name,
                        "category": product.category,
                        "description": product.description,
                        "price": str(product.price),
                        "stock": product.stock,
                        "image_url": product.image_url,
                    },
                )
            )

        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=points,
        )

        print(
            f"Indexed "
            f"{min(start + batch_size, len(products))}"
            f"/{len(products)}"
        )

    print("\nJINA INDEXING COMPLETE")
    print(f"Vectors stored: {len(products)}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())