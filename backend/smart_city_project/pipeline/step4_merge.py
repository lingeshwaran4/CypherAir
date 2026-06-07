import pandas as pd
import os
import sys
from pathlib import Path

# Add project root
ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT / "src"))

# ---------------------------
# LOAD FILES
# ---------------------------
weather = pd.read_csv(ROOT / "weather.csv")
traffic = pd.read_csv(ROOT / "traffic.csv")
industrial = pd.read_csv(ROOT / "industrial_emission.csv")
synthetic = pd.read_csv(ROOT / "synthetic_sensor_data.csv")

for df_item in [weather, traffic, industrial, synthetic]:
    df_item['time'] = pd.to_datetime(df_item['time'])

# Standardize City
for df_item in [weather, traffic, synthetic]:
    df_item['city'] = "Chennai"

# ---------------------------
# FIX PROBLEM 2: Average sensors per street per timestamp
# ---------------------------
print("Averaging sensor data (S1, S2, S3)...")
agg_cols = {'sensor_aqi': 'mean'}
synthetic_avg = synthetic.groupby(['time', 'street_id', 'city']).agg(agg_cols).reset_index()

# ---------------------------
# MERGE (Problem 1 Fix: Use synthetic_avg as the backbone)
# ---------------------------
df = synthetic_avg.copy()
print(f"Base augmented data has {len(df)} rows.")

df = df.merge(weather, on=['time', 'city', 'street_id'], how='left', suffixes=('', '_weather'))
df = df.merge(traffic, on=['time', 'city', 'street_id'], how='left', suffixes=('', '_traffic'))

# Merge Industrial (global for the area)
industrial_grouped = industrial.groupby('time').mean(numeric_only=True).reset_index()
if 'latitude' in industrial_grouped.columns:
    industrial_grouped = industrial_grouped.drop(columns=['latitude', 'longitude'])

df = df.merge(industrial_grouped, on='time', how='left')

# ---------------------------
# ADD CORRECT STREET COORDINATES
# ---------------------------
from data.streets import STREET_COORDINATES
coords_df = pd.DataFrame(STREET_COORDINATES)
df = df.merge(coords_df, on='street_id', how='left', suffixes=('_old', ''))

if 'latitude_old' in df.columns:
    df = df.drop(columns=['latitude_old', 'longitude_old'])

# Final Clean
df = df.drop_duplicates().sort_values(['street_id', 'time'])

# Robust Fill: Only fill feature columns to avoid dropping street_id
feature_cols = [c for c in df.columns if c not in ['time', 'street_id', 'city']]
df[feature_cols] = df.groupby('street_id')[feature_cols].transform(lambda x: x.ffill().bfill())

df.to_csv(ROOT / "final_dataset.csv", index=False)

print(f"Final dataset created with {len(df)} rows at {ROOT / 'final_dataset.csv'}")
print(f"Columns: {list(df.columns)}")
