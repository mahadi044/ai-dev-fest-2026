from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.database.connection import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    merchant = Column(String(150), nullable=False)
    category = Column(String(80), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(30), nullable=False)
    status = Column(String(30), nullable=False, default="Completed")
    risk_level = Column(String(20), nullable=False, default="Low")
    transaction_date = Column(DateTime, nullable=False, default=datetime.utcnow)
