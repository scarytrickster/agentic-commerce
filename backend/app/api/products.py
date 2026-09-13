from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse, RecommendationResponse
from app.services.product_recommendation import recommend_products


router = APIRouter(
    prefix="/products",
    tags=["Products"],
)

@router.get(
    "/recommendations",
    response_model=RecommendationResponse,
)
async def get_recommendations(
    query: str | None = Query(default=None, min_length=1),
    category: str | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    in_stock: bool = True,
    limit: int = Query(default=5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    products = await recommend_products(
        db=db,
        query=query,
        category=category,
        min_price=min_price,
        max_price=max_price,
        in_stock=in_stock,
        limit=limit,
    )

    return RecommendationResponse(
        query=query,
        results=products,
    )


@router.get("", response_model=list[ProductResponse])
async def get_products(
    category: str | None = Query(default=None),
    max_price: Decimal | None = Query(default=None, gt=0),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product)

    if category:
        query = query.where(Product.category == category)

    if max_price is not None:
        query = query.where(Product.price <= max_price)

    result = await db.execute(query)

    return result.scalars().all()