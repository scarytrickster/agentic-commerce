from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse


router = APIRouter(
    prefix="/products",
    tags=["Products"],
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