from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.transaction import Transaction
from app.services.spending_service import calculate_spending_summary

router = APIRouter(prefix="/api/insights", tags=["Money Insights"])


@router.get("/")
def get_money_insights(db: Session = Depends(get_db)):
    transactions = (
        db.query(Transaction)
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