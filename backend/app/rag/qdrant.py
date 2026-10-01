from pathlib import Path

from qdrant_client import QdrantClient


BACKEND_DIR = Path(__file__).resolve().parents[2]
QDRANT_PATH = BACKEND_DIR / "qdrant_data"

client = QdrantClient(
    path=str(QDRANT_PATH),
)

COLLECTION_NAME = "products_jina"

def close_qdrant():
    client.close()