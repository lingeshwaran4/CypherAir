import pandas as pd
import numpy as np
import os
from pathlib import Path
from datetime import timedelta

# Add project root
ROOT = Path(__file__).resolve().parents[1]

# ---------------------------
# LOAD
# ---------------------------
aqi_path = ROOT / "aqi.csv"
if not aqi_path.exists():
    print("aqi.csv not found. Run Step 1 first.")
    exit(1)

df_base = pd.read_csv(aqi_path)
df_base['time'] = pd.to_datetime(df_base['time'])

# ---------------------------
# AUGMENTATION (Problem 1 Fix)
# ---------------------------
print(f"Base data has {len(df_base)} rows. Augmenting to 5000+ rows...")

augmented_rows = []
streets = df_base['street_id'].unique()
latest_time = df_base['time'].max()

# Generate 200 hours of history (approx 8 days) for each street
# 30 streets * 200 hours = 6000 base rows
for street in streets:
    street_data_template = df_base[df_base['street_id'] == street].iloc[0]
    base_aqi = street_data_template['aqi']
    
    for h in range(200):
        current_time = latest_time - timedelta(hours=h)
        # Add daily cycle (higher at night/morning) and random noise
        hour_val = current_time.hour
        cycle = 15 * np.sin((hour_val - 6) * np.pi / 12)
        noise = np.random.normal(0, 5)
        
        row = street_data_template.copy()
        row['time'] = current_time
        row['aqi'] = max(20, base_aqi + cycle + noise)
        augmented_rows.append(row)

df = pd.DataFrame(augmented_rows)

# ---------------------------
# SYNTHESIZE SENSORS
# ---------------------------
sensor_list = ['S1', 'S2', 'S3']
# Repeat rows for 3 sensors (total 18,000 rows)
df = df.loc[df.index.repeat(len(sensor_list))].reset_index(drop=True)
df['sensor_id'] = sensor_list * (len(df) // len(sensor_list))

# Add realistic sensor noise (5% of value + constant bias)
noise = np.random.normal(0, 0.05 * df['aqi'] + 2)
df['sensor_aqi'] = (df['aqi'] + noise).clip(0, 500).round(2)

# ---------------------------
# SAVE (Overwriting to keep it clean)
# ---------------------------
out_path = ROOT / "synthetic_sensor_data.csv"
df.to_csv(out_path, index=False)

print(f"Synthetic sensor data created with {len(df)} rows ({len(df)//3} unique timestamps/streets) at {out_path}")
