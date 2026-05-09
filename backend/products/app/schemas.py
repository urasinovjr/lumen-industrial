from typing import Optional
from pydantic import BaseModel


class CategoryIn(BaseModel):
    name: str


class ProductIn(BaseModel):
    name: str
    description: str
    category_id: int
    price: float
    image_url: Optional[str] = None
    power: int
    socket_type: str
    color_temp: int
    lifespan: int
    stock: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    power: Optional[int] = None
    socket_type: Optional[str] = None
    color_temp: Optional[int] = None
    lifespan: Optional[int] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
