"""
Leakage-safe preprocessing and dataset splitting.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import StandardScaler


def split_dataset(
    dataframe: pd.DataFrame,
    target_column: str = "target",
    group_column: str = "customer_id",
    test_size: float = 0.20,
    random_state: int = 42,
):
    """
    Split data by customer rather than by individual rows.

    This prevents transactions/behavior records from the same
    customer appearing in both train and test sets.
    """

    if dataframe.empty:
        raise ValueError(
            "Training dataframe cannot be empty."
        )

    if target_column not in dataframe.columns:
        raise ValueError(
            f"Missing target column: {target_column}"
        )

    if group_column not in dataframe.columns:
        raise ValueError(
            f"Missing group column: {group_column}"
        )

    splitter = GroupShuffleSplit(
        n_splits=1,
        test_size=test_size,
        random_state=random_state,
    )

    train_indices, test_indices = next(
        splitter.split(
            dataframe,
            dataframe[target_column],
            groups=dataframe[group_column],
        )
    )

    train_df = dataframe.iloc[
        train_indices
    ].reset_index(drop=True)

    test_df = dataframe.iloc[
        test_indices
    ].reset_index(drop=True)

    return train_df, test_df


def prepare_features(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    feature_columns: list[str],
    target_column: str = "target",
):
    """
    Prepare X/y matrices.

    The scaler is fitted ONLY on training data.
    """

    X_train = train_df[
        feature_columns
    ].astype(float)

    X_test = test_df[
        feature_columns
    ].astype(float)

    y_train = train_df[
        target_column
    ].astype(int)

    y_test = test_df[
        target_column
    ].astype(int)

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(
        X_train
    )

    X_test_scaled = scaler.transform(
        X_test
    )

    return (
        X_train_scaled,
        X_test_scaled,
        y_train.to_numpy(),
        y_test.to_numpy(),
        scaler,
    )