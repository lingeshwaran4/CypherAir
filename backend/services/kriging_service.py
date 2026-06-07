import os
import json
import time
from pathlib import Path
from dotenv import load_dotenv

# Load env to get SMART_CITY_PATH
load_dotenv()

SMART_CITY_PATH = os.getenv("SMART_CITY_PATH", "./smart_city_project")
smart_city_full_path = Path(SMART_CITY_PATH).resolve()

# Cache for kriging data
_cache = {
    "data": None,
    "last_updated": 0
}
CACHE_DURATION = 30 * 60  # 30 minutes in seconds

def get_kriging():
    """
    Returns the full kriging object (streets and grid).
    Caches results for 30 minutes.
    """
    current_time = time.time()
    if _cache["data"] is not None and (current_time - _cache["last_updated"]) < CACHE_DURATION:
        return _cache["data"]

    try:
        kriging_path = smart_city_full_path / "kriging_output.json"
        if not kriging_path.exists():
            print(f"Error: kriging_output.json not found at {kriging_path}")
            return {"streets": [], "grid": []}

        with open(kriging_path, 'r') as f:
            data = json.load(f)
            
        _cache["data"] = data
        _cache["last_updated"] = current_time
        return data

    except Exception as e:
        print(f"Error in get_kriging: {e}")
        return {"streets": [], "grid": []}
