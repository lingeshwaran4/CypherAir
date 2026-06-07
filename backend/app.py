import os
import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from routes.current import current_bp
from routes.forecast import forecast_bp
from routes.risk import risk_bp

# Resolve paths relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Force the smart_city_project path to be inside the backend folder
smart_city_full_path = os.path.abspath(os.path.join(BASE_DIR, "smart_city_project"))

print(f"Validating models in {smart_city_full_path}...")
horizons = [6, 12, 18, 24]
missing_models = []
for h in horizons:
    model_path = os.path.join(smart_city_full_path, "src", "models", "saved", f"model_t{h}.joblib")
    if not os.path.exists(model_path):
        missing_models.append(f"model_t{h}.joblib")

if missing_models:
    print(f"CRITICAL ERROR: Missing model files: {', '.join(missing_models)}")
    print(f"Expected path: {os.path.join(smart_city_full_path, 'src', 'models', 'saved')}")
else:
    print("All ML models validated successfully.")

app = Flask(__name__)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081,http://localhost:19006").split(",")
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# Register Blueprints
app.register_blueprint(current_bp)
app.register_blueprint(forecast_bp)
app.register_blueprint(risk_bp)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "status": "ok",
        "service": "Cypher_Air API",
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.errorhandler(400)
def bad_request(e):
    return jsonify({
        "success": False,
        "error": "Bad Request",
        "message": str(e.description)
    }), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "success": False,
        "error": "Not Found",
        "message": "The requested resource was not found."
    }), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        "success": False,
        "error": "Internal Server Error",
        "message": "An unexpected error occurred."
    }), 500

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_ENV") == "development"
    print(f"Starting Cypher_Air Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)
