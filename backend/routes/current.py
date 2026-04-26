from flask import Blueprint, jsonify
from services.mock_data import STATIONS, CURRENT_CONDITIONS, HOTSPOTS
from services.aqi_calculator import get_aqi_level
import datetime
import time

current_bp = Blueprint("current", __name__)

@current_bp.route("/api/current", methods=["GET"])
def get_current_summary():
    start_time = time.time()
    
    # Use Thiruvottiyur as the default "current" station for North Chennai
    station_id = "thiruvottiyur"
    data = CURRENT_CONDITIONS[station_id]
    aqi_info = get_aqi_level(data["aqi"])
    
    # Process hotspots with level and color
    processed_hotspots = []
    for h in HOTSPOTS:
        h_info = get_aqi_level(h["aqi"])
        processed_hotspots.append({
            **h,
            "level": h_info["label"],
            "color": h_info["color"]
        })
        
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
        "hotspots": processed_hotspots
    }
    
    print(f"GET /api/current - 200 - {round((time.time() - start_time) * 1000, 2)}ms")
    return jsonify(response)

@current_bp.route("/api/stations", methods=["GET"])
def get_all_stations():
    start_time = time.time()
    all_readings = []
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
