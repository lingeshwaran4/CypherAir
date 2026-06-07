import pandas as pd
import numpy as np
import joblib
import os
import json
import sys
from datetime import datetime
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT / "src"))

# Real Industrial Locations for feature calculation
INDUSTRIAL_LOCATIONS = [
    (13.206536, 80.310603), # Ennore Thermal Power Station
    (13.211032, 80.320505), # Ashok Leyland, Ennore
    (13.235412, 80.305274), # NTPC Tamilnadu Energy
    (13.246085, 80.319156), # North Chennai Thermal Power Station
    (13.242844, 80.322477)  # Plant air compressor building
]

def calculate_min_distance(lat, lon, locations):
    min_dist = float('inf')
    for i_lat, i_lon in locations:
        dist = np.sqrt(((lat - i_lat) * 111)**2 + ((lon - i_lon) * 111)**2)
        if dist < min_dist:
            min_dist = dist
    return min_dist + 0.1

def index_of_agreement(observed, predicted):
    obs_mean = np.mean(observed)
    numerator = np.sum((observed - predicted)**2)
    denominator = np.sum((np.abs(predicted - obs_mean) + np.abs(observed - obs_mean))**2)
    return 1 - (numerator / denominator) if denominator != 0 else 0.0

def run_pipeline():
    print("========================================")
    print("  Cypher Air - XGBoost Training Pipeline")
    print("  North Chennai Industrial Corridor")
    print("========================================")

    try:
        data_path = ROOT / "final_dataset.csv"
        if not os.path.exists(data_path):
            print(f"CRITICAL ERROR: {data_path} not found!")
            sys.exit(1)
            
        df = pd.read_csv(data_path)
        df['time'] = pd.to_datetime(df['time'])
        
        target_candidates = ['AQI_Target', 'sensor_aqi', 'aqi_final', 'aqi']
        target_col = next((c for c in target_candidates if c in df.columns), None)
        if not target_col:
            raise ValueError("No AQI target column found!")
        
        df['TARGET_VAL'] = df[target_col]
        print(f"Using '{target_col}' as target.")

        if 'street_id' in df.columns:
            df = df.sort_values(['street_id', 'time']).reset_index(drop=True)
        else:
            df = df.sort_values('time').reset_index(drop=True)
            
        print(f"Total rows: {len(df)} | Unique streets: {df['street_id'].nunique() if 'street_id' in df.columns else 1}")

    except Exception as e:
        print(f"STAGE 1 FAILED: {str(e)}")
        sys.exit(1)

    try:
        print("\n--- STAGE 2: Building Features ---")
        df = df.copy()
        if 'dist_to_ind' not in df.columns and 'latitude' in df.columns:
            df['dist_to_ind'] = df.apply(lambda r: calculate_min_distance(r['latitude'], r['longitude'], INDUSTRIAL_LOCATIONS), axis=1)
        if 'industrial_pollution' not in df.columns and 'emission_intensity' in df.columns:
            df['industrial_pollution'] = df['emission_intensity']
        if 'traffic' not in df.columns and 'current_speed' in df.columns:
            df['traffic'] = df['current_speed']

        for h in [1, 3, 6, 12, 24]:
            if 'street_id' in df.columns:
                df[f'aqi_lag{h}'] = df.groupby('street_id')['TARGET_VAL'].shift(h)
            else:
                df[f'aqi_lag{h}'] = df['TARGET_VAL'].shift(h)

        for h in [3, 6, 12, 24]:
            if 'street_id' in df.columns:
                df[f'aqi_roll{h}'] = df.groupby('street_id')['TARGET_VAL'].transform(lambda x: x.rolling(h).mean())
            else:
                df[f'aqi_roll{h}'] = df['TARGET_VAL'].rolling(h).mean()

        if 'street_id' in df.columns:
            df['aqi_roll6_std'] = df.groupby('street_id')['TARGET_VAL'].transform(lambda x: x.rolling(6).std()).fillna(0)
        else:
            df['aqi_roll6_std'] = df['TARGET_VAL'].rolling(6).std().fillna(0)

        df['hour'] = df['time'].dt.hour
        df['day_of_week'] = df['time'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
        df['month'] = df['time'].dt.month
        df['industrial_shift'] = df['hour'].apply(lambda x: 1 if x in [6,7,8,14,15,22,23] else 0)
        df['peak_traffic'] = df['hour'].apply(lambda x: 1 if x in [7,8,9,17,18,19] else 0)

        if 'wind' in df.columns and 'humidity' in df.columns:
            df['wind_humidity'] = df['wind'] * df['humidity']
        elif 'wind_speed' in df.columns and 'humidity_weather' in df.columns:
            df['wind_humidity'] = df['wind_speed'] * df['humidity_weather']
        
        if 'industrial_pollution' in df.columns and 'dist_to_ind' in df.columns:
            df['ind_dist_weighted'] = df['industrial_pollution'] / (df['dist_to_ind'] + 0.1)

        for h in [6, 12, 18, 24]:
            if 'street_id' in df.columns:
                df[f'target_{h}'] = df.groupby('street_id')['TARGET_VAL'].shift(-h)
            else:
                df[f'target_{h}'] = df['TARGET_VAL'].shift(-h)

        rows_before = len(df)
        lag_cols = [c for c in df.columns if 'lag' in c or 'roll' in c]
        df = df.dropna(subset=lag_cols).reset_index(drop=True)
        print(f"Dropped rows with null lags: {rows_before} -> {len(df)}")
        
        feature_path = ROOT / "data/features"
        feature_path.mkdir(parents=True, exist_ok=True)
        df.to_csv(feature_path / "feature_matrix.csv", index=False)
        print(f"v Saved {feature_path / 'feature_matrix.csv'}")

    except Exception as e:
        print(f"STAGE 2 FAILED: {str(e)}")
        sys.exit(1)

    try:
        print("\n--- STAGE 3: Training Horizon Models ---")
        base_cols = ['temp', 'humidity', 'wind', 'traffic', 'industrial_pollution', 'dist_to_ind', 
                     'temp_weather', 'humidity_weather', 'wind_speed', 'current_speed']
        candidate_cols = base_cols + [
            'aqi_lag1', 'aqi_lag3', 'aqi_lag6', 'aqi_lag12', 'aqi_lag24',
            'aqi_roll3', 'aqi_roll6', 'aqi_roll12', 'aqi_roll24', 'aqi_roll6_std',
            'hour', 'day_of_week', 'is_weekend', 'month', 'industrial_shift', 'peak_traffic',
            'wind_humidity', 'ind_dist_weighted'
        ]
        feature_cols = [c for c in candidate_cols if c in df.columns]
        
        results = []
        model_save_path = ROOT / "src/models/saved"
        model_save_path.mkdir(parents=True, exist_ok=True)
        print(f"{'Horizon':<10} | {'Train':<7} | {'Test':<7} | {'MAE':<7} | {'RMSE':<7} | {'d'}")
        print("-" * 65)

        for h in [6, 12, 18, 24]:
            target_h = f'target_{h}'
            h_df = df.dropna(subset=[target_h]).copy()
            if len(h_df) < 20: continue

            split_idx = int(len(h_df) * 0.80)
            train_df, test_df = h_df.iloc[:split_idx], h_df.iloc[split_idx:]
            X_train, y_train = train_df[feature_cols], train_df[target_h]
            X_test, y_test = test_df[feature_cols], test_df[target_h]

            # In newer XGBoost, early_stopping_rounds is in the constructor
            model = XGBRegressor(n_estimators=500, max_depth=6, learning_rate=0.05, 
                                 subsample=0.8, colsample_bytree=0.8, min_child_weight=3,
                                 random_state=42, n_jobs=-1,
                                 early_stopping_rounds=30, eval_metric='mae')
            
            model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

            preds = model.predict(X_test)
            mae = mean_absolute_error(y_test, preds)
            rmse = np.sqrt(mean_squared_error(y_test, preds))
            d = index_of_agreement(y_test.values, preds)

            print(f"t+{h:<3}h   | {len(train_df):<7} | {len(test_df):<7} | {mae:<7.2f} | {rmse:<7.2f} | {d:.4f}")
            joblib.dump(model, model_save_path / f"model_t{h}.joblib")
            results.append({"horizon": f"t+{h}h", "mae": float(mae), "rmse": float(rmse), 
                            "index_of_agreement": float(d), "train_rows": len(train_df), "test_rows": len(test_df)})

    except Exception as e:
        print(f"STAGE 3 FAILED: {str(e)}")
        sys.exit(1)

    try:
        print("\n--- STAGE 4: Feature Importance (t+6h) ---")
        t6_path = ROOT / "src/models/saved/model_t6.joblib"
        if os.path.exists(t6_path):
            m = joblib.load(t6_path)
            feat_imp = sorted(zip(feature_cols, m.feature_importances_), key=lambda x: x[1], reverse=True)[:10]
            for feat, score in feat_imp:
                print(f"  {feat:<25} {score:.4f}  {'#' * int(score * 300)}")

    except Exception as e:
        print(f"STAGE 4 FAILED: {str(e)}")

    try:
        print("\n--- STAGE 5: Summary Metrics ---")
        print("+---------+--------+--------+---------------------+")
        print("| Horizon |  MAE   |  RMSE  |  Index of Agreement |")
        print("+---------+--------+--------+---------------------+")
        for res in results:
            print(f"| {res['horizon']:<7} | {res['mae']:<6.2f} | {res['rmse']:<6.2f} | {res['index_of_agreement']:<19.4f} |")
        print("+---------+--------+--------+---------------------+")
        log_path = ROOT / "logs"
        log_path.mkdir(parents=True, exist_ok=True)
        report = {"trained_at": datetime.now().isoformat(), "total_rows": len(df), "results": results}
        with open(log_path / "training_report.json", "w") as f:
            json.dump(report, f, indent=4)
        print(f"v Saved {log_path / 'training_report.json'}")

    except Exception as e:
        print(f"STAGE 5 FAILED: {str(e)}")

        print("\n--- STAGE 6: Quick Prediction Test ---")
        if len(df) > 0:
            test_row = df.iloc[[-1]]
            print(f"Latest Timestamp: {test_row['time'].values[0]}")
            print(f"Street: {test_row['street_id'].values[0] if 'street_id' in df.columns else 'N/A'}")
            for h in [6, 12, 18, 24]:
                m_path = ROOT / f"src/models/saved/model_t{h}.joblib"
                if os.path.exists(m_path):
                    pred = joblib.load(m_path).predict(test_row[feature_cols])[0]
                    print(f"  t+{h:<2}h predicted AQI: {pred:.1f}")
        else:
            print("No data available for prediction test.")

    except Exception as e:
        print(f"STAGE 6 FAILED: {str(e)}")

    print("\n========================================")
    print("v Training complete")
    print("Next: run step8_feedback.py for error analysis")

if __name__ == "__main__":
    run_pipeline()
