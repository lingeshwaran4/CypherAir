from flask import Blueprint, jsonify, abort
from services.mock_data import FORECAST_DATA, CURRENT_CONDITIONS, generate_24h_timeline
from services.risk_scorer import score_risk, safer_travel_window
from services.predictor import get_all_predictions
import time

risk_bp = Blueprint("risk", __name__)

@risk_bp.route("/api/risk/<string:profile>/<int:horizon>", methods=["GET"])
def get_risk_assessment(profile, horizon):
    start_time = time.time()
    valid_profiles = ["healthy_adult", "elderly", "asthmatic", "child"]
    if profile not in valid_profiles:
        abort(400, description=f"Invalid profile. Must be one of {valid_profiles}")
    
    if horizon not in [6, 12, 18, 24]:
        abort(400, description="Invalid horizon. Must be 6, 12, 18, or 24.")
        
    # Get forecasted AQI for Thiruvottiyur
    forecasted_aqi = FORECAST_DATA[horizon]["thiruvottiyur"]["predicted_aqi"]
    risk = score_risk(forecasted_aqi, profile)
    
    timeline = generate_24h_timeline(CURRENT_CONDITIONS["thiruvottiyur"]["aqi"])
    travel_window = safer_travel_window(timeline)
    
    # Mock hotspot risks
    hotspot_risks = [
        {"name": "NCTPS", "aqi": 210, "risk_level": "HIGH", "message": "Heavy industrial discharge.", "avoid": True},
        {"name": "Manali", "aqi": 185, "risk_level": "MEDIUM", "message": "Refinery plume detected.", "avoid": False}
    ]
    
    response = {
        "success": True,
        "profile": profile,
        "horizon": horizon,
        **risk,
        "safer_travel": travel_window,
        "hotspot_risks": hotspot_risks
    }
    
    print(f"GET /api/risk/{profile}/{horizon} - 200 - {round((time.time() - start_time) * 1000, 2)}ms")
    return jsonify(response)

@risk_bp.route("/api/risk/summary/<string:profile>", methods=["GET"])
def get_risk_summary(profile):
    start_time = time.time()
    summary = []
    for h in [6, 12, 18, 24]:
        assessment = get_risk_assessment(profile, h).get_json()
        summary.append({
            "horizon": h,
            "risk_level": assessment["risk_level"],
            "message": assessment["message"],
            "color": assessment["color"]
        })
        
    print(f"GET /api/risk/summary/{profile} - 200 - {round((time.time() - start_time) * 1000, 2)}ms")
    return jsonify({"success": True, "data": summary})

@risk_bp.route("/api/alerts", methods=["GET"])
def get_alerts():
    start_time = time.time()
    predictions = get_all_predictions()
    
    alerts = []
    for p in predictions:
        # Check all horizons
        horizons = [("t+6h", p["t6"]), ("t+12h", p["t12"]), ("t+18h", p["t18"]), ("t+24h", p["t24"])]
        
        max_aqi = 0
        triggered_at = ""
        
        for horizon, aqi in horizons:
            if aqi > 100:
                if aqi > max_aqi:
                    max_aqi = aqi
                    triggered_at = horizon
                    
        if max_aqi > 0:
            alert_level = "Sensitive"
            if 151 <= max_aqi <= 200:
                alert_level = "Unhealthy"
            elif max_aqi > 200:
                alert_level = "Hazardous"
                
            alerts.append({
                "street_id": p["street_id"],
                "lat": p["lat"],
                "lon": p["lon"],
                "max_aqi": max_aqi,
                "alert_level": alert_level,
                "triggered_at": triggered_at
            })
            
    print(f"GET /api/alerts - 200 - {round((time.time() - start_time) * 1000, 2)}ms")
    return jsonify(alerts)
