from datetime import datetime


def calculate_risk(transaction):
    score = 0
    reasons = []

    amount = abs(transaction.amount)

    if amount >= 10000:
        score += 30
        reasons.append("Transaction amount is unusually high.")

    if transaction.merchant.lower().startswith("unknown"):
        score += 25
        reasons.append("Merchant identity is unknown.")

    if transaction.status.lower() == "review":
        score += 20
        reasons.append("Transaction requires review.")

    if transaction.category.lower() == "transfer":
        score += 10
        reasons.append("Transfer transactions require additional attention.")

    if isinstance(transaction.transaction_date, datetime):
        hour = transaction.transaction_date.hour

        if hour < 6 or hour >= 23:
            score += 15
            reasons.append("Transaction occurred during an unusual hour.")

    score = min(score, 100)

    if score >= 70:
        risk_level = "High"
    elif score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "reasons": reasons,
    }
