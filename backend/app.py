import os
import re
import secrets
import smtplib
import sqlite3
import tempfile
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path

from dotenv import dotenv_values
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
from werkzeug.security import check_password_hash, generate_password_hash

from database import get_db_connection, init_db
from predict import predict_blood_group


PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONFIG_KEYS = {
    "FLASK_SECRET_KEY",
    "FRONTEND_ORIGINS",
    "SESSION_COOKIE_SECURE",
    "SMTP_FROM",
    "SMTP_HOST",
    "SMTP_PASSWORD",
    "SMTP_PORT",
    "SMTP_USE_TLS",
    "SMTP_USERNAME",
}
DOTENV_SETTINGS = {
    key: value
    for key, value in dotenv_values(PROJECT_ROOT / ".env.local").items()
    if key in CONFIG_KEYS
}


def config_value(name, default=""):
    return os.environ.get(name, DOTENV_SETTINGS.get(name)) or default

app = Flask(__name__)
app.secret_key = config_value("FLASK_SECRET_KEY") or secrets.token_hex(32)
app.config.update(
    MAX_CONTENT_LENGTH=8 * 1024 * 1024,
    PERMANENT_SESSION_LIFETIME=timedelta(days=30),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=config_value("SESSION_COOKIE_SECURE", "false").lower() == "true",
)

allowed_origins = [
    origin.strip()
    for origin in config_value(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
CORS(app, origins=allowed_origins, supports_credentials=True)

UPLOAD_FOLDER = Path(__file__).resolve().parent / "uploads"
ALLOWED_IMAGE_EXTENSIONS = {".bmp", ".jpeg", ".jpg", ".png"}
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
RESET_OTP_LIFETIME = timedelta(minutes=10)
MAX_OTP_ATTEMPTS = 5
MAX_RESET_REQUESTS_PER_HOUR = 3

init_db()


def json_payload():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


def normalized_email(value):
    if not isinstance(value, str):
        return None
    email = value.strip().lower()
    if len(email) > 254 or not EMAIL_PATTERN.fullmatch(email):
        return None
    return email


def email_configuration():
    host = config_value("SMTP_HOST").strip()
    sender = config_value("SMTP_FROM").strip()
    username = config_value("SMTP_USERNAME").strip()
    password = config_value("SMTP_PASSWORD")
    if not host or not sender or bool(username) != bool(password):
        raise ValueError("SMTP_HOST and SMTP_FROM, plus a complete optional login, are required.")
    try:
        port = int(os.environ.get("SMTP_PORT", "587"))
    except ValueError as error:
        raise ValueError("SMTP_PORT must be a valid port number.") from error
    return host, port, sender, username, password


def send_password_reset_email(email, code):
    host, port, sender, username, password = email_configuration()
    message = EmailMessage()
    message["Subject"] = "Your fingerprint app password reset code"
    message["From"] = sender
    message["To"] = email
    message.set_content(
        f"Your password reset code is {code}. It expires in 10 minutes."
    )

    with smtplib.SMTP(host, port, timeout=10) as smtp:
        if config_value("SMTP_USE_TLS", "true").lower() == "true":
            smtp.starttls()
        if username:
            smtp.login(username, password)
        smtp.send_message(message)


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "Image uploads must be 8 MB or smaller."}), 413


@app.route("/")
def home():
    return "Blood Group Detection API is working!"


@app.route("/health")
def health():
    conn = get_db_connection()
    try:
        conn.execute("SELECT 1").fetchone()
    finally:
        conn.close()
    return jsonify({"status": "ok", "database": "ok"})


@app.route("/signup", methods=["POST"])
def signup():
    data = json_payload()
    if data is None:
        return jsonify({"success": False, "message": "A JSON request body is required."}), 400

    full_name = data.get("full_name")
    email = normalized_email(data.get("email"))
    password = data.get("password")
    if not isinstance(full_name, str) or not isinstance(password, str):
        return jsonify({"success": False, "message": "All fields are required."}), 400
    full_name = full_name.strip()
    if not full_name or len(full_name) > 120 or not email or not password:
        return jsonify({"success": False, "message": "Enter a valid name, email, and password."}), 400
    if len(password) < 6 or len(password) > 256:
        return jsonify({"success": False, "message": "Password must be between 6 and 256 characters."}), 400

    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
            (full_name, email, generate_password_hash(password)),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        return jsonify({"success": False, "message": "Email already registered."}), 409
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Account created successfully."}), 201


@app.route("/login", methods=["POST"])
def login():
    data = json_payload()
    if data is None:
        return jsonify({"success": False, "message": "A JSON request body is required."}), 400
    email = normalized_email(data.get("email"))
    password = data.get("password")
    if not email or not isinstance(password, str) or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT id, full_name, email, password_hash FROM users WHERE email = ?",
            (email,),
        ).fetchone()
    finally:
        conn.close()

    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    session.clear()
    session["user_id"] = user["id"]
    session.permanent = data.get("remember") is True
    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"]},
    })


@app.route("/session")
def current_session():
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT id, full_name, email FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    finally:
        conn.close()
    if user is None:
        session.clear()
        return jsonify({"success": False, "message": "Authentication required."}), 401
    return jsonify({
        "success": True,
        "user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"]},
    })


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully."})


@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = json_payload()
    if data is None:
        return jsonify({"success": False, "message": "A JSON request body is required."}), 400
    email = normalized_email(data.get("email"))
    if not email:
        return jsonify({"success": False, "message": "Enter a valid email address."}), 400
    try:
        email_configuration()
    except ValueError:
        app.logger.error("Password reset email is not configured.")
        return jsonify({
            "success": False,
            "message": "Password reset email is not configured. Set the SMTP environment variables.",
        }), 503

    conn = get_db_connection()
    try:
        user = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if user is None:
            return jsonify({
                "success": True,
                "message": "If an account exists for that email, a reset code has been sent.",
            })

        recent_requests = conn.execute(
            "SELECT COUNT(*) FROM otp_codes "
            "WHERE email = ? AND created_at >= datetime('now', '-1 hour')",
            (email,),
        ).fetchone()[0]
        if recent_requests >= MAX_RESET_REQUESTS_PER_HOUR:
            return jsonify({"success": False, "message": "Too many reset requests. Try again later."}), 429

        code = f"{secrets.randbelow(1_000_000):06d}"
        expires_at = (datetime.now(timezone.utc) + RESET_OTP_LIFETIME).isoformat()
        conn.execute("UPDATE otp_codes SET used = 1 WHERE email = ? AND used = 0", (email,))
        conn.execute(
            "INSERT INTO otp_codes (email, otp_hash, expires_at) VALUES (?, ?, ?)",
            (email, generate_password_hash(code), expires_at),
        )
        otp_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.commit()
    finally:
        conn.close()

    try:
        send_password_reset_email(email, code)
    except (OSError, smtplib.SMTPException, ValueError):
        app.logger.exception("Password reset email delivery failed.")
        conn = get_db_connection()
        try:
            conn.execute("UPDATE otp_codes SET used = 1 WHERE id = ?", (otp_id,))
            conn.commit()
        finally:
            conn.close()
        return jsonify({
            "success": False,
            "message": "The reset email could not be sent. Check the email service configuration and try again.",
        }), 503

    return jsonify({
        "success": True,
        "message": "If an account exists for that email, a reset code has been sent.",
    })


@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = json_payload()
    if data is None:
        return jsonify({"success": False, "message": "A JSON request body is required."}), 400
    email = normalized_email(data.get("email"))
    code = data.get("otp")
    password = data.get("password")
    if not email or not isinstance(code, str) or not re.fullmatch(r"\d{6}", code):
        return jsonify({"success": False, "message": "Enter a valid email and six-digit code."}), 400
    if not isinstance(password, str) or len(password) < 6 or len(password) > 256:
        return jsonify({"success": False, "message": "Password must be between 6 and 256 characters."}), 400

    conn = get_db_connection()
    try:
        conn.execute("BEGIN IMMEDIATE")
        user = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        otp = conn.execute(
            "SELECT id, otp_hash, expires_at, attempts FROM otp_codes "
            "WHERE email = ? AND used = 0 ORDER BY id DESC LIMIT 1",
            (email,),
        ).fetchone()
        if user is None or otp is None or otp["attempts"] >= MAX_OTP_ATTEMPTS:
            conn.rollback()
            return jsonify({"success": False, "message": "Invalid or expired reset code."}), 400

        expires_at = datetime.fromisoformat(otp["expires_at"])
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) >= expires_at:
            conn.execute("UPDATE otp_codes SET used = 1 WHERE id = ?", (otp["id"],))
            conn.commit()
            return jsonify({"success": False, "message": "Invalid or expired reset code."}), 400

        if not check_password_hash(otp["otp_hash"], code):
            attempts = otp["attempts"] + 1
            conn.execute(
                "UPDATE otp_codes SET attempts = ?, used = ? WHERE id = ?",
                (attempts, int(attempts >= MAX_OTP_ATTEMPTS), otp["id"]),
            )
            conn.commit()
            return jsonify({"success": False, "message": "Invalid or expired reset code."}), 400

        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (generate_password_hash(password), user["id"]),
        )
        conn.execute("UPDATE otp_codes SET used = 1 WHERE email = ? AND used = 0", (email,))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
    session.clear()

    return jsonify({"success": True, "message": "Password reset successfully."})


@app.route("/predict", methods=["POST"])
def predict():
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"error": "Authentication required."}), 401
    if "file" not in request.files:
        return jsonify({"error": "No fingerprint image uploaded."}), 400

    uploaded_file = request.files["file"]
    suffix = Path(uploaded_file.filename or "").suffix.lower()
    if not uploaded_file.filename or suffix not in ALLOWED_IMAGE_EXTENSIONS:
        return jsonify({"error": "Upload a BMP, JPEG, or PNG fingerprint image."}), 400

    UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(
            prefix="fingerprint-", suffix=suffix, dir=UPLOAD_FOLDER, delete=False
        ) as temporary_file:
            temporary_path = Path(temporary_file.name)
            uploaded_file.save(temporary_file)

        try:
            with Image.open(temporary_path) as image_file:
                if image_file.format not in {"BMP", "JPEG", "PNG"}:
                    return jsonify({"error": "The uploaded file is not a supported image."}), 400
                if (
                    image_file.width > 8000
                    or image_file.height > 8000
                    or image_file.width * image_file.height > 16_000_000
                ):
                    return jsonify({"error": "The fingerprint image dimensions are too large."}), 400
                image_file.verify()
        except (Image.DecompressionBombError, UnidentifiedImageError, OSError):
            return jsonify({"error": "The uploaded file is not a valid image."}), 400

        try:
            blood_group, confidence = predict_blood_group(temporary_path)
        except (ImportError, ModuleNotFoundError, OSError):
            app.logger.exception("The fingerprint prediction model is unavailable.")
            return jsonify({
                "error": "Prediction is unavailable because the TensorFlow model could not be loaded.",
            }), 503
        except Exception:
            app.logger.exception("Fingerprint prediction failed.")
            return jsonify({"error": "Fingerprint prediction failed."}), 500

        conn = get_db_connection()
        try:
            conn.execute(
                "INSERT INTO predictions (user_id, blood_group, confidence) VALUES (?, ?, ?)",
                (user_id, blood_group, confidence),
            )
            conn.commit()
        finally:
            conn.close()

        return jsonify({"blood_group": blood_group, "confidence": round(confidence, 2)})
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)


if __name__ == "__main__":
    if not config_value("FLASK_SECRET_KEY"):
        app.logger.warning("Set FLASK_SECRET_KEY for sessions that persist across restarts.")
    app.run(host="127.0.0.1", port=5000, debug=False)
