from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import Product, create_tables, get_db

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

@app.get("/products/", response_model=List[ProductResponseDTO])
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

@app.post("/products/", response_model=ProductResponseDTO, status_code=201)
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

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
