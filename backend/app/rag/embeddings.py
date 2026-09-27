from fastembed import TextEmbedding


MODEL_NAME = "BAAI/bge-small-en-v1.5"

embedding_model = TextEmbedding(
    model_name=MODEL_NAME,
)


def embed_text(text: str) -> list[float]:
    vector = next(
        embedding_model.embed([text])
    )

    return vector.tolist()