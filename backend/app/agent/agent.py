import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools import search_products_tool
from app.llm.client import client
from app.llm.tools import search_products_definition
from app.core.config import settings


async def run_agent(
    db: AsyncSession,
    user_message: str,
):
    response = await client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a shopping assistant. "
                    "Use the search_products tool when the user is "
                    "looking for products or recommendations."
                ),
            },
            {
                "role": "user",
                "content": user_message,
            },
        ],
        tools=[search_products_definition],
        tool_choice="auto",
    )

    message = response.choices[0].message

    if not message.tool_calls:
        return message.content

    tool_call = message.tool_calls[0]

    if tool_call.function.name != "search_products":
        return "I don't know how to handle that request."

    arguments = json.loads(tool_call.function.arguments)

    intent, products = await search_products_tool(
        db=db,
        query=arguments["query"],
    )

    return {
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