from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    unit_price: float
    quantity: int


class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    payment_status: str
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}
