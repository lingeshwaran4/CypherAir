# Smart City AQI Project: Data-Centric XGBoost Pipeline

## Project Overview
This repository contains the data pipeline and model scaffolding for a Data-Centric AI project focusing on Air Quality Index (AQI).
Target Location: **13.223097, 80.325079**

### Project Goals
1. **Street-Level AQI Prediction**: Predict AQI for 20-30 streets near the target location using an XGBoost model.
   - *Inputs*: Nearby AQI station data, weather data, traffic data, synthetic industrial pollution data, and synthetic street-level predictions.
2. **AQI Forecasting**: Forecast AQI for the next 6-24 hours (1-hour intervals) at the exact same location and streets.
   - *Model*: XGBoost (Time Series adaptation).

## Directory Structure
- `config/`: Contains YAML configuration for location coordinates and features.
- `data/`:
  - `raw/`: Place your raw CSVs here (Station, Weather, Traffic).
  - `processed/`: Output directory for cleaned and joined datasets.
  - `synthetic/`: Output directory for generated synthetic datasets.
- `notebooks/`: Jupyter notebooks for Exploratory Data Analysis (EDA) and data quality checks (crucial for Data-Centric AI).
- `src/`:
  - `data/`: Scripts for data ingestion, cleaning, and synthetic data generation.
  - `features/`: Scripts for engineering spatial and temporal features.
  - `models/`: Scaffolding for the XGBoost training and inference pipelines.

## Data-Centric Approach
As per the hackathon requirements, the focus should be on **Data Quality** rather than model complexity:
- Validate sensor data for drift and anomalies.
- Handle missing values intelligently (e.g., temporal interpolation).
- Engineer robust features based on domain knowledge (spatial relationships, temporal lags).
