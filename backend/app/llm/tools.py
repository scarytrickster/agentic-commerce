search_products_definition = {
    "type": "function",
    "function": {
        "name": "search_products",
        "description": (
            "Search the product catalog based on a user's shopping request. "
            "Use this when the user is looking for products, wants recommendations, "
            "or provides shopping criteria such as category or price."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "The user's natural-language product search request, "
                        "for example 'comfortable running shoes under 4000'."
                    ),
                }
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
}

cross_sell_definition = {
    "type": "function",
    "function": {
        "name": "get_cross_sell_products",
        "description": (
            "Find complementary products for a product category. "
            "Use this when the user has selected or is considering "
            "a product and relevant additional products may be useful."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "description": (
                        "The category of the product the user is "
                        "considering, for example 'running shoes'."
                    ),
                }
            },
            "required": ["category"],
            "additionalProperties": False,
        },
    },
}

shopping_search_definition = {
    "type": "function",
    "function": {
        "name": "shopping_search",
        "description": (
            "Search for products based on the user's shopping request "
            "and return relevant complementary products when available."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "The user's complete shopping request, "
                        "for example 'running shoes under 4000'."
                    ),
                }
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
}