"""
Vitalis Predictive Stockout Engine & Machine Learning Pipeline
Trains:
  1. Model A: Meta Prophet Forecasting Engine (14-day rolling demand intervals)
  2. Model B: XGBoost Depletion Guardrail Classifier (72-hour donor stockout risk)
Aligns with BCSE335L Module 3 & Module 5 requirements.
"""

import os
import pickle
import json
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

# Meta Prophet
from prophet import Prophet

# XGBoost & Scikit-learn
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_recall_curve, auc, recall_score, classification_report

# Ensure reproducibility
np.random.seed(42)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

def generate_nhamcs_synthetic_data(start_date="2024-01-01", n_days=730):
    """
    Synthesize realistic emergency department clinical microdata aligned with
    CDC NHAMCS (National Hospital Ambulatory Medical Care Survey) trauma & transfusion distributions.
    """
    dates = pd.date_range(start=start_date, periods=n_days, freq="D")
    records = []

    # Hospital facility configurations
    facilities = [
        {"id": "c71a399f-07da-4e4b-91c2-559d81373516", "name": "Apollo Greams Rd", "trauma_level": 1, "hac_score": 96.50, "base_volume": 14},
        {"id": "993a2164-3e9a-4131-b840-798889da3b2b", "name": "RBTC Central", "trauma_level": 1, "hac_score": 98.40, "base_volume": 25},
        {"id": "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d", "name": "RGGGH Apex", "trauma_level": 1, "hac_score": 91.20, "base_volume": 20},
        {"id": "b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e", "name": "Fortis Malar", "trauma_level": 2, "hac_score": 74.00, "base_volume": 6},
        {"id": "c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f", "name": "Stanley Medical", "trauma_level": 1, "hac_score": 88.50, "base_volume": 16},
        {"id": "d4e5f6a1-b2c3-4d4e-bf5a-6b7c8d9e0f1a", "name": "SRMC Porur", "trauma_level": 1, "hac_score": 76.50, "base_volume": 12},
    ]

    for d in dates:
        day_of_week = d.dayofweek
        month = d.month
        # Weekend trauma surge (Friday night to Sunday)
        weekend_factor = 1.35 if day_of_week in [4, 5, 6] else 1.0
        # Monsoon / festival seasonal trauma spike in Chennai (Oct-Dec)
        seasonal_factor = 1.25 if month in [10, 11, 12] else 1.0

        for fac in facilities:
            mean_demand = fac["base_volume"] * weekend_factor * seasonal_factor
            # Daily PRBC transfusion consumption (Poisson distributed)
            actual_consumption = np.random.poisson(lam=mean_demand)
            # Emergency Severity Index (ESI) distribution: ESI 1 (10%), ESI 2 (30%), ESI 3 (40%), ESI 4-5 (20%)
            esi_1_cases = np.random.binomial(n=max(1, actual_consumption), p=0.20)

            records.append({
                "date": d,
                "facility_id": fac["id"],
                "facility_name": fac["name"],
                "trauma_level": fac["trauma_level"],
                "hac_score": fac["hac_score"],
                "blood_group": "O-", # Focus on universal emergency donor
                "resource_type": "PRBC",
                "units_consumed": actual_consumption,
                "esi_1_count": esi_1_cases
            })

    df = pd.DataFrame(records)
    csv_path = DATA_DIR / "nhamcs_consumption_history.csv"
    df.to_csv(csv_path, index=False)
    print(f"[DATA] Generated {len(df)} NHAMCS consumption records -> {csv_path}")
    return df

def train_prophet_model(df):
    """
    Model A: Meta Prophet Forecasting Engine
    Config: linear growth, yearly=True, weekly=True, interval_width=0.80.
    Evaluated with Mean Absolute Scaled Error (MASE < 1.15).
    """
    print("\n--- Training Model A: Meta Prophet Forecasting Engine ---")
    # Aggregate daily network-wide PRBC demand
    daily_agg = df.groupby("date")["units_consumed"].sum().reset_index()
    daily_agg.columns = ["ds", "y"]

    # 80/20 Train-Test split temporally
    split_idx = int(len(daily_agg) * 0.85)
    train_df = daily_agg.iloc[:split_idx]
    test_df = daily_agg.iloc[split_idx:]

    model = Prophet(
        growth="linear",
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        interval_width=0.80
    )
    model.fit(train_df)

    # Evaluate on test horizon
    future = model.make_future_dataframe(periods=len(test_df), freq="D")
    forecast = model.predict(future)
    test_forecast = forecast.iloc[split_idx:].set_index("ds")
    actuals = test_df.set_index("ds")["y"]

    y_pred = test_forecast["yhat"].values
    y_true = actuals.values

    # Calculate MASE (Mean Absolute Scaled Error relative to naive 1-day lag forecast)
    mae_model = np.mean(np.abs(y_true - y_pred))
    naive_forecast = train_df["y"].values[:-1]
    naive_actual = train_df["y"].values[1:]
    mae_naive = np.mean(np.abs(naive_actual - naive_forecast))
    mase = mae_model / (mae_naive + 1e-6)

    print(f"[PROPHET EVAL] Test MAE: {mae_model:.2f} units")
    print(f"[PROPHET EVAL] Naive Baseline MAE: {mae_naive:.2f} units")
    print(f"[PROPHET EVAL] MASE: {mase:.3f} (Benchmark required: < 1.15)")
    assert mase < 1.15, f"MASE {mase:.3f} exceeds threshold 1.15"

    # Save serialized model artifact
    prophet_path = MODELS_DIR / "prophet_model.pkl"
    with open(prophet_path, "wb") as f:
        pickle.dump(model, f)
    print(f"[ARTIFACT] Meta Prophet model serialized -> {prophet_path}")
    return model, daily_agg

def train_xgboost_classifier(df, prophet_model, daily_agg):
    """
    Model B: XGBoost Depletion Guardrail Classifier
    Predicts 72-hour stockout probability P(Y = 1 | x).
    Feature vector x = [current_inventory - k, y_hat_t<=3, HAC_score, trauma_level, burn_rate_7d].
    Requires PR-AUC >= 0.82 and Recall >= 0.90.
    """
    print("\n--- Training Model B: XGBoost Depletion Guardrail Classifier ---")

    # Generate simulation scenarios for donor facilities
    # For each facility & date, evaluate candidate transfer donation k in [1, 2, 4, 6, 8, 10] units
    samples = []
    
    # Pre-calculate 7-day rolling burn rate per facility
    df = df.sort_values(["facility_id", "date"]).copy()
    df["burn_rate_7d"] = df.groupby("facility_id")["units_consumed"].transform(
        lambda s: s.rolling(7, min_periods=1).mean()
    )

    # Pre-calculate Prophet 3-day projected consumption y_hat_t<=3
    forecast = prophet_model.predict(prophet_model.make_future_dataframe(periods=30, freq="D"))
    forecast_map = dict(zip(pd.to_datetime(forecast["ds"]).dt.strftime("%Y-%m-%d"), forecast["yhat"]))

    unique_dates = df["date"].unique()
    facilities = df[["facility_id", "trauma_level", "hac_score"]].drop_duplicates().to_dict("records")

    for d in unique_dates[14:]: # allow 14 days warm-up for rolling metrics
        date_str = pd.to_datetime(d).strftime("%Y-%m-%d")
        yhat_3d = (forecast_map.get(date_str, 80.0) / len(facilities)) * 3.0 # Approx 3-day facility projected draw

        for fac in facilities:
            fac_id = fac["facility_id"]
            hac = fac["hac_score"]
            trauma = fac["trauma_level"]

            # Current inventory baseline for facility
            sub = df[(df["date"] == d) & (df["facility_id"] == fac_id)]
            if sub.empty:
                continue
            burn_rate = float(sub["burn_rate_7d"].values[0])

            # Simulate varied current inventory levels (e.g. 5 to 60 units)
            for current_inv in [6, 12, 18, 24, 35, 50]:
                for k in [1, 2, 4, 6, 8, 10]:
                    remaining_inv = current_inv - k
                    # True stockout event: if remaining inventory cannot cover 72h actual burn rate
                    # (with safety margin for high trauma facilities)
                    safety_threshold = burn_rate * 3.0 * (1.2 if trauma == 1 else 1.0)
                    is_stockout = 1 if remaining_inv < safety_threshold else 0

                    samples.append({
                        "remaining_inventory": remaining_inv,
                        "yhat_3d": yhat_3d,
                        "hac_score": hac,
                        "trauma_level": trauma,
                        "burn_rate_7d": burn_rate,
                        "is_stockout": is_stockout
                    })

    dataset = pd.DataFrame(samples)
    feature_cols = ["remaining_inventory", "yhat_3d", "hac_score", "trauma_level", "burn_rate_7d"]
    X = dataset[feature_cols]
    y = dataset["is_stockout"]

    print(f"[XGBOOST] Dataset size: {len(dataset)} samples | Positive stockout cases: {y.sum()} ({y.mean()*100:.1f}%)")

    # Stratified split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    # Counteract sparse stockout incidents via tuned scale_pos_weight
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_pos_weight = neg_count / (pos_count + 1e-6)

    clf = xgb.XGBClassifier(
        objective="binary:logistic",
        max_depth=5,
        learning_rate=0.05,
        n_estimators=250,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric="logloss"
    )

    clf.fit(X_train, y_train)

    # Evaluate PR-AUC and Recall
    y_probs = clf.predict_proba(X_test)[:, 1]
    precision, recall_curve_pts, _ = precision_recall_curve(y_test, y_probs)
    pr_auc = auc(recall_curve_pts, precision)

    # Evaluate recall at guardrail threshold 0.40
    y_pred_guardrail = (y_probs >= 0.40).astype(int)
    recall_at_guardrail = recall_score(y_test, y_pred_guardrail)

    print(f"[XGBOOST EVAL] PR-AUC: {pr_auc:.3f} (Benchmark required: >= 0.82)")
    print(f"[XGBOOST EVAL] Recall (Threshold 0.40): {recall_at_guardrail:.3f} (Benchmark required: >= 0.90)")

    assert pr_auc >= 0.82, f"PR-AUC {pr_auc:.3f} below 0.82 threshold"
    assert recall_at_guardrail >= 0.90, f"Recall {recall_at_guardrail:.3f} below 0.90 threshold"

    # Export weights / JSON
    xgb_json_path = MODELS_DIR / "xgb_stockout.json"
    clf.save_model(str(xgb_json_path))
    print(f"[ARTIFACT] XGBoost model exported -> {xgb_json_path}")

    # Also save metadata for runtime feature reconstruction
    meta_path = MODELS_DIR / "xgb_metadata.json"
    with open(meta_path, "w") as f:
        json.dump({
            "features": feature_cols,
            "pr_auc": float(pr_auc),
            "recall": float(recall_at_guardrail),
            "guardrail_threshold": 0.40,
            "trained_at": datetime.now().isoformat()
        }, f, indent=2)
    print(f"[ARTIFACT] Model metadata saved -> {meta_path}")

    return clf

def main():
    print("==================================================================")
    print("VITALIS PHASE 2: PREDICTIVE STOCKOUT ENGINE & ML PIPELINE")
    print("==================================================================")
    df = generate_nhamcs_synthetic_data()
    prophet_model, daily_agg = train_prophet_model(df)
    train_xgboost_classifier(df, prophet_model, daily_agg)
    print("\n[SUCCESS] Phase 2: All ML pipeline models trained and serialized successfully.")

if __name__ == "__main__":
    main()
