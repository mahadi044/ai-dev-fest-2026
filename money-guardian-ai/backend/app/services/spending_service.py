from collections import defaultdict


def calculate_spending_summary(transactions):
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

    category_spending = defaultdict(float)

    for transaction in transactions:
        if transaction.amount < 0:
            category_spending[transaction.category] += abs(transaction.amount)

    category_spending = dict(category_spending)

    top_category = None
    top_category_amount = 0

    if category_spending:
        top_category = max(
            category_spending,
            key=category_spending.get
        )
        top_category_amount = category_spending[top_category]

    savings = total_income - total_spending

    return {
        "total_income": total_income,
        "total_spending": total_spending,
        "savings": savings,
        "category_spending": category_spending,
        "top_category": top_category,
        "top_category_amount": top_category_amount,
        "transaction_count": len(transactions),
    }