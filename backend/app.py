from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict_blood_group
from database import get_db_connection, init_db
from werkzeug.security import generate_password_hash, check_password_hash
import os


app = Flask(__name__)

# Allow React frontend to communicate with Flask
CORS(app)

# Create database/tables if they don't already exist
init_db()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ---------------------------------------------------
# HOME
# ---------------------------------------------------

@app.route("/")
def home():
    return "Blood Group Detection API is working!"


# ---------------------------------------------------
# SIGN UP
# ---------------------------------------------------

@app.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Check required fields
    if not full_name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    # Basic password validation
    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters"
        }), 400

    conn = get_db_connection()

    # Check whether email already exists
    existing_user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:
        conn.close()

        return jsonify({
            "success": False,
            "message": "Email already registered"
        }), 409

    # NEVER store the actual password
    password_hash = generate_password_hash(password)

    conn.execute(
        """
        INSERT INTO users (full_name, email, password_hash)
        VALUES (?, ?, ?)
        """,
        (full_name, email, password_hash)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Account created successfully"
    }), 201


# ---------------------------------------------------
# LOGIN
# ---------------------------------------------------

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    conn = get_db_connection()

    user = conn.execute(
        """
        SELECT id, full_name, email, password_hash
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()

    conn.close()

    if user is None:
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    # Check password against stored hash
    if not check_password_hash(user["password_hash"], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"]
        }
    }), 200


# ---------------------------------------------------
# FINGERPRINT PREDICTION
# ---------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    if "file" not in request.files:
        return jsonify({
            "error": "No fingerprint image uploaded"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "error": "No file selected"
        }), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    file.save(file_path)

    try:

        blood_group, confidence = predict_blood_group(file_path)

        return jsonify({
            "blood_group": blood_group,
            "confidence": round(confidence, 2)
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        if os.path.exists(file_path):
            os.remove(file_path)


# ---------------------------------------------------
# RUN SERVER
# ---------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)