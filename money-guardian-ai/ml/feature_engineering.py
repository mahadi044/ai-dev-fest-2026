"""
Money Guardian AI
Feature engineering for MFS customer financial-risk prediction.

The model uses behavioral features only.
No future-period information is used as a model feature.
"""

from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Iterable

import numpy as np


FEATURE_COLUMNS = [
    "monthly_income",
    "monthly_expense",
    "savings_ratio",
    "transaction_count",
    "expense_frequency",
    "avg_expense",
    "max_expense",
    "food_ratio",
    "shopping_ratio",
    "transfer_ratio",
    "high_value_transactions",
    "spending_trend",
]


def _safe_ratio(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0

    return float(numerator / denominator)


def build_behavior_features(transactions: Iterable) -> dict:
    """
    Build behavioral features from a customer's historical transactions.

    Expected transaction attributes:
        amount
        category
        transaction_type
        transaction_date
    """

    transactions = list(transactions)

    if not transactions:
        return {
            feature: 0.0
            for feature in FEATURE_COLUMNS
        }

    income = 0.0
    expense = 0.0
    expenses = []

    food_expense = 0.0
    shopping_expense = 0.0
    transfer_expense = 0.0

    transaction_days = []
    monthly_expenses = Counter()

    high_value_transactions = 0

    for transaction in transactions:
        amount = float(transaction.amount)
        absolute_amount = abs(amount)

        transaction_type = (
            str(getattr(transaction, "transaction_type", ""))
            .strip()
            .lower()
        )

        category = (
            str(getattr(transaction, "category", ""))
            .strip()
            .lower()
        )

        transaction_date = getattr(
            transaction,
            "transaction_date",
            None,
        )

        if amount > 0 or transaction_type == "income":
            income += absolute_amount
        else:
            expense += absolute_amount
            expenses.append(absolute_amount)

            if category == "food":
                food_expense += absolute_amount

            if category == "shopping":
                shopping_expense += absolute_amount

            if category == "transfer":
                transfer_expense += absolute_amount

            if absolute_amount >= 10000:
                high_value_transactions += 1

            if isinstance(transaction_date, datetime):
                transaction_days.append(
                    transaction_date.date()
                )

                month_key = (
                    transaction_date.year,
                    transaction_date.month,
                )

                monthly_expenses[month_key] += absolute_amount

    transaction_count = len(transactions)

    expense_frequency = _safe_ratio(
        len(expenses),
        max(transaction_count, 1),
    )

    average_expense = (
        float(np.mean(expenses))
        if expenses
        else 0.0
    )

    max_expense = (
        float(max(expenses))
        if expenses
        else 0.0
    )

    savings = income - expense

    savings_ratio = _safe_ratio(
        savings,
        income,
    )

    food_ratio = _safe_ratio(
        food_expense,
        expense,
    )

    shopping_ratio = _safe_ratio(
        shopping_expense,
        expense,
    )

    transfer_ratio = _safe_ratio(
        transfer_expense,
        expense,
    )

    spending_trend = 0.0

    if len(monthly_expenses) >= 2:
        ordered_months = sorted(
            monthly_expenses.keys()
        )

        first_month = monthly_expenses[
            ordered_months[0]
        ]

        last_month = monthly_expenses[
            ordered_months[-1]
        ]

        spending_trend = _safe_ratio(
            last_month - first_month,
            max(first_month, 1.0),
        )

    return {
        "monthly_income": round(income, 2),
        "monthly_expense": round(expense, 2),
        "savings_ratio": round(savings_ratio, 4),
        "transaction_count": transaction_count,
        "expense_frequency": round(
            expense_frequency,
            4,
        ),
        "avg_expense": round(
            average_expense,
            2,
        ),
        "max_expense": round(
            max_expense,
            2,
        ),
        "food_ratio": round(
            food_ratio,
            4,
        ),
        "shopping_ratio": round(
            shopping_ratio,
            4,
        ),
        "transfer_ratio": round(
            transfer_ratio,
            4,
        ),
        "high_value_transactions": (
            high_value_transactions
        ),
        "spending_trend": round(
            spending_trend,
            4,
        ),
    }


def features_to_vector(features: dict) -> list[float]:
    """
    Convert the feature dictionary into a stable model input order.
    """

    return [
        float(features.get(name, 0.0))
        for name in FEATURE_COLUMNS
    ]