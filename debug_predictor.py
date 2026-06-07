import sys
import os
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(os.getcwd()) / "backend"
sys.path.append(str(BACKEND_DIR))

from services.predictor import get_current_summary_data, get_latest_street_data

print("Summary Data:")
print(get_current_summary_data())

print("\nFirst 2 Street Readings:")
streets = get_latest_street_data()
print(streets[:2] if streets else "No street data")
