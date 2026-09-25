from langgraph.graph import END, START, StateGraph
from langgraph.runtime import Runtime
import json

from app.agent.tools import shopping_search_tool
from app.agent.context import AgentContext
from app.agent.state import AgentState
from app.core.config import settings
from app.llm.client import client
from app.llm.tools import shopping_search_definition


SYSTEM_PROMPT = (
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
)


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
    response = await client.chat.completions.create(
        model=settings.openrouter_model,
        messages=state["messages"],
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
