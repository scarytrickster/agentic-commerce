from fastembed import TextEmbedding

from app.rag.qdrant import COLLECTION_NAME, client


MODEL_NAME = "jinaai/jina-embeddings-v3"

embedding_model = TextEmbedding(
    model_name=MODEL_NAME
)


def search_products(
    query: str,
    limit: int = 5,
):
    query_vector = next(
        embedding_model.query_embed([query])
    )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector.tolist(),
        limit=limit,
        with_payload=True,
    )

    return results.points