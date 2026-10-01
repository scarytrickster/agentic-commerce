from app.rag.qwen_reranker import rerank_products


def test_qwen_reranker():
    query = "accessories for my gaming laptop"

    candidates = [
        {
            "id": 1,
            "name": "Gaming Mouse Pad",
            "category": "electronics",
            "description": "Large mouse pad designed for gaming laptops and gaming setups.",
            "price": "999",
            "stock": 20,
            "image_url": None,
        },
        {
            "id": 2,
            "name": "Laptop Backpack",
            "category": "bags",
            "description": "Durable backpack with a padded laptop compartment and accessory storage.",
            "price": "1999",
            "stock": 15,
            "image_url": None,
        },
        {
            "id": 3,
            "name": "Running Shoes",
            "category": "running shoes",
            "description": "Lightweight running shoes for everyday jogging and exercise.",
            "price": "2999",
            "stock": 10,
            "image_url": None,
        },
    ]

    results = rerank_products(
        query,
        candidates,
        limit=3,
    )

    assert len(results) == 3

    names = [product["name"] for product in results]

    assert "Gaming Mouse Pad" in names
    assert "Laptop Backpack" in names

    for product in results:
        assert "rerank_score" in product
