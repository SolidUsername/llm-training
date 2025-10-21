from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

from config import settings

engine = create_async_engine(settings.database_url, echo=settings.debug)
AsyncSessionLocal = async_sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    stock = Column(Integer, nullable=False)

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    cart_items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    cart = relationship("Cart", back_populates="cart_items")
    product = relationship("Product")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)