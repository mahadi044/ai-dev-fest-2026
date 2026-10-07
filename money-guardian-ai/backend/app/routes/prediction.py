from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.transaction import Transaction
from app.models.user import User

from app.services.prediction_service import (
    predict_financial_risk,
    predict_what_if_risk,
)


router = APIRouter(
    prefix="/api/prediction",
    tags=["AI Risk Prediction"],
)


# ============================================================
# PERSONALIZED FINANCIAL RISK PREDICTION
# ============================================================

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
        prediction = predict_financial_risk(
            transactions
        )

        return {
            "prediction_available": True,
            "transactions_analyzed": len(transactions),
            **prediction,
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail=(
                "ML risk model is not available. "
                "Please train the model first."
            ),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}",
        )


# ============================================================
# WHAT-IF ML RISK PREDICTION
# ============================================================

@router.get("/what-if")
def get_what_if_risk_prediction(
    monthly_saving: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate ML risk prediction for a What-If
    monthly saving scenario.

    The scenario does not create or save any
    fake transaction in the database.
    """

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.asc())
        .all()
    )

    if not transactions:
        return {
            "message": (
                "Not enough transaction data "
                "for What-If prediction."
            ),
            "transactions_analyzed": 0,
            "prediction_available": False,
        }

    if monthly_saving < 0:
        raise HTTPException(
            status_code=400,
            detail="Monthly saving cannot be negative.",
        )

    try:
        prediction = predict_what_if_risk(
            transactions,
            monthly_saving,
        )

        return {
            "prediction_available": True,
            "transactions_analyzed": len(transactions),
            **prediction,
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail=(
                "ML risk model is not available. "
                "Please train the model first."
            ),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"What-If prediction failed: {str(e)}",
        )