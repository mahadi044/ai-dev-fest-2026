from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.services.spending_service import calculate_spending_summary


router = APIRouter(
    prefix="/api/insights",
    tags=["Money Insights"],
)


@router.get("/")
def get_money_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

    summary = calculate_spending_summary(transactions)

    return {
        "summary": summary,
        "insights": [
            {
                "title": "Spending Overview",
                "description": (
                    f"You spent Tk {summary['total_spending']:,.0f} "
                    f"across {summary['transaction_count']} transactions."
                ),
                "type": "Spending Analysis",
            },
            {
                "title": "Savings Opportunity",
                "description": (
                    f"Your current calculated savings are "
                    f"Tk {summary['savings']:,.0f}."
                ),
                "type": "Potential Saving",
            },
        ],
    }