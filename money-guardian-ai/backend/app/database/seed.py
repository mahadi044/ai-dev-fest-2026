from datetime import datetime

from app.database.connection import SessionLocal
from app.models.transaction import Transaction


def seed_transactions():
    db = SessionLocal()

    try:
        existing_count = db.query(Transaction).count()

        if existing_count > 0:
            print(
                f"Database already contains "
                f"{existing_count} transaction(s)."
            )
            return

        transactions = [
            Transaction(
                merchant="Foodpanda",
                category="Food",
                amount=-850,
                transaction_type="Expense",
                status="Completed",
                risk_level="Low",
                transaction_date=datetime.fromisoformat(
                    "2026-10-01T20:42:00"
                ),
            ),
            Transaction(
                merchant="Daraz",
                category="Shopping",
                amount=-4250,
                transaction_type="Expense",
                status="Completed",
                risk_level="Low",
                transaction_date=datetime.fromisoformat(
                    "2026-10-01T15:18:00"
                ),
            ),
            Transaction(
                merchant="Salary Credit",
                category="Income",
                amount=45000,
                transaction_type="Income",
                status="Completed",
                risk_level="Low",
                transaction_date=datetime.fromisoformat(
                    "2026-10-01T10:05:00"
                ),
            ),
            Transaction(
                merchant="Unknown Merchant",
                category="Transfer",
                amount=-20000,
                transaction_type="Expense",
                status="Review",
                risk_level="High",
                transaction_date=datetime.fromisoformat(
                    "2026-09-30T02:31:00"
                ),
            ),
            Transaction(
                merchant="Shwapno",
                category="Groceries",
                amount=-2350,
                transaction_type="Expense",
                status="Completed",
                risk_level="Low",
                transaction_date=datetime.fromisoformat(
                    "2026-09-29T19:24:00"
                ),
            ),
            Transaction(
                merchant="bKash Transfer",
                category="Transfer",
                amount=-1500,
                transaction_type="Expense",
                status="Completed",
                risk_level="Medium",
                transaction_date=datetime.fromisoformat(
                    "2026-09-29T13:12:00"
                ),
            ),
        ]

        db.add_all(transactions)
        db.commit()

        print(
            f"Successfully added "
            f"{len(transactions)} transaction(s)."
        )

    finally:
        db.close()


if __name__ == "__main__":
    seed_transactions()