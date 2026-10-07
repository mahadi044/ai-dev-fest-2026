from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.transaction import Transaction
from app.models.user import User

from app.services.prediction_service import predict_financial_risk


router = APIRouter(
    prefix="/api/prediction",
    tags=["AI Risk Prediction"],
)


@router.get("/")
def get_financial_risk_prediction(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate personalized financial risk prediction
    using only the authenticated user's transactions.
    """

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.asc())
        .all()
    )

    if not transactions:
        return {
            "message": "Not enough transaction data for prediction.",
            "transactions_analyzed": 0,
            "prediction_available": False,
        }

    try:
        prediction = predict_financial_risk(transactions)

        return {
            "prediction_available": True,
            "transactions_analyzed": len(transactions),
            **prediction,
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="ML risk model is not available. Please train the model first.",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}",
        )