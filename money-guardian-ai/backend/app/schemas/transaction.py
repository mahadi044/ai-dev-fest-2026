from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TransactionBase(BaseModel):
    merchant: str
    category: str
    amount: float
    transaction_type: str
    status: str = "Completed"
    risk_level: str = "Low"
    transaction_date: datetime


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
