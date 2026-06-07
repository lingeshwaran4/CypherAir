import pandas as pd
import numpy as np
from datetime import datetime
import os
from pathlib import Path

# Add project root
ROOT = Path(__file__).resolve().parents[1]

# ---------------------------
# CONFIG
# ---------------------------
current_time = datetime.now().replace(minute=0, second=0, microsecond=0)
time_range = [current_time] 

industries = {
    "Ennore_Thermal_PS": (13.206536, 80.310603),
    "Ashok_Leyland_Ennore": (13.211032, 80.320505),
    "NTPC_Tamilnadu_Energy": (13.235412, 80.305274),
    "North_Chennai_TPS": (13.246085, 80.319156),
    "Plant_Air_Compressor": (13.242844, 80.322477)
}

data = []

# GENERATE
for industry, (lat, lon) in industries.items():
    base_emission = np.random.uniform(80, 150)
    for t in time_range:
        fluctuation = np.random.normal(0, 10)
        hour = t.hour
        activity_factor = 1.3 if 8 <= hour <= 18 else 0.7
        emission = base_emission * activity_factor + fluctuation
        
        data.append([
            t, "Chennai", industry, lat, lon,
            emission * 0.4, emission * 0.25, emission * 0.15, emission * 0.08, emission
        ])

df = pd.DataFrame(data, columns=[
    "time", "city", "industry_id", "latitude", "longitude",
    "pm25", "no2", "so2", "co", "emission_intensity"
])

df["emission_intensity"] = df["emission_intensity"].clip(0, 300).round(2)
df = df.drop(columns=["city"])

# SAVE
path = ROOT / "industrial_emission.csv"
header = not path.exists()
df.to_csv(path, mode='a', index=False, header=header)

print(f"Industrial data appended to {path}")
