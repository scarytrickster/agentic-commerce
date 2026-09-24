import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools import shopping_search_tool
from app.core.config import settings
from app.llm.client import client
from app.llm.tools import shopping_search_definition


async def run_agent(
    db: AsyncSession,
    user_message: str,
):
    messages = [
        {
            "role": "system",
           "content": (
                "You are a helpful shopping assistant. "
                "Use the shopping_search tool when the user is looking for "
                "products or recommendations. "
                "It returns matching products and relevant complementary "
                "products. "
                "If the tool returns cross_sell_products, present them separately "
                "as optional complementary products. "
                "Do not imply that the user has selected, added, or agreed to "
                "purchase any complementary product. "
                "Ask whether the user wants to add any of them. "
                "After receiving tool results, explain the products clearly "
                "and concisely. "
                "Only state facts explicitly present in the tool results or "
                "directly provided by the user. "
                "Never infer or assume product features, specifications, quality, "
                "brand characteristics, ratings, reviews, shipping information, "
                "or other product details. "
                "Do not describe a product as premium, budget-friendly, better, "
                "cheaper, higher quality, or similar unless the tool results "
                "explicitly support that statement. "
                "Preserve the currency and prices exactly as provided by the "
                "tool results. "
                "Do not convert ₹ to another currency. "
                "If information is not available in the tool results, "
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
            shopping_search_definition,
        ],
        tool_choice="auto",
    )

    message = response.choices[0].message

    if not message.tool_calls:
        return message.content

    tool_call = message.tool_calls[0]

    if tool_call.function.name != "shopping_search":
        return "I don't know how to handle that request."

    arguments = json.loads(tool_call.function.arguments)

    result = await shopping_search_tool(
        db=db,
        query=arguments["query"],
    )

    tool_result = {
        "intent": result["intent"].model_dump(mode="json"),
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "price": str(product.price),
                "category": product.category,
                "stock": product.stock,
            }
            for product in result["products"]
        ],
        "cross_sell_products": [
            {
                "id": product.id,
                "name": product.name,
                "price": str(product.price),
                "category": product.category,
                "stock": product.stock,
            }
            for product in result["cross_sell_products"]
        ],
    }

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