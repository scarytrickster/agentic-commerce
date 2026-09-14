from decimal import Decimal
from pydantic import BaseModel, Field

class ShoppingIntent(BaseModel):
    query: str | None = None
    category: str | None = None
    min_price: Decimal | None = Field(default=None, ge=0)
    max_price: Decimal | None = Field(default=None, ge=0)
    in_stock: bool = True
    limit: int = Field(default=5, ge=1, le=20)