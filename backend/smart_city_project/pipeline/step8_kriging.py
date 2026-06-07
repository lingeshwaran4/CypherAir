"""
step8_kriging.py - Cypher Air - Spatial AQI Interpolation
============================================================
Ordinary Kriging over the 30 Thazhankuppam street predictions
to produce a continuous heatmap grid for each forecast horizon
(t+6, t+12, t+18, t+24).

Output
------
Each call to `run_kriging()` returns a dict shaped like:

    {
        "streets": [
            {"street_id": "...", "lat": ..., "lon": ..., "t6": ..., "t12": ..., "t18": ..., "t24": ...},
            ...
        ],
        "grid": [
            {"lat": ..., "lon": ..., "t6": ..., "t12": ..., "t18": ..., "t24": ...},
            ...
        ]
    }

The "grid" contains a dense 60x60 mesh of interpolated values.
"""

import sys
import json
import logging
import warnings
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from pykrige.ok import OrdinaryKriging

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("cypher_air.kriging")

# ── Path bootstrap ────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

# ── Project imports ───────────────────────────────────────────────────────────
try:
    from data.streets import STREET_COORDINATES as STREETS
    from models.predictor import predict_all_streets
    log.info("Project modules loaded from src/")
except ImportError as exc:
    log.warning("Could not import project modules (%s) — falling back to demo mode.", exc)
    STREETS = None
    predict_all_streets = None

# ═════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═════════════════════════════════════════════════════════════════════════════
BBOX = {
    "lat_min": 13.16,
    "lat_max": 13.26,
    "lon_min": 80.28,
    "lon_max": 80.36,
}
GRID_RESOLUTION = 60
VARIOGRAM_MODEL = "linear"
HORIZONS = ["t6", "t12", "t18", "t24"]
AQI_MIN, AQI_MAX = 0.0, 500.0

# ═════════════════════════════════════════════════════════════════════════════
# CORE KRIGING
# ═════════════════════════════════════════════════════════════════════════════

def _build_grid(bbox: dict, resolution: int) -> tuple[np.ndarray, np.ndarray]:
    lats = np.linspace(bbox["lat_min"], bbox["lat_max"], resolution)
    lons = np.linspace(bbox["lon_min"], bbox["lon_max"], resolution)
    return lats, lons

def krige_horizon(lats, lons, aqi_values, grid_lats, grid_lons, variogram_model=VARIOGRAM_MODEL):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        ok = OrdinaryKriging(lons, lats, aqi_values, variogram_model=variogram_model, verbose=False)
        z, _ss = ok.execute("grid", grid_lons, grid_lats)
    return np.clip(z.data, AQI_MIN, AQI_MAX)

# ═════════════════════════════════════════════════════════════════════════════
# PUBLIC API
# ═════════════════════════════════════════════════════════════════════════════

def run_kriging(predictions=None, bbox=BBOX, resolution=GRID_RESOLUTION, variogram_model=VARIOGRAM_MODEL):
    if predictions is None:
        predictions = predict_all_streets() if predict_all_streets else _make_demo_predictions()

    # Deduplicate coordinates
    predictions = predictions.groupby(["lat", "lon"]).agg({
        **{f"pred_{h}": "mean" for h in HORIZONS},
        "street_id": "first"
    }).reset_index()

    lats = predictions["lat"].to_numpy(dtype=float)
    lons = predictions["lon"].to_numpy(dtype=float)
    grid_lats, grid_lons = _build_grid(bbox, resolution)

    # 1. Run Kriging for each horizon
    horizon_grids = {}
    for h in HORIZONS:
        aqi_values = predictions[f"pred_{h}"].to_numpy(dtype=float)
        horizon_grids[h] = krige_horizon(lats, lons, aqi_values, grid_lats, grid_lons, variogram_model)

    # 2. Format "grid" output (Problem 3 Fix)
    grid_points = []
    lon_mesh, lat_mesh = np.meshgrid(grid_lons, grid_lats)
    
    for i in range(resolution):
        for j in range(resolution):
            grid_points.append({
                "lat": float(lat_mesh[i, j]),
                "lon": float(lon_mesh[i, j]),
                "t6":  round(float(horizon_grids["t6"][i, j]), 2),
                "t12": round(float(horizon_grids["t12"][i, j]), 2),
                "t18": round(float(horizon_grids["t18"][i, j]), 2),
                "t24": round(float(horizon_grids["t24"][i, j]), 2)
            })

    # 3. Format "streets" output
    streets_out = []
    for _, row in predictions.iterrows():
        streets_out.append({
            "street_id": row["street_id"],
            "lat": float(row["lat"]),
            "lon": float(row["lon"]),
            "t6":  round(float(row["pred_t6"]), 2),
            "t12": round(float(row["pred_t12"]), 2),
            "t18": round(float(row["pred_t18"]), 2),
            "t24": round(float(row["pred_t24"]), 2)
        })

    return {"streets": streets_out, "grid": grid_points}

def _make_demo_predictions():
    rng = np.random.default_rng(42)
    n = 30
    lats = rng.uniform(BBOX["lat_min"], BBOX["lat_max"], n)
    lons = rng.uniform(BBOX["lon_min"], BBOX["lon_max"], n)
    return pd.DataFrame({
        "street_id": [f"ST{i:02d}" for i in range(n)],
        "lat": lats, "lon": lons,
        "pred_t6": rng.uniform(50, 150, n), "pred_t12": rng.uniform(50, 150, n),
        "pred_t18": rng.uniform(50, 150, n), "pred_t24": rng.uniform(50, 150, n)
    })

def save_kriging_result(result: dict, out_path: str | Path = "kriging_output.json") -> None:
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(result, f, indent=2)
    log.info("Kriging result saved → %s", out_path.resolve())

if __name__ == "__main__":
    res = run_kriging()
    save_kriging_result(res)
    print(f"Kriging complete. Grid size: {len(res['grid'])} points. Streets: {len(res['streets'])}")
