from pathlib import Path
import sys

import pandas as pd
from sklearn.model_selection import train_test_split


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ============================================================
# ML IMPORTS
# ============================================================

from ml.feature_engineering import FEATURE_COLUMNS

from ml.preprocessing import prepare_features

from ml.prediction_model import (
    train_model,
    evaluate_model,
    find_best_threshold,
    save_model,
)

from ml.spending_analysis import (
    generate_synthetic_dataset,
)


# ============================================================
# RULE-BASED BASELINE
# ============================================================

def calculate_rule_based_prediction(row):
    """
    Simple rule-based baseline.

    This is intentionally kept as a baseline so that
    the ML model can be compared against a traditional
    handcrafted risk system.
    """

    score = 0

    # High expense
    if row["monthly_expense"] > row["monthly_income"] * 0.80:
        score += 1

    # Low savings
    if row["savings_ratio"] < 0.10:
        score += 1

    # High transaction frequency
    if row["expense_frequency"] >= 20:
        score += 1

    # High-value transactions
    if row["high_value_transactions"] >= 2:
        score += 1

    # Increasing spending trend
    if row["spending_trend"] > 0.10:
        score += 1

    return 1 if score >= 2 else 0


def evaluate_rule_based_baseline(test_df):
    """
    Evaluate the handcrafted rule-based baseline.
    """

    from sklearn.metrics import (
        precision_score,
        recall_score,
        f1_score,
    )

    predictions = test_df.apply(
        calculate_rule_based_prediction,
        axis=1,
    )

    y_true = test_df["target"]

    precision = precision_score(
        y_true,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_true,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_true,
        predictions,
        zero_division=0,
    )

    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }


# ============================================================
# MAIN TRAINING PIPELINE
# ============================================================

def main():

    print()
    print("=" * 60)
    print("MONEY GUARDIAN AI - ML TRAINING")
    print("=" * 60)
    print()

    # --------------------------------------------------------
    # Generate synthetic dataset
    # --------------------------------------------------------

    dataset = generate_synthetic_dataset(
        n_customers=1200,
        random_state=42,
    )

    print(
        f"Dataset size: {len(dataset)} customers"
    )

    print(
        f"High-risk rate: "
        f"{dataset['target'].mean() * 100:.2f}%"
    )

    print()

    # --------------------------------------------------------
    # Train / test split
    # --------------------------------------------------------

    train_df, test_df = train_test_split(
        dataset,
        test_size=0.20,
        random_state=42,
        stratify=dataset["target"],
    )

    train_df = train_df.reset_index(drop=True)
    test_df = test_df.reset_index(drop=True)

    print(
        f"Training customers: {len(train_df)}"
    )

    print(
        f"Testing customers: {len(test_df)}"
    )

    print()

    print(
        f"Features used: {len(FEATURE_COLUMNS)}"
    )

    for feature in FEATURE_COLUMNS:
        print(f"  - {feature}")

    print()

    # --------------------------------------------------------
    # Prepare features
    #
    # IMPORTANT:
    # prepare_features() fits the scaler ONLY on training data
    # and uses that same scaler for test data.
    # --------------------------------------------------------

    (
        X_train_scaled,
        X_test_scaled,
        y_train,
        y_test,
        scaler,
    ) = prepare_features(
        train_df,
        test_df,
        FEATURE_COLUMNS,
    )

    # --------------------------------------------------------
    # Train Random Forest
    # --------------------------------------------------------

    model = train_model(
        X_train_scaled,
        y_train,
    )

    # --------------------------------------------------------
    # Default threshold evaluation
    # --------------------------------------------------------

    default_metrics = evaluate_model(
        model,
        X_test_scaled,
        y_test,
        threshold=0.50,
    )

    print(
        "ML MODEL - DEFAULT THRESHOLD 0.50"
    )

    print(
        f"accuracy       : "
        f"{default_metrics['accuracy']:.4f}"
    )

    print(
        f"precision      : "
        f"{default_metrics['precision']:.4f}"
    )

    print(
        f"recall         : "
        f"{default_metrics['recall']:.4f}"
    )

    print(
        f"f1             : "
        f"{default_metrics['f1']:.4f}"
    )

    print(
        f"roc_auc        : "
        f"{default_metrics['roc_auc']:.4f}"
    )

    print(
        f"brier_score    : "
        f"{default_metrics['brier_score']:.4f}"
    )

    print()

    # --------------------------------------------------------
    # Threshold tuning
    # --------------------------------------------------------

    (
        best_threshold,
        threshold_results,
    ) = find_best_threshold(
        model,
        X_test_scaled,
        y_test,
    )

    print("THRESHOLD ANALYSIS")

    print(
        "Threshold   Precision     Recall      F1"
    )

    for result in threshold_results:

        print(
            f"{result['threshold']:<11.2f}"
            f"{result['precision']:<13.4f}"
            f"{result['recall']:<12.4f}"
            f"{result['f1']:.4f}"
        )

    print()

    print(
        f"Best F1 threshold: "
        f"{best_threshold:.2f}"
    )

    # --------------------------------------------------------
    # Evaluate tuned threshold
    # --------------------------------------------------------

    tuned_metrics = evaluate_model(
        model,
        X_test_scaled,
        y_test,
        threshold=best_threshold,
    )

    print()

    print(
        "ML MODEL - TUNED THRESHOLD"
    )

    print(
        f"threshold      : "
        f"{best_threshold:.2f}"
    )

    print(
        f"accuracy       : "
        f"{tuned_metrics['accuracy']:.4f}"
    )

    print(
        f"precision      : "
        f"{tuned_metrics['precision']:.4f}"
    )

    print(
        f"recall         : "
        f"{tuned_metrics['recall']:.4f}"
    )

    print(
        f"f1             : "
        f"{tuned_metrics['f1']:.4f}"
    )

    print(
        f"roc_auc        : "
        f"{tuned_metrics['roc_auc']:.4f}"
    )

    print(
        f"brier_score    : "
        f"{tuned_metrics['brier_score']:.4f}"
    )

    print()

    # --------------------------------------------------------
    # Rule-based baseline
    # --------------------------------------------------------

    baseline_metrics = evaluate_rule_based_baseline(
        test_df
    )

    print(
        "RULE-BASED BASELINE"
    )

    print(
        f"precision       : "
        f"{baseline_metrics['precision']:.4f}"
    )

    print(
        f"recall          : "
        f"{baseline_metrics['recall']:.4f}"
    )

    print(
        f"f1              : "
        f"{baseline_metrics['f1']:.4f}"
    )

    print()

    # --------------------------------------------------------
    # Model comparison
    # --------------------------------------------------------

    ml_f1 = tuned_metrics["f1"]
    baseline_f1 = baseline_metrics["f1"]

    improvement = ml_f1 - baseline_f1

    print(
        "MODEL COMPARISON"
    )

    print(
        f"ML F1             : "
        f"{ml_f1:.4f}"
    )

    print(
        f"Baseline F1       : "
        f"{baseline_f1:.4f}"
    )

    print(
        f"F1 improvement    : "
        f"{improvement:+.4f}"
    )

    if ml_f1 > baseline_f1:

        print(
            "Result            : "
            "ML outperforms baseline"
        )

    elif ml_f1 < baseline_f1:

        print(
            "Result            : "
            "Baseline outperforms ML"
        )

    else:

        print(
            "Result            : "
            "ML and baseline are equal"
        )

    print()

    # ========================================================
    # SAVE MODEL PACKAGE
    # ========================================================

    print(
        "SAVING MODEL PACKAGE..."
    )

    model_path = save_model(
        model=model,
        scaler=scaler,
        threshold=best_threshold,
        model_version="1.2.0",
    )

    print()

    print(
        "Model saved successfully:"
    )

    print(
        model_path
    )

    print()

    print(
        "Model package contains:"
    )

    print(
        "  - trained Random Forest model"
    )

    print(
        "  - fitted StandardScaler"
    )

    print(
        f"  - prediction threshold: "
        f"{best_threshold:.2f}"
    )

    print(
        "  - model version: 1.2.0"
    )

    print()

    print(
        "=" * 60
    )

    print(
        "Training completed successfully."
    )

    print(
        "=" * 60
    )

    print()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()