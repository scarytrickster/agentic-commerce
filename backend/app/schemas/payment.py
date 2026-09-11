"""Schemas for payment requests and results."""

from decimal import Decimal

from pydantic import BaseModel


class PaymentCreate(BaseModel):
    order_id: int
    amount: Decimal
    currency: str = "USD"


class PaymentResponse(PaymentCreate):
    id: int
    status: str
