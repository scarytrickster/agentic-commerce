from sqlalchemy.ext.asyncio import AsyncSession
from langfuse.langchain import CallbackHandler

from app.agent.context import AgentContext
from app.agent.graph import SYSTEM_PROMPT, graph


async def run_agent(db: AsyncSession, user_message: str):
    initial_state = {
        "messages": [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": user_message,
            },
        ],
        "products": [],
        "cross_sell_products": [],
        "response": "",
    }

    langfuse_handler = CallbackHandler()

    result = await graph.ainvoke(
        initial_state,
        context=AgentContext(db=db),
        config={
            "callbacks": [langfuse_handler],
        },
    )

    return {
        "response": result["response"],
        "products": result["products"],
        "cross_sell_products": result["cross_sell_products"],
    }