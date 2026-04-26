from .aqi_calculator import get_aqi_level

PROFILE_THRESHOLDS = {
    "healthy_adult": {"alert_threshold": 201, "warning_threshold": 101},
    "elderly": {"alert_threshold": 101, "warning_threshold": 51},
    "asthmatic": {"alert_threshold": 81, "warning_threshold": 51},
    "child": {"alert_threshold": 81, "warning_threshold": 51},
}

def score_risk(aqi: int, profile: str) -> dict:
    thresholds = PROFILE_THRESHOLDS.get(profile, PROFILE_THRESHOLDS["healthy_adult"])
    
    if aqi > thresholds["alert_threshold"]:
        risk_level = "HIGH"
        message = "Dangerous levels detected for your profile. Avoid all outdoor activity."
        should_alert = True
        color = "#E53935"
    elif aqi > thresholds["warning_threshold"]:
        risk_level = "MEDIUM"
        message = "Elevated pollution. Limit outdoor exposure and wear a mask."
        should_alert = False
        color = "#FFD600"
    else:
        risk_level = "LOW"
        message = "Air quality is within safe limits for you."
        should_alert = False
        color = "#00C853"
        
    return {
        "risk_level": risk_level,
        "message": message,
        "should_alert": should_alert,
        "color": color
    }

def safer_travel_window(hourly_forecast: list) -> dict:
    # Find window with lowest average AQI over 2 consecutive hours
    best_window = {"hour": 10, "avg": 500}
    
    for i in range(len(hourly_forecast) - 2):
        avg = (hourly_forecast[i]["aqi"] + hourly_forecast[i+1]["aqi"]) / 2
        if avg < best_window["avg"]:
            best_window = {"hour": int(hourly_forecast[i]["hour"].split(':')[0]), "avg": avg}
            
    recommended_hour = best_window["hour"]
    end_hour = (recommended_hour + 2) % 24
    
    return {
        "recommended_hour": recommended_hour,
        "end_hour": end_hour,
        "forecast_aqi": round(best_window["avg"], 1),
        "label": f"Best window: {recommended_hour:02d}:00 – {end_hour:02d}:00"
    }
