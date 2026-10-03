from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.services.risk_service import calculate_risk


router = APIRouter(
    prefix="/api/risk",
    tags=["Risk Guardian"],
)


@router.get("/")
def get_risk_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
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