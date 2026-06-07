import pandas as pd
import numpy as np
import joblib
import os
import sys
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from src.data.streets import STREET_COORDINATES

def predict_all_streets():
    """
    Loads the trained XGBoost models and the latest feature matrix,
    then predicts AQI for all 30 streets across all horizons.
    """
    feature_matrix_path = ROOT / "data/features/feature_matrix.csv"
    if not os.path.exists(feature_matrix_path):
        raise FileNotFoundError(f"Feature matrix not found at {feature_matrix_path}. Run step7 first.")
    
    df_features = pd.read_csv(feature_matrix_path)
    
    # Get the latest data point for each street
    latest_features = df_features.sort_values('time').groupby('street_id').tail(1).reset_index(drop=True)
    
    if len(latest_features) == 0:
        raise ValueError("No data found in feature matrix.")

    results = latest_features[['street_id', 'lat', 'lon']].copy()
    
    # Predict for each horizon
    horizons = [6, 12, 18, 24]
    for h in horizons:
        model_path = ROOT / f"src/models/saved/model_t{h}.joblib"
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            
            # PROBLEM 4 FIX: Strict column validation
            if hasattr(model, 'feature_names_in_'):
                expected = list(model.feature_names_in_)
                actual = list(latest_features.columns)
                missing = [f for f in expected if f not in actual]
                if missing:
                    raise ValueError(
                        f"CRITICAL: Feature mismatch for t+{h}h model.\n"
                        f"Missing features: {missing}\n"
                        f"Please re-run pipeline/step7_model.py to update the feature matrix."
                    )
                X = latest_features[expected]
            else:
                # Fallback if feature_names_in_ is missing
                X = latest_features.select_dtypes(include=[np.number])
                target_cols = [f'target_{hor}' for hor in [6, 12, 18, 24]]
                X = X.drop(columns=[col for col in target_cols + ['TARGET_VAL'] if col in X.columns])
            
            results[f'pred_t{h}'] = model.predict(X)
        else:
            print(f"Warning: Model for t+{h}h not found at {model_path}. Using zeros.")
            results[f'pred_t{h}'] = 0.0
            
    return results

if __name__ == "__main__":
    preds = predict_all_streets()
    print(preds.head())
