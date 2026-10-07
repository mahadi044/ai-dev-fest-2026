from pathlib import Path
import sys

import numpy as np


# ============================================================
# PROJECT ROOT PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# ML IMPORTS
# ============================================================

from ml.feature_engineering import (
    build_behavior_features,
    features_to_vector,
)

from ml.prediction_model import load_model


# ============================================================
# MODEL PATH
# ============================================================

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "money_guardian_risk_model.joblib"
)


# ============================================================
# MODEL LOADING
# ============================================================

def load_prediction_model():
    """
    Load the trained Money Guardian ML model package.
    """

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained ML model not found: {MODEL_PATH}"
        )

    return load_model()


# ============================================================
# EXPLANATION GENERATOR
# ============================================================

def generate_explanations(features):
    """
    Generate human-readable explanations from
    the user's financial behavior.
    """

    explanations = []

    savings_ratio = features.get(
        "savings_ratio",
        0,
    )

    monthly_expense = features.get(
        "monthly_expense",
        0,
    )

    monthly_income = features.get(
        "monthly_income",
        0,
    )

    spending_trend = features.get(
        "spending_trend",
        0,
    )

    high_value_transactions = features.get(
        "high_value_transactions",
        0,
    )

    expense_frequency = features.get(
        "expense_frequency",
        0,
    )

    # --------------------------------------------------------
    # Low savings
    # --------------------------------------------------------

    if savings_ratio < 0.10:
        explanations.append(
            "Your current savings ratio is low."
        )

    # --------------------------------------------------------
    # High expense-to-income ratio
    # --------------------------------------------------------

    if monthly_income > 0:

        expense_ratio = (
            monthly_expense / monthly_income
        )

        if expense_ratio > 0.80:
            explanations.append(
                "A large portion of your income is being spent."
            )

    # --------------------------------------------------------
    # Increasing spending trend
    # --------------------------------------------------------

    if spending_trend > 0.10:
        explanations.append(
            "Your spending trend is increasing."
        )

    # --------------------------------------------------------
    # High-value transactions
    # --------------------------------------------------------

    if high_value_transactions >= 2:
        explanations.append(
            "You have several high-value transactions."
        )

    # --------------------------------------------------------
    # High transaction frequency
    # --------------------------------------------------------

    if expense_frequency >= 20:
        explanations.append(
            "Your expense frequency is relatively high."
        )

    # --------------------------------------------------------
    # Default explanation
    # --------------------------------------------------------

    if not explanations:
        explanations.append(
            "Your current spending behavior appears relatively stable."
        )

    return explanations


# ============================================================
# FINANCIAL RISK PREDICTION
# ============================================================

def predict_financial_risk(transactions):
    """
    Predict whether the user is likely to enter
    a high financial-risk state based on their
    historical transaction behavior.
    """

    # --------------------------------------------------------
    # Load trained model
    # --------------------------------------------------------

    model_package = load_prediction_model()

    model = model_package["model"]

    scaler = model_package["scaler"]

    threshold = model_package.get(
        "threshold",
        0.30,
    )

    model_version = model_package.get(
        "model_version",
        "rf-risk-v1",
    )

    # --------------------------------------------------------
    # Build behavioral features
    # --------------------------------------------------------

    features = build_behavior_features(
        transactions
    )

    # --------------------------------------------------------
    # Convert features into model vector
    # --------------------------------------------------------

    feature_vector = features_to_vector(
        features
    )

    X = np.array(
        [feature_vector],
        dtype=float,
    )

    # --------------------------------------------------------
    # Scale features
    # --------------------------------------------------------

    X_scaled = scaler.transform(X)

    # --------------------------------------------------------
    # Predict probability
    # --------------------------------------------------------

    probability = float(
        model.predict_proba(X_scaled)[0][1]
    )

    # --------------------------------------------------------
    # High-risk classification
    # --------------------------------------------------------

    high_risk_prediction = (
        probability >= threshold
    )

    # --------------------------------------------------------
    # Risk level
    # --------------------------------------------------------

    if probability >= 0.65:

        risk_level = "High"

    elif probability >= threshold:

        risk_level = "Medium"

    else:

        risk_level = "Low"

    # --------------------------------------------------------
    # Risk score
    # --------------------------------------------------------

    risk_score = round(
        probability * 100,
        2,
    )

    # --------------------------------------------------------
    # Generate explanations
    # --------------------------------------------------------

    explanations = generate_explanations(
        features
    )

    # --------------------------------------------------------
    # Return prediction
    # --------------------------------------------------------

    return {
        "risk_probability": round(
            probability,
            4,
        ),

        "risk_score": risk_score,

        "risk_level": risk_level,

        "high_risk_prediction": high_risk_prediction,

        "prediction_threshold": threshold,

        "model_version": model_version,

        "explanations": explanations,

        "features": features,
    }