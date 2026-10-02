from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.transaction import Transaction
from app.services.risk_service import calculate_risk

router = APIRouter(prefix="/api/risk", tags=["Risk Guardian"])


@router.get("/")
def get_risk_analysis(db: Session = Depends(get_db)):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

    results = []

    for transaction in transactions:
        risk = calculate_risk(transaction)

        results.append(
            {
                "id": transaction.id,
                "merchant": transaction.merchant,
                "category": transaction.category,
                "amount": transaction.amount,
                "status": transaction.status,
                "transaction_date": transaction.transaction_date,
                **risk,
            }
        )

    return {
        "transactions_analyzed": len(results),
        "results": results,
    }
