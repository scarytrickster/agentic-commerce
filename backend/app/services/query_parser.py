import re
from decimal import Decimal

from app.schemas.intent import ShoppingIntent


def parse_shopping_query(text: str) -> ShoppingIntent:
    normalized = text.strip().lower()

    query = normalized
    category = None
    min_price = None
    max_price = None

    if "running shoes" in normalized:
        category = "running shoes"
        query = query.replace("running shoes", "").strip()
    elif "shoes" in normalized:
        category = "shoes"
        query = query.replace("shoes", "").strip()
    elif "accessories" in normalized:
        category = "accessories"
        query = query.replace("accessories", "").strip()

    price_match = re.search(
        r"(?:under|below|less than|upto|up to)\s*[₹rs.]?\s*([\d,]+)",
        normalized,
    )

    if price_match:
        price_value = price_match.group(1).replace(",", "")
        max_price = Decimal(price_value)

    min_price_match = re.search(
        r"(?:above|over|more than)\s*[₹rs.]?\s*([\d,]+)",
        normalized,
    )

    if min_price_match:
        price_value = min_price_match.group(1).replace(",", "")
        min_price = Decimal(price_value)

    query = re.sub(
        r"(?:under|below|less than|upto|up to|above|over|more than)"
        r"\s*[₹rs.]?\s*[\d,]+",
        "",
        query,
    )

    query = re.sub(r"\s+", " ", query).strip()

    query = re.sub(
        r"^(show me|show|find me|find|looking for|i want|give me)\s+",
        "",
        query,
    ).strip()

    query = re.sub(
        r"\b(products|product|items|item|things)\b",
        "",
        query,
    )

    query = re.sub(r"\s+", " ", query).strip()

    if not query:
        query = None

    return ShoppingIntent(
        query=query,
        category=category,
        min_price=min_price,
        max_price=max_price,
    )