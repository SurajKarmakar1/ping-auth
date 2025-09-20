from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import hashlib
import json
from datetime import datetime
import requests

app = Flask(__name__)

# ✅ Allow all origins temporarily for testing
CORS(app, resources={r"/device-identifier/*": {"origins": "*"}}, supports_credentials=True)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.before_request
def log_request_info():
    logger.info(f"{request.method} {request.path}")
    if request.is_json:
        logger.debug(f"Body: {request.get_json()}")

def log_event(level, message, details=None):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "level": level,
        "message": message,
        "details": details or {}
    }
    logger.info(json.dumps(log_entry))

# ---------- HEALTH ----------
@app.route("/", methods=["GET"])
@app.route("/device-identifier/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "device-identifier-mock"}), 200

# ---------- VALIDATION ----------
def validate_request(data):
    if not data or "device" not in data:
        return False, "Missing 'device' field in request body"
    device = data["device"]
    if not any(k in device for k in ["phoneNumber", "ipv4Address", "ipv6Address", "networkAccessIdentifier"]):
        return False, "At least one identifier (phoneNumber, ipv4Address, ipv6Address, networkAccessIdentifier) must be provided"
    return True, None

# ---------- ENDPOINTS ----------
@app.route("/device-identifier/retrieve-identifier", methods=["POST", "OPTIONS"])
def retrieve_identifier():
    if request.method == "OPTIONS":
        return ('', 204)
    data = request.get_json()
    valid, error = validate_request(data)
    if not valid:
        return jsonify({"error": error}), 400
    return jsonify({
        "imei": "imei-123456789012345",
        "imeisv": "imeisv-01",
        "brand": "Apple",
        "model": "iPhone 15"
    }), 200

@app.route("/device-identifier/retrieve-type", methods=["POST", "OPTIONS"])
def retrieve_type():
    if request.method == "OPTIONS":
        return ('', 204)
    data = request.get_json()
    valid, error = validate_request(data)
    if not valid:
        return jsonify({"error": error}), 400
    return jsonify({"brand": "Apple", "model": "iPhone 15"}), 200

@app.route("/device-identifier/retrieve-ppid", methods=["POST", "OPTIONS"])
def retrieve_ppid():
    if request.method == "OPTIONS":
        return ('', 204)
    data = request.get_json()
    valid, error = validate_request(data)
    if not valid:
        return jsonify({"error": error}), 400
    phone = data["device"].get("phoneNumber", "unknown")
    ppid = hashlib.sha256(phone.encode()).hexdigest()[:16]
    return jsonify({"ppid": ppid}), 200

# ---------- TOKEN FETCH ----------
@app.route("/get-token", methods=["GET"])
def get_token():
    """Request token from PingOne."""
    token_url = "https://auth.pingone.sg/a0986427-cc86-4376-bff6-483e2f0d98ad/as/token"
    client_id = "b08b52a2-ee2e-430e-8e93-8e9c794d443d"
    client_secret = "QI2Rfl8yiqzMJsRkS7GU2L9lT9Jtn8z6Cs8s-3_I0eQnd0vhgRgLy5BhrE.mn-Cb"
    scope = "openid"
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": scope
    }
    r = requests.post(token_url, data=data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    return (r.text, r.status_code, {"Content-Type": "application/json"})

# ---------- ERRORS ----------
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed"}), 405

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
