import pandas as pd
import numpy as np
import os
import sys

# Import coordinates mapping
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from src.data.streets import STREET_COORDINATES

# Real Industrial Locations
INDUSTRIAL_LOCATIONS = {
    "Ennore_Thermal_PS": (13.206536, 80.310603),
    "Ashok_Leyland_Ennore": (13.211032, 80.320505),
    "NTPC_Tamilnadu_Energy": (13.235412, 80.305274),
    "North_Chennai_TPS": (13.246085, 80.319156),
    "Plant_Air_Compressor": (13.242844, 80.322477)
}

def get_nearest_industry(lat, lon):
    min_dist = float('inf')
    nearest_id = None
    for name, (i_lat, i_lon) in INDUSTRIAL_LOCATIONS.items():
        dist = np.sqrt(((lat - i_lat) * 111)**2 + ((lon - i_lon) * 111)**2)
        if dist < min_dist:
            min_dist = dist
            nearest_id = name
    return nearest_id, min_dist + 0.1

def prepare_xgboost_data():
    print("--- BUILDING CONSOLIDATED DATA-CENTRIC DATASET ---")
    os.makedirs('data/processed', exist_ok=True)
    
    try:
        df_real = pd.read_csv("final_dataset.csv")
        df_ind = pd.read_csv("industrial_emission.csv")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return
        
    df_real['time'] = pd.to_datetime(df_real['time'])
    df_ind['time'] = pd.to_datetime(df_ind['time'])
    
    latest_time = df_real['time'].max()
    df_latest = df_real[df_real['time'] == latest_time].copy()
    df_ind_latest = df_ind[df_ind['time'] == latest_time].set_index('industry_id')
    
    street_coords = {s['street_id']: (s['lat'], s['lon']) for s in STREET_COORDINATES}
    
    xgboost_rows = []
    grouped = df_latest.groupby('street_id')
    
    for street_id, group in grouped:
        avg_data = group.mean(numeric_only=True)
        lat, lon = street_coords.get(street_id, (13.223097, 80.325079))
        
        nearest_id, dist_km = get_nearest_industry(lat, lon)
        
        try:
            industry_emission = df_ind_latest.loc[nearest_id, 'emission_intensity']
        except KeyError:
            industry_emission = avg_data.get('emission_intensity', 50.0)
        
        industrial_impact = industry_emission / dist_km
        
        xgboost_rows.append({
            'time': latest_time,
            'street_id': street_id,
            'AQI_Target': round(avg_data.get('sensor_aqi', 50), 1),
            'temp': round(avg_data.get('temp_weather', 30.0), 1),
            'humidity': round(avg_data.get('humidity_weather', 60.0), 1),
            'wind': round(avg_data.get('wind_speed', 5.0), 1),
            'traffic': round(avg_data.get('current_speed', 20), 1),
            'industrial_pollution': round(industry_emission, 2),
            'dist_to_ind': round(dist_km, 2)
        })
        
    final_df = pd.DataFrame(xgboost_rows)
    final_df.to_csv("data/processed/xgboost_ready_data.csv", index=False)
    
    # Beautiful printing for the user
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 1000)
    print("\n[ UNIFIED DATASET FOR XGBOOST ]")
    print(final_df[['time', 'street_id', 'AQI_Target', 'temp', 'humidity', 'wind', 'traffic', 'industrial_pollution']])
    print(f"\nSaved {len(final_df)} rows to data/processed/xgboost_ready_data.csv")

if __name__ == "__main__":
    prepare_xgboost_data()
