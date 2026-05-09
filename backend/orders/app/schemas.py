from typing import Optional
from pydantic import BaseModel


class AddItemIn(BaseModel):
    product_id: int
    quantity: int


class UpdateQuantityIn(BaseModel):
    quantity: int


class CreateOrderIn(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: str
    delivery_city: str
    delivery_address: str
    delivery_method: str
    payment_method: str

class UpdateStatusIn(BaseModel):
    status: str
