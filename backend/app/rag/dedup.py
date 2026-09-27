import re


def normalize_product_name(name: str) -> str:
    """Normalize a product name for duplicate detection."""

    name = name.lower()

    # Remove renewed label
    name = re.sub(r"\(renewed\)", "", name)

    # Remove pack/quantity information
    name = re.sub(
        r"\b\d+[- ]?(pack|pcs|pieces)\b",
        "",
        name,
    )

    # Remove punctuation
    name = re.sub(r"[^a-z0-9\s]", " ", name)

    # Normalize whitespace
    name = re.sub(r"\s+", " ", name).strip()

    return name


def deduplicate_products(products: list[dict]) -> list[dict]:
    """
    Remove obvious duplicate products.

    Keeps the first occurrence because Qdrant results
    are already ordered by semantic relevance.
    """

    seen = set()
    unique_products = []

    for product in products:
        normalized_name = normalize_product_name(product["name"])

        if normalized_name in seen:
            continue

        seen.add(normalized_name)
        unique_products.append(product)

    return unique_products