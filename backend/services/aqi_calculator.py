def pm25_to_aqi(pm25: float) -> int:
    """CPCB Breakpoints for PM2.5"""
    breakpoints = [
        (0, 30, 0, 50),
        (30, 60, 51, 100),
        (60, 90, 101, 200),
        (90, 120, 201, 300),
        (120, 250, 301, 400),
        (250, 500, 401, 500)
    ]
    for c_lo, c_hi, i_lo, i_hi in breakpoints:
        if pm25 <= c_hi:
            return int(((i_hi - i_lo) / (c_hi - c_lo)) * (pm25 - c_lo) + i_lo)
    return 500

def get_aqi_level(aqi: int) -> dict:
    if aqi <= 50:
        return {"label": "Good", "color": "#00C853", "bg": "#0A1A0F"}
    elif aqi <= 100:
        return {"label": "Satisfactory", "color": "#64DD17", "bg": "#0F1A0A"}
    elif aqi <= 200:
        return {"label": "Moderate", "color": "#FFD600", "bg": "#1A180A"}
    elif aqi <= 300:
        return {"label": "Poor", "color": "#FF6D00", "bg": "#1A0F0A"}
    elif aqi <= 400:
        return {"label": "Very Poor", "color": "#DD2C00", "bg": "#1A0A0A"}
    else:
        return {"label": "Severe", "color": "#AA00FF", "bg": "#150A1A"}

def get_aqi_advice(aqi: int, profile: str) -> str:
    level = get_aqi_level(aqi)["label"]
    advices = {
        "healthy_adult": {
            "Good": "Ideal for outdoor activities.",
            "Satisfactory": "Enjoy your usual outdoor activities.",
            "Moderate": "Limit prolonged outdoor exertion if you experience symptoms.",
            "Poor": "Avoid heavy outdoor activities.",
            "Very Poor": "Stay indoors, use air purifiers.",
            "Severe": "Mandatory stay-at-home; hazardous air."
        },
        "asthmatic": {
            "Good": "Safe to go out.",
            "Satisfactory": "Keep your inhaler handy.",
            "Moderate": "High risk of trigger; limit outdoor stay.",
            "Poor": "Avoid going out; keep windows closed.",
            "Very Poor": "Strictly stay indoors.",
            "Severe": "Health emergency; use N95 if transit is mandatory."
        }
    }
    # Fallback to healthy_adult if profile not specifically handled
    profile_advice = advices.get(profile, advices["healthy_adult"])
    return profile_advice.get(level, "Monitor air quality carefully.")
