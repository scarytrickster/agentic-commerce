
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartItemResponse, CartResponse


async def get_or_create_cart(
    db: AsyncSession, user_id: int
) -> Cart:
    result = await db.execute(
        select(Cart)
        .options(
            selectinload(Cart.items).joinedload(CartItem.product)
        )
        .where(Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()

    if cart is None:
        cart = Cart(user_id=user_id)
        db.add(cart)
        await db.commit()

        result = await db.execute(
            select(Cart)
            .options(
                selectinload(Cart.items).joinedload(CartItem.product)
            )
            .where(Cart.user_id == user_id)
        )
        cart = result.scalar_one()

    return cart


def build_cart_response(cart: Cart) -> CartResponse:
    items = [
        CartItemResponse(
            product_id=item.product_id,
            product_name=item.product.name,
            price=item.product.price,
            quantity=item.quantity,
            subtotal=item.product.price * item.quantity,
        )
        for item in cart.items
    ]

    total = sum(
        (item.subtotal for item in items),
        Decimal("0.00"),
    )

    return CartResponse(items=items, total_amount=total)


async def add_item_to_cart(
    db: AsyncSession,
    user_id: int,
    product_id: int,
    quantity: int,
) -> CartResponse:
    if quantity <= 0:
        raise ValueError("Quantity must be greater than zero.")

    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .with_for_update()
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise ValueError("Product not found.")

    cart = await get_or_create_cart(db, user_id)

    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
        )
    )
    cart_item = result.scalar_one_or_none()

    new_quantity = quantity
    if cart_item is not None:
        new_quantity += cart_item.quantity

    if new_quantity > product.stock:
        raise ValueError("Requested quantity exceeds available stock.")

    if cart_item is None:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity,
        )
        db.add(cart_item)
    else:
        cart_item.quantity = new_quantity

    await db.commit()

    cart = await get_or_create_cart(db, user_id)
    return build_cart_response(cart)


async def update_cart_item(
    db: AsyncSession,
    user_id: int,
    product_id: int,
    quantity: int,
) -> CartResponse:
    if quantity <= 0:
        raise ValueError("Quantity must be greater than zero.")

    cart = await get_or_create_cart(db, user_id)

    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise ValueError("Product not found.")

    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
        )
    )
    cart_item = result.scalar_one_or_none()

    if cart_item is None:
        raise ValueError("Item not found in cart.")

    if quantity > product.stock:
        raise ValueError("Requested quantity exceeds available stock.")

    cart_item.quantity = quantity
    await db.commit()

    cart = await get_or_create_cart(db, user_id)
    return build_cart_response(cart)


async def remove_cart_item(
    db: AsyncSession,
    user_id: int,
    product_id: int,
) -> CartResponse:
    cart = await get_or_create_cart(db, user_id)

    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
        )
    )
    cart_item = result.scalar_one_or_none()

    if cart_item is None:
        raise ValueError("Item not found in cart.")

    await db.delete(cart_item)
    await db.commit()

    cart = await get_or_create_cart(db, user_id)
    return build_cart_response(cart)



async def update_cart_item(
    db: AsyncSession,
    user_id: int,
    product_id: int,
    quantity: int,
) -> CartResponse:
    if quantity <= 0:
        raise ValueError("Quantity must be greater than zero.")

    cart = await get_or_create_cart(db, user_id)

    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise ValueError("Product not found.")

    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
        )
    )
    cart_item = result.scalar_one_or_none()

    if cart_item is None:
        raise ValueError("Item not found in cart.")

    if quantity > product.stock:
        raise ValueError("Requested quantity exceeds available stock.")

    cart_item.quantity = quantity
    await db.commit()

    cart = await get_or_create_cart(db, user_id)
    return build_cart_response(cart)


async def remove_cart_item(
    db: AsyncSession,
    user_id: int,
    product_id: int,
) -> CartResponse:
    cart = await get_or_create_cart(db, user_id)

    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
        )
    )
    cart_item = result.scalar_one_or_none()

    if cart_item is None:
        raise ValueError("Item not found in cart.")

    await db.delete(cart_item)
    await db.commit()

    cart = await get_or_create_cart(db, user_id)
    return build_cart_response(cart)
