from typing import TypedDict


class AgentState(TypedDict):
    messages: list[dict]
    products: list[dict]
    cross_sell_products: list[dict]
    response: str