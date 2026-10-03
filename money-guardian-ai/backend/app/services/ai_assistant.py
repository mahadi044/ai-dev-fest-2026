from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.services.risk_service import calculate_risk


def generate_ai_response(question: str, db: Session):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

    if not transactions:
        return {
            "answer": (
                "I don't have enough transaction data yet. "
                "Please add some transactions first."
            )
        }

    question_lower = question.lower()

    total_income = sum(
        transaction.amount
        for transaction in transactions
        if transaction.amount > 0
    )

    total_spending = sum(
        abs(transaction.amount)
        for transaction in transactions
        if transaction.amount < 0
    )

    savings = total_income - total_spending

    # ---------------------------------------------------------
    # CATEGORY SPENDING
    # ---------------------------------------------------------
    category_spending = {}

    for transaction in transactions:
        if transaction.amount < 0:
            category = transaction.category

            category_spending[category] = (
                category_spending.get(category, 0)
                + abs(transaction.amount)
            )

    top_category = None
    top_category_amount = 0

    if category_spending:
        top_category = max(
            category_spending,
            key=category_spending.get,
        )

        top_category_amount = category_spending[
            top_category
        ]

    # ---------------------------------------------------------
    # RISK ANALYSIS
    # ---------------------------------------------------------
    risky_transactions = []

    for transaction in transactions:
        risk = calculate_risk(transaction)

        if risk["risk_level"] in ["High", "Medium"]:
            risky_transactions.append(
                {
                    "merchant": transaction.merchant,
                    "risk_level": risk["risk_level"],
                    "risk_score": risk["risk_score"],
                }
            )

    # ---------------------------------------------------------
    # SPECIFIC TRANSACTION RISK EXPLANATION
    # ---------------------------------------------------------
    if (
        "why" in question_lower
        and (
            "risk" in question_lower
            or "risky" in question_lower
            or "dangerous" in question_lower
            or "unsafe" in question_lower
        )
    ):
        matched_transaction = None

        for transaction in transactions:
            merchant_name = transaction.merchant.lower()

            if merchant_name in question_lower:
                matched_transaction = transaction
                break

        if matched_transaction:
            risk = calculate_risk(matched_transaction)

            if risk["reasons"]:
                reasons_text = " ".join(
                    risk["reasons"]
                )

                return {
                    "answer": (
                        f"{matched_transaction.merchant} "
                        f"has a {risk['risk_level']} risk level "
                        f"with a risk score of "
                        f"{risk['risk_score']}/100. "
                        f"Why: {reasons_text}"
                    ),
                    "data": {
                        "merchant": matched_transaction.merchant,
                        "risk_score": risk["risk_score"],
                        "risk_level": risk["risk_level"],
                        "reasons": risk["reasons"],
                    },
                }

            return {
                "answer": (
                    f"{matched_transaction.merchant} "
                    f"is currently classified as "
                    f"{risk['risk_level']} risk with a "
                    f"risk score of "
                    f"{risk['risk_score']}/100. "
                    f"No specific risk factors were detected."
                ),
                "data": {
                    "merchant": matched_transaction.merchant,
                    "risk_score": risk["risk_score"],
                    "risk_level": risk["risk_level"],
                    "reasons": [],
                },
            }

        return {
            "answer": (
                "I couldn't find the specific transaction "
                "you mentioned. Please include the merchant "
                "name in your question."
            )
        }

    # ---------------------------------------------------------
    # CATEGORY / TOP SPENDING
    # ---------------------------------------------------------
    if (
        "category" in question_lower
        or "where" in question_lower
        or "most" in question_lower
        or "highest" in question_lower
        or "biggest" in question_lower
    ):
        if top_category:
            return {
                "answer": (
                    f"Your highest spending category is "
                    f"{top_category}, with Tk "
                    f"{top_category_amount:,.0f} spent."
                ),
                "data": {
                    "top_category": top_category,
                    "amount": top_category_amount,
                },
            }

        return {
            "answer": "There is not enough category data yet."
        }

    # ---------------------------------------------------------
    # TOTAL SPENDING
    # ---------------------------------------------------------
    if (
        "spending" in question_lower
        or "spend" in question_lower
        or "spent" in question_lower
    ):
        return {
            "answer": (
                f"Based on your current transactions, "
                f"your total spending is Tk "
                f"{total_spending:,.0f}."
            ),
            "data": {
                "total_spending": total_spending,
            },
        }

    # ---------------------------------------------------------
    # SAVINGS
    # ---------------------------------------------------------
    if (
        "saving" in question_lower
        or "save" in question_lower
    ):
        return {
            "answer": (
                f"Your current calculated savings are "
                f"Tk {savings:,.0f}. "
                f"Your income is Tk {total_income:,.0f} "
                f"and your spending is Tk "
                f"{total_spending:,.0f}."
            ),
            "data": {
                "income": total_income,
                "spending": total_spending,
                "savings": savings,
            },
        }

    # ---------------------------------------------------------
    # GENERAL RISK
    # ---------------------------------------------------------
    if (
        "risk" in question_lower
        or "safe" in question_lower
        or "risky" in question_lower
    ):
        if risky_transactions:
            highest_risk = max(
                risky_transactions,
                key=lambda item: item["risk_score"],
            )

            return {
                "answer": (
                    f"I found {len(risky_transactions)} "
                    f"transaction(s) requiring attention. "
                    f"The highest-risk transaction is "
                    f"{highest_risk['merchant']} with a "
                    f"{highest_risk['risk_level']} risk level."
                ),
                "data": {
                    "risky_transactions": risky_transactions,
                },
            }

        return {
            "answer": (
                "Your current transactions do not show "
                "any medium or high-risk transaction."
            )
        }

    # ---------------------------------------------------------
    # TRANSACTION COUNT
    # ---------------------------------------------------------
    if (
        "transaction" in question_lower
        or "merchant" in question_lower
    ):
        return {
            "answer": (
                f"You currently have {len(transactions)} "
                f"transaction(s) in Money Guardian."
            ),
            "data": {
                "transaction_count": len(transactions),
            },
        }

    # ---------------------------------------------------------
    # FINANCIAL HEALTH
    # ---------------------------------------------------------
    if (
        "health" in question_lower
        or "financial" in question_lower
    ):
        spending_rate = 0

        if total_income > 0:
            spending_rate = (
                total_spending / total_income
            ) * 100

        return {
            "answer": (
                f"Your current financial snapshot shows "
                f"Tk {total_income:,.0f} income, "
                f"Tk {total_spending:,.0f} spending, "
                f"and Tk {savings:,.0f} calculated savings. "
                f"Your spending rate is "
                f"{spending_rate:.1f}% of income."
            ),
            "data": {
                "income": total_income,
                "spending": total_spending,
                "savings": savings,
                "spending_rate": round(
                    spending_rate,
                    1,
                ),
            },
        }

    # ---------------------------------------------------------
    # DEFAULT
    # ---------------------------------------------------------
    return {
        "answer": (
            "I can analyze your actual financial data. "
            "Try asking about your spending, savings, "
            "top spending category, transaction risks, "
            "or financial health."
        )
    }