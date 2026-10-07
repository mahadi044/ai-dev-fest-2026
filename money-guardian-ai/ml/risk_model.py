"""
Rule-based financial-risk baseline.

This intentionally mirrors the existing Money Guardian
transaction risk logic so that ML performance can be
compared against the handcrafted baseline.
"""

from __future__ import annotations

from datetime import datetime


def calculate_rule_baseline(transaction):
    score = 0

    amount = abs(
        float(transaction.amount)
    )

    merchant = str(
        transaction.merchant
    ).lower()

    status = str(
        transaction.status
    ).lower()

    category = str(
        transaction.category
    ).lower()

    if amount >= 10000:
        score += 30

    if merchant.startswith(
        "unknown"
    ):
        score += 25

    if status == "review":
        score += 20

    if category == "transfer":
        score += 10

    transaction_date = getattr(
        transaction,
        "transaction_date",
        None,
    )

    if isinstance(
        transaction_date,
        datetime,
    ):
        hour = transaction_date.hour

        if hour < 6 or hour >= 23:
            score += 15

    score = min(
        score,
        100,
    )

    if score >= 70:
        risk_level = "High"
    elif score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "risk_score": score,
        "risk_level": risk_level,
    }


def rule_score_to_binary(
    score: float,
) -> int:
    """
    Convert the existing rule-based risk
    into a binary high-risk prediction.

    1 = High risk
    0 = Not high risk
    """

    return int(
        float(score) >= 70
    )