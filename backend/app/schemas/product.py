from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: Decimal
    category: str
    stock: int

    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    query: str | None
    results: list[ProductResponse]