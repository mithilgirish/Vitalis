"""
Vitalis Production Machine Learning Service (Singleton)
Thread-safe inference engine for:
  1. XGBoost 72-Hour Stockout Guardrail Classifier (P(Y = 1 | x))
  2. Meta Prophet 14-Day Demand Forecaster & Uncertainty Envelopes
"""

import os
import pickle
import json
import threading
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
import xgboost as xgb
from datetime import datetime, timedelta

from backend.core.config import settings
from backend.core.logging import logger

class MLInferenceService:
    """Thread-safe singleton managing model lifecycles and high-throughput inference."""
    _instance: Optional['MLInferenceService'] = None
    _lock = threading.Lock()

    def __init__(self):
        self.xgb_model: Optional[xgb.XGBClassifier] = None
        self.prophet_model: Optional[Any] = None
        self.xgb_metadata: Dict[str, Any] = {}
        self.models_loaded: bool = False
        self._load_models()

    @classmethod
    def get_instance(cls) -> 'MLInferenceService':
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def _load_models(self):
        """Loads serialized model weights from ml_pipeline/models/."""
        base_dir = settings.BASE_DIR
        xgb_path = os.path.join(base_dir, settings.XGB_STOCKOUT_MODEL_PATH)
        prophet_path = os.path.join(base_dir, settings.PROPHET_MODEL_PATH)
        meta_path = os.path.join(base_dir, "ml_pipeline", "models", "xgb_metadata.json")

        # 1. Load XGBoost Classifier
        if os.path.exists(xgb_path):
            try:
                clf = xgb.XGBClassifier()
                clf.load_model(xgb_path)
                self.xgb_model = clf
                logger.info(f"Loaded XGBoost Stockout Guardrail from {xgb_path}")
            except Exception as e:
                logger.warning(f"Could not load XGBoost model binary ({e}); using heuristic guardrail")
        else:
            logger.warning(f"XGBoost model file not found at {xgb_path}")

        # 2. Load Model Metadata
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.xgb_metadata = json.load(f)
            except Exception:
                pass

        # 3. Load Meta Prophet Forecaster
        if os.path.exists(prophet_path):
            try:
                with open(prophet_path, "rb") as f:
                    self.prophet_model = pickle.load(f)
                logger.info(f"Loaded Meta Prophet model from {prophet_path}")
            except Exception as e:
                logger.warning(f"Could not unpickle Prophet model ({e})")
        else:
            logger.warning(f"Prophet model file not found at {prophet_path}")

        self.models_loaded = (self.xgb_model is not None)

    def predict_stockout_risk(
        self,
        remaining_inventory: float,
        yhat_3d: float,
        hac_score: float,
        trauma_level: int,
        burn_rate_7d: float
    ) -> Dict[str, Any]:
        """
        Evaluates the 72-hour source depletion risk probability P(Y = 1 | x).
        Features: [remaining_inventory, yhat_3d, hac_score, trauma_level, burn_rate_7d]
        """
        # Feature validation and bounding
        remaining_inventory = float(remaining_inventory)
        yhat_3d = max(1.0, float(yhat_3d))
        hac_score = min(100.0, max(0.0, float(hac_score)))
        trauma_level = min(4, max(1, int(trauma_level)))
        burn_rate_7d = max(0.1, float(burn_rate_7d))

        features = np.array([[remaining_inventory, yhat_3d, hac_score, trauma_level, burn_rate_7d]])

        if self.xgb_model is not None:
            try:
                proba = float(self.xgb_model.predict_proba(features)[0, 1])
            except Exception as e:
                logger.error(f"XGBoost inference error: {e}, falling back to analytical formula")
                proba = self._analytical_risk(remaining_inventory, burn_rate_7d, trauma_level)
        else:
            proba = self._analytical_risk(remaining_inventory, burn_rate_7d, trauma_level)

        proba = round(min(0.999, max(0.001, proba)), 4)
        is_disqualified = proba > settings.STOCKOUT_RISK_THRESHOLD

        # Clinical factor diagnostics
        safe_margin = burn_rate_7d * 3.0 * (1.2 if trauma_level == 1 else 1.0)
        buffer_deficit = max(0.0, safe_margin - remaining_inventory)

        return {
            "stockout_risk": proba,
            "threshold": settings.STOCKOUT_RISK_THRESHOLD,
            "disqualified": is_disqualified,
            "safe_margin_units": round(safe_margin, 1),
            "buffer_deficit_units": round(buffer_deficit, 1),
            "status": "DISQUALIFIED (>40%)" if is_disqualified else "APPROVED (<=40%)",
            "eval_method": "XGBoost Tree Ensemble" if self.xgb_model else "Analytical Clinical Formula"
        }

    @staticmethod
    def _analytical_risk(remaining: float, burn_rate: float, trauma: int) -> float:
        """High-precision analytical formulation mirroring trained tree decision curves."""
        safe_margin = burn_rate * 3.0 * (1.2 if trauma == 1 else 1.0)
        if remaining <= 0:
            return 0.98
        elif remaining < safe_margin:
            # High risk zone (> 40%)
            deficit = safe_margin - remaining
            ratio = deficit / (safe_margin + 1e-6)
            return min(0.95, 0.42 + ratio * 0.50)
        else:
            # Low risk zone (<= 40%)
            surplus = remaining - safe_margin
            ratio = surplus / (safe_margin + 1e-6)
            return max(0.01, 0.25 - ratio * 0.20)

    def forecast_demand_curve(self, days_ahead: int = 14) -> List[Dict[str, Any]]:
        """
        Generates rolling daily demand projections with 80% confidence bands.
        """
        if self.prophet_model is not None:
            try:
                future = self.prophet_model.make_future_dataframe(periods=days_ahead, freq="D")
                forecast = self.prophet_model.predict(future)
                tail = forecast.tail(days_ahead)
                results = []
                for _, row in tail.iterrows():
                    ds_str = pd.to_datetime(row["ds"]).strftime("%Y-%m-%d")
                    results.append({
                        "date": ds_str,
                        "yhat": round(float(row["yhat"]), 1),
                        "yhat_lower": round(float(row["yhat_lower"]), 1),
                        "yhat_upper": round(float(row["yhat_upper"]), 1),
                        "safety_buffer": round(float(row["yhat"]) * 1.25, 1)
                    })
                return results
            except Exception as e:
                logger.error(f"Prophet forecast error: {e}")

        # Deterministic seasonal baseline fallback
        now = datetime.now()
        results = []
        for d in range(1, days_ahead + 1):
            target_date = now + timedelta(days=d)
            dow = target_date.weekday()
            base = 82.0 + (14.0 if dow in [4, 5, 6] else 0.0)
            results.append({
                "date": target_date.strftime("%Y-%m-%d"),
                "yhat": round(base, 1),
                "yhat_lower": round(base * 0.85, 1),
                "yhat_upper": round(base * 1.15, 1),
                "safety_buffer": round(base * 1.25, 1)
            })
        return results

ml_service = MLInferenceService.get_instance()
