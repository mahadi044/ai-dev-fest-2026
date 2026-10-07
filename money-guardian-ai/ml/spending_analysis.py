import numpy as np
import pandas as pd


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


def generate_synthetic_dataset(
    n_customers: int = 1200,
    random_state: int = 42,
) -> pd.DataFrame:
    """
    Generate synthetic MFS customer behavioral data.

    Important:
    - The dataset contains NO real customer information.
    - Features represent past financial behavior.
    - The target represents a future 30-day high-risk outcome.
    - Future outcome is NOT used as a model feature.
    """

    rng = np.random.default_rng(random_state)

    # ---------------------------------------------------------
    # 1. Basic customer financial behavior
    # ---------------------------------------------------------

    monthly_income = rng.lognormal(
        mean=np.log(30000),
        sigma=0.45,
        size=n_customers,
    )

    monthly_income = np.clip(
        monthly_income,
        10000,
        150000,
    )

    # Base spending ratio
    base_expense_ratio = rng.beta(
        4.0,
        3.5,
        size=n_customers,
    )

    # Some customers naturally spend more
    high_spender = rng.random(n_customers) < 0.20
    base_expense_ratio[high_spender] += rng.uniform(
        0.10,
        0.25,
        high_spender.sum(),
    )

    base_expense_ratio = np.clip(
        base_expense_ratio,
        0.30,
        1.15,
    )

    monthly_expense = (
        monthly_income * base_expense_ratio
    )

    monthly_expense *= rng.normal(
        1.0,
        0.06,
        n_customers,
    )

    monthly_expense = np.maximum(
        monthly_expense,
        3000,
    )

    # ---------------------------------------------------------
    # 2. Transaction behavior
    # ---------------------------------------------------------

    transaction_count = rng.poisson(
        lam=28,
        size=n_customers,
    ) + 5

    expense_frequency = (
        transaction_count
        * rng.uniform(0.55, 0.90, n_customers)
    )

    expense_frequency = np.clip(
        expense_frequency,
        5,
        55,
    )

    avg_expense = (
        monthly_expense
        / np.maximum(expense_frequency, 1)
    )

    max_expense = (
        avg_expense
        * rng.uniform(2.5, 7.0, n_customers)
    )

    # ---------------------------------------------------------
    # 3. Category behavior
    # ---------------------------------------------------------

    food_ratio = rng.beta(
        2.5,
        6.0,
        n_customers,
    )

    shopping_ratio = rng.beta(
        2.0,
        7.0,
        n_customers,
    )

    transfer_ratio = rng.beta(
        1.8,
        8.0,
        n_customers,
    )

    # Some customers have unusually high category spending
    food_heavy = rng.random(n_customers) < 0.15
    food_ratio[food_heavy] += rng.uniform(
        0.08,
        0.20,
        food_heavy.sum(),
    )

    shopping_heavy = rng.random(n_customers) < 0.15
    shopping_ratio[shopping_heavy] += rng.uniform(
        0.10,
        0.25,
        shopping_heavy.sum(),
    )

    food_ratio = np.clip(food_ratio, 0.05, 0.60)
    shopping_ratio = np.clip(shopping_ratio, 0.03, 0.60)

    # ---------------------------------------------------------
    # 4. High-value transaction behavior
    # ---------------------------------------------------------

    high_value_lambda = np.clip(
        monthly_expense / 30000,
        0.3,
        8.0,
    )

    high_value_transactions = rng.poisson(
        high_value_lambda,
    )

    high_value_transactions = np.clip(
        high_value_transactions,
        0,
        12,
    )

    # ---------------------------------------------------------
    # 5. Spending trend
    # ---------------------------------------------------------

    spending_trend = rng.normal(
        0.08,
        0.18,
        n_customers,
    )

    # A group of customers experiences increasing spending
    rising_spending = rng.random(n_customers) < 0.25

    spending_trend[rising_spending] += rng.uniform(
        0.15,
        0.40,
        rising_spending.sum(),
    )

    spending_trend = np.clip(
        spending_trend,
        -0.40,
        0.80,
    )

    # ---------------------------------------------------------
    # 6. Savings ratio
    # ---------------------------------------------------------

    savings_ratio = (
        monthly_income - monthly_expense
    ) / monthly_income

    savings_ratio = np.clip(
        savings_ratio,
        -0.50,
        0.70,
    )

    # ---------------------------------------------------------
    # 7. FUTURE 30-DAY RISK TARGET
    # ---------------------------------------------------------
    #
    # Target is intentionally generated from multiple behavioral
    # signals rather than one simple rule.
    #
    # IMPORTANT:
    # This target is future behavior and is NOT included in
    # FEATURE_COLUMNS.
    #

    expense_ratio = (
        monthly_expense
        / np.maximum(monthly_income, 1)
    )

    # Normalize important behavioral signals
    expense_pressure = np.clip(
        (expense_ratio - 0.55) / 0.50,
        0,
        1,
    )

    low_savings_pressure = np.clip(
        (0.20 - savings_ratio) / 0.70,
        0,
        1,
    )

    transaction_pressure = np.clip(
        (transaction_count - 25) / 45,
        0,
        1,
    )

    high_value_pressure = np.clip(
        high_value_transactions / 6,
        0,
        1,
    )

    trend_pressure = np.clip(
        (spending_trend + 0.05) / 0.55,
        0,
        1,
    )

    shopping_pressure = np.clip(
        (shopping_ratio - 0.15) / 0.35,
        0,
        1,
    )

    transfer_pressure = np.clip(
        (transfer_ratio - 0.10) / 0.35,
        0,
        1,
    )

    # Combined financial stress score
    risk_signal = (
        0.30 * expense_pressure
        + 0.20 * low_savings_pressure
        + 0.12 * transaction_pressure
        + 0.12 * high_value_pressure
        + 0.16 * trend_pressure
        + 0.06 * shopping_pressure
        + 0.04 * transfer_pressure
    )

    # Add small natural uncertainty.
    # This prevents the model from simply memorizing
    # a perfectly deterministic mathematical formula.
    risk_signal += rng.normal(
        0,
        0.035,
        n_customers,
    )

    # Convert signal to future probability.
    probability = 1 / (
        1 + np.exp(
            -10 * (risk_signal - 0.48)
        )
    )

    # Future 30-day outcome
    target = rng.binomial(
        1,
        probability,
        n_customers,
    )

    # ---------------------------------------------------------
    # 8. Create dataset
    # ---------------------------------------------------------

    customer_ids = [
        f"CUST_{i + 1:05d}"
        for i in range(n_customers)
    ]

    df = pd.DataFrame(
        {
            "customer_id": customer_ids,
            "monthly_income": monthly_income,
            "monthly_expense": monthly_expense,
            "savings_ratio": savings_ratio,
            "transaction_count": transaction_count,
            "expense_frequency": expense_frequency,
            "avg_expense": avg_expense,
            "max_expense": max_expense,
            "food_ratio": food_ratio,
            "shopping_ratio": shopping_ratio,
            "transfer_ratio": transfer_ratio,
            "high_value_transactions": high_value_transactions,
            "spending_trend": spending_trend,
            "target": target,
        }
    )

    return df