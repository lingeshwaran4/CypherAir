from flask import Blueprint, jsonify, abort
from services.mock_data import STATIONS, FORECAST_DATA, WEATHER_FORECAST, CURRENT_CONDITIONS, generate_24h_timeline
from services.aqi_calculator import get_aqi_level
import datetime
import time

forecast_bp = Blueprint("forecast", __name__)

@forecast_bp.route("/api/forecast/<int:horizon>", methods=["GET"])
def get_forecast_by_horizon(horizon):
    start_time = time.time()
    if horizon not in [6, 12, 18, 24]:
        abort(400, description="Invalid horizon. Must be 6, 12, 18, or 24.")
        
    f_data = FORECAST_DATA[horizon]
    weather = WEATHER_FORECAST[horizon]
    
    # Calculate summary based on Thiruvottiyur
    main_pred = f_data["thiruvottiyur"]
    aqi_info = get_aqi_level(main_pred["predicted_aqi"])
    
    stations_data = []
    for s in STATIONS:
        pred = f_data[s["id"]]
        info = get_aqi_level(pred["predicted_aqi"])
        stations_data.append({
            "station_id": s["id"],
            "name": s["name"],
            "lat": s["lat"],
            "lon": s["lon"],
            "predicted_pm25": pred["predicted_pm25"],
            "predicted_aqi": pred["predicted_aqi"],
            "level": info["label"],
            "color": info["color"],
            "confidence": max(60, 95 - (horizon / 6) * 5),
            "uncertainty": round(5 + (horizon / 6) * 2, 1)
        })
        
    timeline = generate_24h_timeline(CURRENT_CONDITIONS["thiruvottiyur"]["aqi"])
    for item in timeline:
        info = get_aqi_level(item["aqi"])
        item["level"] = info["label"]
        item["color"] = info["color"]

    response = {
        "success": True,
        "horizon": horizon,
        "generated_at": datetime.datetime.now().isoformat(),
        "summary": {
            "aqi": main_pred["predicted_aqi"],
            "pm25": main_pred["predicted_pm25"],
            "temperature": weather["temperature"],
            "wind_speed": weather["wind_speed"],
            "wind_direction": weather["wind_direction"],
            "humidity": weather["humidity"],
            "level": aqi_info["label"],
            "color": aqi_info["color"]
        },
        "stations": stations_data,
        "weather": weather,
        "timeline": timeline
    }
    
    print(f"GET /api/forecast/{horizon} - 200 - {round((time.time() - start_time) * 1000, 2)}ms")
    return jsonify(response)

@forecast_bp.route("/api/forecast/all", methods=["GET"])
def get_all_forecasts():
    start_time = time.time()
    all_data = {}
    for h in [6, 12, 18, 24]:
        # We can reuse the logic or just map it
        all_data[h] = get_forecast_by_horizon(h).get_json()
        
    print(f"GET /api/forecast/all - 200 - {round((time.time() - start_time) * 1000, 2)}ms")
    return jsonify({"success": True, "data": all_data})
