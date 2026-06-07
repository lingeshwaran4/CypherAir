import sys
import os
import pandas as pd
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Get the absolute path of the backend directory (parent of services)
BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SMART_CITY_PATH = BACKEND_DIR / "smart_city_project"

# Allow override via env, but default to the robust local path
SMART_CITY_PATH = os.getenv("SMART_CITY_PATH")
if SMART_CITY_PATH:
    p = Path(SMART_CITY_PATH)
    if p.is_absolute():
        smart_city_full_path = p.resolve()
    else:
        # Resolve relative to the backend directory
        smart_city_full_path = (BACKEND_DIR / p).resolve()
else:
    smart_city_full_path = DEFAULT_SMART_CITY_PATH

# Add smart_city_project to sys.path
if str(smart_city_full_path) not in sys.path:
    sys.path.append(str(smart_city_full_path))

# Import predictor from smart_city_project
try:
    from src.models.predictor import predict_all_streets
except ImportError as e:
    print(f"Error importing predict_all_streets: {e}")
    def predict_all_streets():
        return pd.DataFrame()

# Cache for predictions
_cache = {
    "data": None,
    "last_updated": 0
}
CACHE_DURATION = 30 * 60  # 30 minutes in seconds

def get_aqi_category(aqi):
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Moderate"
    if aqi <= 150: return "Unhealthy for Sensitive"
    if aqi <= 200: return "Unhealthy"
    if aqi <= 300: return "Very Unhealthy"
    return "Hazardous"

def get_all_predictions():
    """
    Returns predictions for all streets.
    Caches results for 30 minutes.
    """
    current_time = time.time()
    if _cache["data"] is not None and (current_time - _cache["last_updated"]) < CACHE_DURATION:
        return _cache["data"]

    try:
        # Get ML predictions
        preds_df = predict_all_streets()
        
        # Load final_dataset.csv for current conditions
        dataset_path = smart_city_full_path / "final_dataset.csv"
        if not dataset_path.exists():
            print(f"Warning: final_dataset.csv not found at {dataset_path}")
            df_latest = pd.DataFrame()
        else:
            df_all = pd.read_csv(dataset_path)
            # Get latest values for each street
            df_latest = df_all.sort_values('time').groupby('street_id').tail(1)

        results = []
        for _, row in preds_df.iterrows():
            street_id = row['street_id']
            
            # Find current values in final_dataset
            current_row = df_latest[df_latest['street_id'] == street_id]
            
            current_aqi = 0.0
            temp = 0.0
            humidity = 0.0
            wind = 0.0
            
            if not current_row.empty:
                current_aqi = float(current_row.iloc[0]['sensor_aqi'])
                temp = float(current_row.iloc[0]['temp'])
                humidity = float(current_row.iloc[0]['humidity'])
                wind = float(current_row.iloc[0]['wind_speed'])

            results.append({
                "street_id": street_id,
                "lat": float(row['lat']),
                "lon": float(row['lon']),
                "current_aqi": round(current_aqi, 1),
                "temp": round(temp, 1),
                "humidity": round(humidity, 1),
                "wind": round(wind, 1),
                "t6": round(float(row['pred_t6']), 1),
                "t12": round(float(row['pred_t12']), 1),
                "t18": round(float(row['pred_t18']), 1),
                "t24": round(float(row['pred_t24']), 1),
                "category": get_aqi_category(current_aqi)
            })

        _cache["data"] = results
        _cache["last_updated"] = current_time
        return results

    except Exception as e:
        print(f"Error in get_all_predictions: {e}")
        return []

if __name__ == "__main__":
    print(get_all_predictions()[:2])
