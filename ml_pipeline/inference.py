"""
Vitalis Machine Learning Inference API (ml_pipeline/inference.py)
Production entrypoint for model inference, demand forecasting, and stockout guardrail evaluations.
"""

import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Configure utf-8 stdout encoding for Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from typing import Dict, Any, List
from backend.ml.service import ml_service

def predict_stockout_risk(
    remaining_inventory: float,
    yhat_3d: float,
    hac_score: float,
    trauma_level: int,
    burn_rate_7d: float
) -> Dict[str, Any]:
    """
    Evaluates probability P(Y = 1 | x) that donor inventory depletes within 72 hours.
    Returns prediction, threshold status, and buffer deficit analysis.
    """
    return ml_service.predict_stockout_risk(
        remaining_inventory=remaining_inventory,
        yhat_3d=yhat_3d,
        hac_score=hac_score,
        trauma_level=trauma_level,
        burn_rate_7d=burn_rate_7d
    )

def forecast_demand(days_ahead: int = 14) -> List[Dict[str, Any]]:
    """
    Returns rolling 14-day Meta Prophet point forecasts and 80% uncertainty bounds.
    """
    return ml_service.forecast_demand_curve(days_ahead=days_ahead)

if __name__ == "__main__":
    print("Testing ML Inference Engine...")
    test_result = predict_stockout_risk(
        remaining_inventory=24,
        yhat_3d=20.0,
        hac_score=98.4,
        trauma_level=1,
        burn_rate_7d=6.5
    )
    print("Prediction Result:", test_result)

    forecast = forecast_demand(7)
    print(f"Generated {len(forecast)}-day demand forecast:")
    for pt in forecast:
        print(f"  {pt['date']}: y_hat={pt['yhat']} [{pt['yhat_lower']} - {pt['yhat_upper']}]")
