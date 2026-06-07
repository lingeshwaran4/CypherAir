from flask import Blueprint, jsonify
from services.mock_data import STATIONS, CURRENT_CONDITIONS, HOTSPOTS
from services.aqi_calculator import get_aqi_level
from services.predictor import get_all_predictions, get_current_summary_data, get_latest_street_data
import datetime
import time

current_bp = Blueprint("current", __name__)

@current_bp.route("/api/current", methods=["GET"])
def get_current_summary():
    start_time = time.time()
    
    # Try to get real data from the dataset
    real_data = get_current_summary_data()
    
    if real_data:
        aqi_info = get_aqi_level(real_data["aqi"])
        response = {
            "success": True,
            "station": real_data["station"],
            "aqi": real_data["aqi"],
            "pm25": real_data["pm25"],
            "temperature": real_data["temperature"],
            "humidity": real_data["humidity"],
            "wind_speed": real_data["wind_speed"],
            "wind_direction": "Variable", # Direction isn't easily averaged
            "pressure": 1012.0, # Placeholder or add to CSV
            "boundary_layer": 450, # Placeholder or add to CSV
            "level": aqi_info["label"],
            "color": aqi_info["color"],
            "updated_at": real_data["updated_at"],
            "hotspots": [] # Can be populated from real high-aqi streets if needed
        }
    else:
        # Fallback to mock data if dataset is not ready
        station_id = "thiruvottiyur"
        data = CURRENT_CONDITIONS[station_id]
        aqi_info = get_aqi_level(data["aqi"])
        
        response = {
            "success": True,
            "station": STATIONS[0]["name"],
            "aqi": data["aqi"],
            "pm25": data["pm25"],
            "temperature": data["temperature"],
            "humidity": data["humidity"],
            "wind_speed": data["wind_speed"],
            "wind_direction": data["wind_direction"],
            "pressure": data["pressure"],
            "boundary_layer": data["boundary_layer"],
            "level": aqi_info["label"],
            "color": aqi_info["color"],
            "updated_at": datetime.datetime.now().isoformat(),
            "hotspots": []
        }
    
    # Process hotspots from mock data for now (or could filter top streets from CSV)
    processed_hotspots = []
    for h in HOTSPOTS:
        h_info = get_aqi_level(h["aqi"])
        processed_hotspots.append({
            **h,
            "level": h_info["label"],
            "color": h_info["color"]
        })
    response["hotspots"] = processed_hotspots
    
    print(f"GET /api/current - 200 - {round((time.time() - start_time) * 1000, 2)}ms")
    return jsonify(response)

@current_bp.route("/api/stations", methods=["GET"])
def get_all_stations():
    start_time = time.time()
    
    # Try to get real street data
    real_streets = get_latest_street_data()
    
    all_readings = []
    
    if real_streets:
        for s in real_streets:
            info = get_aqi_level(s["aqi"])
            all_readings.append({
                **s,
                "level": info["label"],
                "color": info["color"]
            })
    else:
        # Fallback to mock data
        for s in STATIONS:
            data = CURRENT_CONDITIONS[s["id"]]
            info = get_aqi_level(data["aqi"])
            all_readings.append({
                "id": s["id"],
                "name": s["name"],
                "lat": s["lat"],
                "lon": s["lon"],
                **data,
                "level": info["label"],
                "color": info["color"]
            })
    
    print(f"GET /api/stations - 200 - {round((time.time() - start_time) * 1000, 2)}ms")
    return jsonify({"success": True, "data": all_readings})

@current_bp.route("/api/predictions", methods=["GET"])
def get_predictions():
    start_time = time.time()
    predictions = get_all_predictions()
    print(f"GET /api/predictions - 200 - {round((time.time() - start_time) * 1000, 2)}ms")
    return jsonify(predictions)
