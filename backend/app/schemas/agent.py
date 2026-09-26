from decimal import Decimal

from pydantic import BaseModel, Field


class AgentRequest(BaseModel):
    message: str = Field(min_length=1)


class AgentProduct(BaseModel):
    id: int
    name: str
    price: Decimal
    category: str
    stock: int
    image_url: str | None


class AgentResponse(BaseModel):
    response: str
    products: list[AgentProduct]
    cross_sell_products: list[AgentProduct]