"""Schemas for shopping carts."""

from pydantic import BaseModel


class CartItem(BaseModel):
    product_id: int
    quantity: int = 1


class Cart(BaseModel):
    items: list[CartItem] = []
