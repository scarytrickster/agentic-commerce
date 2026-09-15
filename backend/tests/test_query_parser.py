from decimal import Decimal

from app.services.query_parser import parse_shopping_query


def test_running_shoes_with_max_price():
    intent = parse_shopping_query(
        "comfortable running shoes under 4000"
    )

    assert intent.query == "comfortable"
    assert intent.category == "running shoes"
    assert intent.min_price is None
    assert intent.max_price == Decimal("4000")
    assert intent.in_stock is True
    assert intent.limit == 5


def test_accessories_with_max_price():
    intent = parse_shopping_query(
        "accessories under 1000"
    )

    assert intent.query is None
    assert intent.category == "accessories"
    assert intent.max_price == Decimal("1000")


def test_shoes_without_price():
    intent = parse_shopping_query("running shoes")

    assert intent.query is None
    assert intent.category == "running shoes"
    assert intent.min_price is None
    assert intent.max_price is None


def test_minimum_price():
    intent = parse_shopping_query("products above 500")

    assert intent.query == "products"
    assert intent.min_price == Decimal("500")
    assert intent.max_price is None