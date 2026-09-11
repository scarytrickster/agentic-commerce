"""Schemas for orders."""

from pydantic import BaseModel

from app.schemas.cart import CartItem


class OrderCreate(BaseModel):
    items: list[CartItem]


class OrderResponse(OrderCreate):
    id: int
    status: str
