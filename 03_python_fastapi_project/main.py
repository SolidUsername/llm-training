from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import settings
from database import Product, Cart, CartItem, create_tables, get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProductResponseDTO(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int

class ProductCreateDTO(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int

class ProductUpdateDTO(BaseModel):
    name: str | None = None
    price: float | None = None
    description: str | None = None
    stock: int | None = None

class CartItemResponseDTO(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    quantity: int
    subtotal: float

class CartResponseDTO(BaseModel):
    id: int
    items: List[CartItemResponseDTO]
    total: float

class AddToCartDTO(BaseModel):
    product_id: int
    quantity: int = 1

class UpdateCartItemDTO(BaseModel):
    quantity: int

@app.get("/products", response_model=List[ProductResponseDTO])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    return products

@app.get("/products/{product_id}", response_model=ProductResponseDTO)
async def get_product_by_id(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=ProductResponseDTO, status_code=201)
async def create_product(product: ProductCreateDTO, db: AsyncSession = Depends(get_db)):
    db_product = Product(
        name=product.name,
        price=product.price,
        description=product.description,
        stock=product.stock
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=ProductResponseDTO)
async def update_product(product: ProductUpdateDTO, product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    await db.commit()
    await db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):  
    result = await db.execute(select(Product).where(Product.id == product_id))
    db_product = result.scalar_one_or_none()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(db_product)
    await db.commit()
    return

# Cart endpoints
@app.get("/cart", response_model=CartResponseDTO)
async def get_cart(db: AsyncSession = Depends(get_db)):
    # Get or create a cart (for simplicity, we'll use cart_id=1)
    result = await db.execute(select(Cart).where(Cart.id == 1))
    cart = result.scalar_one_or_none()
    
    if cart is None:
        cart = Cart(id=1)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
    
    # Fetch cart items with product details
    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id)
    )
    cart_items = result.scalars().all()
    
    items = []
    total = 0.0
    
    for item in cart_items:
        result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = result.scalar_one_or_none()
        if product:
            subtotal = product.price * item.quantity
            items.append(CartItemResponseDTO(
                id=item.id,
                product_id=product.id,
                product_name=product.name,
                product_price=product.price,
                quantity=item.quantity,
                subtotal=subtotal
            ))
            total += subtotal
    
    return CartResponseDTO(id=cart.id, items=items, total=total)

@app.post("/cart/items", response_model=CartResponseDTO, status_code=201)
async def add_to_cart(item: AddToCartDTO, db: AsyncSession = Depends(get_db)):
    # Check if product exists and has enough stock
    result = await db.execute(select(Product).where(Product.id == item.product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < item.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Get or create cart
    result = await db.execute(select(Cart).where(Cart.id == 1))
    cart = result.scalar_one_or_none()
    
    if cart is None:
        cart = Cart(id=1)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
    
    # Check if product already in cart
    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item.product_id
        )
    )
    existing_item = result.scalar_one_or_none()
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item.quantity + item.quantity
        if product.stock < new_quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        existing_item.quantity = new_quantity
    else:
        # Add new item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(cart_item)
    
    await db.commit()
    
    # Return updated cart
    return await get_cart(db)

@app.put("/cart/items/{item_id}", response_model=CartResponseDTO)
async def update_cart_item(item_id: int, update: UpdateCartItemDTO, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).where(CartItem.id == item_id))
    cart_item = result.scalar_one_or_none()
    if cart_item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    # Check product stock
    result = await db.execute(select(Product).where(Product.id == cart_item.product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validate requested quantity against available stock
    if update.quantity > product.stock:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    cart_item.quantity = update.quantity
    
    await db.commit()
    
    return await get_cart(db)

@app.delete("/cart/items/{item_id}", response_model=CartResponseDTO)
async def remove_from_cart(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).where(CartItem.id == item_id))
    cart_item = result.scalar_one_or_none()
    if cart_item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    await db.delete(cart_item)
    await db.commit()
    
    return await get_cart(db)

@app.delete("/cart", status_code=204)
async def clear_cart(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cart).where(Cart.id == 1))
    cart = result.scalar_one_or_none()
    
    if cart:
        # Get all cart items
        result = await db.execute(select(CartItem).where(CartItem.cart_id == cart.id))
        cart_items = result.scalars().all()
        
        for item in cart_items:
            await db.delete(item)
        
        await db.commit()
    
    return


@app.post("/cart/checkout", response_model=CartResponseDTO)
async def checkout(db: AsyncSession = Depends(get_db)):
    # Load cart with items
    result = await db.execute(
        select(Cart).options(selectinload(Cart.cart_items)).where(Cart.id == 1)
    )
    cart = result.scalar_one_or_none()

    if cart is None:
        # nothing to do, return empty cart
        return await get_cart(db)

    # Load cart items
    result = await db.execute(select(CartItem).where(CartItem.cart_id == cart.id))
    cart_items = result.scalars().all()

    # Validate stock first
    for item in cart_items:
        result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = result.scalar_one_or_none()
        if product is None:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.id}")

    # All good: decrement stock and remove items
    for item in cart_items:
        result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = result.scalar_one_or_none()
        if product:
            product.stock -= item.quantity
        await db.delete(item)

    await db.commit()

    # Return updated cart (should be empty)
    return await get_cart(db)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
