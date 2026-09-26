
from langgraph.graph import END, START, StateGraph
from langgraph.runtime import Runtime
import json

from app.agent.tools import shopping_search_tool
from app.agent.context import AgentContext
from app.agent.state import AgentState
from app.core.config import settings
from app.llm.client import client
from app.llm.tools import shopping_search_definition


SYSTEM_PROMPT = """
You are an AI shopping assistant for an e-commerce store.

Your job is to help users find products using the available shopping search tool.

Rules:

1. Use the shopping search tool when the user is asking to find products.
2. Only use information returned by the tool or provided by the user.
3. Never invent product features, ratings, reviews, discounts, shipping details, or availability.
4. Preserve product prices exactly as returned.
5. Keep responses short and customer-friendly.
6. Do NOT explain your reasoning.
7. Do NOT describe how you verified the results.
8. Do NOT mention constraints, filters, tool calls, or system behavior.
9. Do NOT say things like "the response correctly identifies", "price compliance",
   "category accuracy", "stock verification", or "limit adherence".
10. Simply tell the customer what was found.
11. Cross-sell products may be mentioned briefly when relevant.
12. Never imply that a product has been purchased or selected.

Example:

User:
"shoes under 3000"

Good response:
"I found 4 running shoes under ₹3,000 that are currently in stock."

Bad response:
"The response correctly identifies 4 running shoes under ₹3000..."
"""


async def agent_node(
    state: AgentState,
    runtime: Runtime[AgentContext],
):
    response = await client.chat.completions.create(
        model=settings.openrouter_model,
        messages=state["messages"],
        tools=[shopping_search_definition],
        tool_choice="auto",
    )

    message = response.choices[0].message

    return {
        "messages": [message.model_dump()]
    }

def route_after_agent(state: AgentState):
    last_message = state["messages"][-1]

    if last_message.get("tool_calls"):
        return "shopping_search"

    return END

async def shopping_search_node(
    state: AgentState,
    runtime: Runtime[AgentContext],
):
    last_message = state["messages"][-1]
    tool_call = last_message["tool_calls"][0]

    arguments = json.loads(tool_call["function"]["arguments"])
    query = arguments["query"]

    result = await shopping_search_tool(
        db=runtime.context.db,
        query=query,
    )

    products = [
        {
            "id": product.id,
            "name": product.name,
            "price": str(product.price),
            "category": product.category,
            "stock": product.stock,
            "image_url": product.image_url,
        }
        for product in result["products"]
    ]

    cross_sell_products = [
        {
            "id": product.id,
            "name": product.name,
            "price": str(product.price),
            "category": product.category,
            "stock": product.stock,
            "image_url": product.image_url,
        }
        for product in result["cross_sell_products"]
    ]

    tool_result = {
        "intent": result["intent"].model_dump(mode="json"),
        "products": products,
        "cross_sell_products": cross_sell_products,
    }

    return {
        "messages": [
            {
                "role": "tool",
                "tool_call_id": tool_call["id"],
                "content": json.dumps(tool_result),
            }
        ],
        "products": products,
        "cross_sell_products": cross_sell_products,
    }

async def final_response_node(
    state: AgentState,
    runtime: Runtime[AgentContext],
):
    product_count = len(state["products"])
    cross_sell_count = len(state["cross_sell_products"])

    final_prompt = f"""
You are the final customer-facing response generator for an e-commerce shopping assistant.

The product cards are already displayed separately in the UI.

Your response must:
- Be maximum 1-2 short sentences.
- Do NOT list products.
- Do NOT mention product names.
- Do NOT mention prices.
- Do NOT mention stock counts.
- Do NOT include URLs or image links.
- Do NOT use Markdown.
- Do NOT explain your reasoning.
- Do NOT describe tool calls or search verification.
- Do NOT mention filters or system behavior.
- Simply tell the customer how many matching products were found.
- If cross-sell products exist, briefly mention that additional related products are available.

Products found: {product_count}
Related products found: {cross_sell_count}

Example:
"I found 5 watches matching your search. You can see the results below."

If there are no products:
"I couldn't find any products matching your search. Try adjusting your search."
"""

    response = await client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[
            {
                "role": "system",
                "content": final_prompt,
            }
        ],
    )

    message = response.choices[0].message

    return {
        "messages": [message.model_dump()],
        "response": message.content or "",
    }

builder = StateGraph(
    AgentState,
    context_schema=AgentContext,
)

builder.add_node("agent", agent_node)
builder.add_node("shopping_search", shopping_search_node)
builder.add_node("final_response", final_response_node)

builder.add_edge(START, "agent")


builder.add_conditional_edges(
    "agent",
    route_after_agent,
    {
        "shopping_search": "shopping_search",
        END: END,
    },
)

builder.add_edge("shopping_search", "final_response")
builder.add_edge("final_response", END)

graph = builder.compile()



if __name__ == "__main__":
    print(graph.get_graph().draw_mermaid())
