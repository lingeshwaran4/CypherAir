import datetime

# North Chennai Station coordinates and details
STATIONS = [
    {"id": "thiruvottiyur", "name": "Thiruvottiyur", "lat": 13.1601, "lon": 80.3014, "baseline_aqi": 160},
    {"id": "manali", "name": "Manali", "lat": 13.1667, "lon": 80.2667, "baseline_aqi": 180},
    {"id": "nctps", "name": "NCTPS (Ennore)", "lat": 13.2201, "lon": 80.3222, "baseline_aqi": 210},
    {"id": "chennai_port", "name": "Chennai Port", "lat": 13.1022, "lon": 80.2944, "baseline_aqi": 140},
    {"id": "kolathur", "name": "Kolathur", "lat": 13.1241, "lon": 80.2101, "baseline_aqi": 110},
]

CURRENT_CONDITIONS = {
    s["id"]: {
        "pm25": s["baseline_aqi"] * 0.45,  # Rough conversion for mock
        "aqi": s["baseline_aqi"] + 8,
        "temperature": 34.2,
        "humidity": 78,
        "wind_speed": 12.5,
        "wind_direction": "NW",
        "pressure": 1008.2,
        "boundary_layer": 420,
    } for s in STATIONS
}

FORECAST_DATA = {
    6: {
        s["id"]: {"predicted_pm25": s["baseline_aqi"] * 0.52, "predicted_aqi": s["baseline_aqi"] + 25}
        for s in STATIONS
    },
    12: {
        s["id"]: {"predicted_pm25": s["baseline_aqi"] * 0.40, "predicted_aqi": s["baseline_aqi"] - 15}
        for s in STATIONS
    },
    18: {
        s["id"]: {"predicted_pm25": s["baseline_aqi"] * 0.65, "predicted_aqi": s["baseline_aqi"] + 45}
        for s in STATIONS
    },
    24: {
        s["id"]: {"predicted_pm25": s["baseline_aqi"] * 0.48, "predicted_aqi": s["baseline_aqi"] + 15}
        for s in STATIONS
    }
}

HOTSPOTS = [
    {"lat": 13.22, "lon": 80.32, "aqi": 225, "name": "NCTPS Industrial Area", "distance_km": 0.0, "source_type": "Power Plant"},
    {"lat": 13.17, "lon": 80.27, "aqi": 195, "name": "Manali Petrochem", "distance_km": 5.4, "source_type": "Refinery"},
    {"lat": 13.11, "lon": 80.30, "aqi": 155, "name": "Port Logistics Hub", "distance_km": 12.1, "source_type": "Vehicular"},
]

WEATHER_FORECAST = {
    h: {
        "temperature": 34.0 - (h / 6),
        "humidity": 78 + (h / 2),
        "wind_speed": 12.5 - (h / 12),
        "wind_direction": "NW",
        "pressure": 1008.0 - (h / 24),
        "boundary_layer": 420 - (h * 5),
    } for h in [6, 12, 18, 24]
}

def generate_24h_timeline(base_aqi):
    timeline = []
    current_hour = datetime.datetime.now().hour
    for i in range(24):
        hour = (current_hour + i) % 24
        # Seeded variation
        variation = 40 * (1 + (i % 5) / 5.0) if i % 2 == 0 else -30 * (1 + (i % 3) / 3.0)
        aqi = int(base_aqi + variation)
        timeline.append({
            "hour": f"{hour:02d}:00",
            "aqi": max(0, aqi),
            "pm25": round(aqi * 0.4, 1)
        })
    return timeline
