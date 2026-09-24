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