import sys
import os
import pandas as pd
import time
from pathlib import Path
from dotenv import load_dotenv

# Resolve backend directory relative to this file
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend directory
load_dotenv(BACKEND_DIR / ".env")

# Set default smart_city_project path
smart_city_full_path = BACKEND_DIR / "smart_city_project"

# Override with environment variable if it exists and is absolute
env_path = os.getenv("SMART_CITY_PATH")
if env_path:
    p = Path(env_path)
    if p.is_absolute():
        smart_city_full_path = p
    else:
        # Resolve relative to the backend directory
        smart_city_full_path = (BACKEND_DIR / p).resolve()

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

def get_current_summary_data():
    """
    Returns the latest summary data from final_dataset.csv.
    """
    try:
        dataset_path = smart_city_full_path / "final_dataset.csv"
        if not dataset_path.exists():
            return None
            
        df = pd.read_csv(dataset_path)
        if df.empty:
            return None
            
        # Get the latest timestamp
        latest_time = df['time'].max()
        df_latest = df[df['time'] == latest_time]
        
        # Calculate averages for the area
        summary = {
            "aqi": float(round(df_latest['sensor_aqi'].mean(), 1)) if not df_latest.empty else 0.0,
            "pm25": float(round(df_latest['pm25'].mean(), 1)) if not df_latest.empty else 0.0,
            "temperature": float(round(df_latest['temp'].mean(), 1)) if not df_latest.empty else 0.0,
            "humidity": float(round(df_latest['humidity'].mean(), 1)) if not df_latest.empty else 0.0,
            "wind_speed": float(round(df_latest['wind_speed'].mean(), 1)) if not df_latest.empty else 0.0,
            "updated_at": (latest_time.replace(' ', 'T') if isinstance(latest_time, str) else latest_time) if not df_latest.empty else datetime.datetime.now().isoformat(),
            "station": df_latest.iloc[0]['street_id'].replace('_', ' ') if not df_latest.empty else "North Chennai"
        }
        
        # Ensure no NaNs make it through
        for key in ["aqi", "pm25", "temperature", "humidity", "wind_speed"]:
            if pd.isna(summary[key]):
                summary[key] = 0.0
        return summary
    except Exception as e:
        print(f"Error in get_current_summary_data: {e}")
        return None

def get_latest_street_data():
    """
    Returns the latest reading for every street in final_dataset.csv.
    """
    try:
        dataset_path = smart_city_full_path / "final_dataset.csv"
        if not dataset_path.exists():
            return []
            
        df = pd.read_csv(dataset_path)
        if df.empty:
            return []
            
        # Get the latest timestamp for each street
        df_latest = df.sort_values('time').groupby('street_id').tail(1)
        
        results = []
        for _, row in df_latest.iterrows():
            results.append({
                "id": row['street_id'],
                "name": row['street_id'].replace('_', ' '),
                "lat": float(row['lat']),
                "lon": float(row['lon']),
                "aqi": float(round(float(row['sensor_aqi']), 1)) if not pd.isna(row['sensor_aqi']) else 0.0,
                "pm25": float(round(float(row['pm25']), 1)) if not pd.isna(row['pm25']) else 0.0,
                "temperature": float(round(float(row['temp']), 1)) if not pd.isna(row['temp']) else 0.0,
                "humidity": float(round(float(row['humidity']), 1)) if not pd.isna(row['humidity']) else 0.0,
                "wind_speed": float(round(float(row['wind_speed']), 1)) if not pd.isna(row['wind_speed']) else 0.0,
                "wind_direction": "N/A",
                "pressure": 1012.0,
                "boundary_layer": 450,
                "city": row['city']
            })
        return results
    except Exception as e:
        print(f"Error in get_latest_street_data: {e}")
        return []

if __name__ == "__main__":
    print(get_all_predictions()[:2])
