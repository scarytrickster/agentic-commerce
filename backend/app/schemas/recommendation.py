"""Schemas for product recommendations."""

from pydantic import BaseModel


class Recommendation(BaseModel):
    product_id: int
    score: float | None = None
    reason: str | None = None


class RecommendationResponse(BaseModel):
    recommendations: list[Recommendation]
