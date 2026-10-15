from decimal import Decimal

from pydantic import BaseModel, Field


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)


class CartItemResponse(BaseModel):
    product_id: int
    product_name: str
    price: Decimal
    quantity: int
    subtotal: Decimal


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total_amount: Decimal