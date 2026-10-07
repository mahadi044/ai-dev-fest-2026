import joblib

from pathlib import Path

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    brier_score_loss,
)


# ============================================================
# MODEL PATH
# ============================================================

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "money_guardian_risk_model.joblib"
)


# ============================================================
# CREATE MODEL
# ============================================================

def create_model():
    """
    Create the Random Forest financial-risk prediction model.
    """

    return RandomForestClassifier(
        n_estimators=400,
        max_depth=10,
        min_samples_split=8,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )


# ============================================================
# TRAIN MODEL
# ============================================================

def train_model(X_train, y_train):
    """
    Train the Random Forest model.
    """

    model = create_model()

    model.fit(
        X_train,
        y_train,
    )

    return model


# ============================================================
# EVALUATE MODEL
# ============================================================

def evaluate_model(
    model,
    X_test,
    y_test,
    threshold=0.50,
):
    """
    Evaluate model performance using a configurable
    probability threshold.
    """

    probabilities = model.predict_proba(
        X_test
    )[:, 1]

    predictions = (
        probabilities >= threshold
    ).astype(int)

    metrics = {
        "accuracy": accuracy_score(
            y_test,
            predictions,
        ),
        "precision": precision_score(
            y_test,
            predictions,
            zero_division=0,
        ),
        "recall": recall_score(
            y_test,
            predictions,
            zero_division=0,
        ),
        "f1": f1_score(
            y_test,
            predictions,
            zero_division=0,
        ),
        "roc_auc": roc_auc_score(
            y_test,
            probabilities,
        ),
        "brier_score": brier_score_loss(
            y_test,
            probabilities,
        ),
    }

    return metrics


# ============================================================
# FIND BEST THRESHOLD
# ============================================================

def find_best_threshold(
    model,
    X_test,
    y_test,
):
    """
    Search for a probability threshold that maximizes F1.
    """

    probabilities = model.predict_proba(
        X_test
    )[:, 1]

    best_threshold = 0.50
    best_f1 = 0.0

    threshold_results = []

    for threshold in [
        0.15,
        0.20,
        0.25,
        0.30,
        0.35,
        0.40,
        0.45,
        0.50,
        0.55,
        0.60,
        0.65,
        0.70,
    ]:

        predictions = (
            probabilities >= threshold
        ).astype(int)

        precision = precision_score(
            y_test,
            predictions,
            zero_division=0,
        )

        recall = recall_score(
            y_test,
            predictions,
            zero_division=0,
        )

        f1 = f1_score(
            y_test,
            predictions,
            zero_division=0,
        )

        threshold_results.append(
            {
                "threshold": threshold,
                "precision": precision,
                "recall": recall,
                "f1": f1,
            }
        )

        if f1 > best_f1:
            best_f1 = f1
            best_threshold = threshold

    return (
        best_threshold,
        threshold_results,
    )


# ============================================================
# PREDICT RISK
# ============================================================

def predict_risk(
    model,
    feature_vector,
    threshold_low=0.35,
    threshold_high=0.65,
):
    """
    Predict personalized financial risk.
    """

    probability = model.predict_proba(
        [feature_vector]
    )[0][1]

    score = round(
        probability * 100,
        2,
    )

    if probability < threshold_low:
        risk_level = "Low"

    elif probability < threshold_high:
        risk_level = "Medium"

    else:
        risk_level = "High"

    return {
        "probability": round(
            float(probability),
            4,
        ),
        "risk_score": score,
        "risk_level": risk_level,
    }


# ============================================================
# SAVE MODEL
# ============================================================

def save_model(
    model,
    scaler=None,
    threshold=0.50,
    model_version="1.2.0",
):
    """
    Save the trained model together with:
    - scaler
    - prediction threshold
    - model version

    The scaler is required during prediction so that
    inference uses the exact same preprocessing
    as training.
    """

    model_package = {
        "model": model,
        "scaler": scaler,
        "threshold": threshold,
        "model_version": model_version,
    }

    joblib.dump(
        model_package,
        MODEL_PATH,
    )

    return MODEL_PATH


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():
    """
    Load trained model package.
    """

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Trained model not found: {MODEL_PATH}"
        )

    package = joblib.load(
        MODEL_PATH
    )

    # --------------------------------------------------------
    # New model package
    # --------------------------------------------------------

    if isinstance(package, dict):

        # If scaler is missing from an older model,
        # return the package as-is. The training process
        # will create a new compatible model.
        return package

    # --------------------------------------------------------
    # Backward compatibility for old model-only files
    # --------------------------------------------------------

    return {
        "model": package,
        "scaler": None,
        "threshold": 0.50,
        "model_version": "1.0.0",
    }