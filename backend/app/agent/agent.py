import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools import (
    cross_sell_products_tool,
    search_products_tool,
)
from app.core.config import settings
from app.llm.client import client
from app.llm.tools import (
    cross_sell_definition,
    search_products_definition,
)


async def run_agent(
    db: AsyncSession,
    user_message: str,
):
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful shopping assistant. "
                "Use the search_products tool when the user is "
                "looking for products or recommendations. "
                "Use the get_cross_sell_products tool when the user "
                "asks for complementary or related products. "
                "After receiving tool results, explain the relevant "
                "products clearly and concisely. "
                "Only state facts that are present in the tool results "
                "or directly provided by the user. "
                "Do not invent product features, specifications, "
                "availability, shipping information, ratings, reviews, "
                "or other product details. "
                "If the tool does not provide a piece of information, "
                "say that the information is not available."
            ),
        },
        {
            "role": "user",
            "content": user_message,
        },
    ]

    response = await client.chat.completions.create(
        model=settings.openrouter_model,
        messages=messages,
        tools=[
            search_products_definition,
            cross_sell_definition,
        ],
        tool_choice="auto",
    )

    message = response.choices[0].message

    if not message.tool_calls:
        return message.content

    tool_call = message.tool_calls[0]

    arguments = json.loads(tool_call.function.arguments)

    if tool_call.function.name == "search_products":
        intent, products = await search_products_tool(
            db=db,
            query=arguments["query"],
        )

        tool_result = {
            "intent": intent.model_dump(mode="json"),
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "price": str(product.price),
                    "category": product.category,
                    "stock": product.stock,
                }
                for product in products
            ],
        }

    elif tool_call.function.name == "get_cross_sell_products":
        products = await cross_sell_products_tool(
            db=db,
            category=arguments["category"],
        )

        tool_result = {
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "price": str(product.price),
                    "category": product.category,
                    "stock": product.stock,
                }
                for product in products
            ],
        }

    else:
        return "I don't know how to handle that request."

    messages.append(message.model_dump())

    messages.append(
        {
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(tool_result),
        }
    )

    final_response = await client.chat.completions.create(
        model=settings.openrouter_model,
        messages=messages,
    )

    return final_response.choices[0].message.content