from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, DECIMAL, Text, ForeignKey
from sqlalchemy.orm import declarative_base


Base = declarative_base()


class Category(Base):

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Product(Base):

    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    image_url = Column(String(500))  # может быть пустой
    power = Column(Integer, nullable=False)         # ватты
    socket_type = Column(String(50), nullable=False)  # E27, E14, GU10
    color_temp = Column(Integer, nullable=False)    # кельвины
    lifespan = Column(Integer, nullable=False)      # часы
    stock = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
