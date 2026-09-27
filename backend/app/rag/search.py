from app.rag.embeddings import embed_text
from app.rag.qdrant import COLLECTION_NAME, client


def search_products(query: str, limit: int = 5):
    query_vector = embed_text(query)

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=limit,
        with_payload=True,
    )

    return results.points