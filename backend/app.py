import os
import uuid
import datetime
import sqlite3
import bcrypt
import jwt
import numpy as np
import tensorflow as tf
import requests
import json
import re
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
from settings import SECRET_KEY, UPLOAD_FOLDER, MODEL_PATH, DATABASE_PATH

# -------------------------------
# ✅ CONFIGURATION
# -------------------------------
ALLOWED_EXT = {'.png', '.jpg', '.jpeg'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = SECRET_KEY


# -------------------------------
# ✅ LOAD MODEL
# -------------------------------
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    LABELS = ["hypothyroid", "hyperthyroid", "thyroid_cancer", "thyroid_nodules", "thyroiditis"]
    print("✅ Model loaded successfully:", MODEL_PATH)
except Exception as e:
    print("❌ Error loading model:", e)
    model = None
    LABELS = []


# -------------------------------
# ✅ DATABASE
# -------------------------------
def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        email TEXT UNIQUE,
        password TEXT,
        gender TEXT,
        phone TEXT,
        profileImage TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        user_email TEXT,
        label TEXT,
        confidence REAL,
        createdAt TEXT,
        image_path TEXT
    )''')

    conn.commit()
    conn.close()
    print("✅ Database ready:", DATABASE_PATH)


init_db()


# -------------------------------
# ✅ HELPERS
# -------------------------------
def hash_pw(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_pw(password, hashed):
    return bcrypt.checkpw(password.encode(), hashed.encode())

def make_token(email):
    payload = {"email": email, "iat": datetime.datetime.utcnow().timestamp()}
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")
    return token.decode() if isinstance(token, bytes) else token

def verify_token(token):
    try:
        return jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
    except Exception:
        return None

def preprocess_image(path):
    img = Image.open(path).convert("RGB").resize((128, 128))
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0)


# -------------------------------
# ✅ SIGNUP
# -------------------------------
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    if request.content_type and request.content_type.startswith("multipart/form-data"):
        first = request.form.get("firstName")
        last = request.form.get("lastName")
        email = request.form.get("email")
        password = request.form.get("password")
        gender = request.form.get("gender")
        phone = request.form.get("phone")
        profile_image = request.files.get("profileImage")
    else:
        data = request.get_json(force=True)
        first, last = data.get("firstName"), data.get("lastName")
        email, password = data.get("email"), data.get("password")
        gender, phone, profile_image = data.get("gender"), data.get("phone"), None

    if not all([first, last, email, password]):
        return jsonify({"message": "All required fields must be filled"}), 400

    hashed_pw = hash_pw(password)
    image_path = None

    if profile_image:
        profile_dir = os.path.join(UPLOAD_FOLDER, "profiles")
        os.makedirs(profile_dir, exist_ok=True)
        filename = f"{uuid.uuid4().hex}_{secure_filename(profile_image.filename)}"
        image_path = os.path.join(profile_dir, filename)
        profile_image.save(image_path)

    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    try:
        c.execute(
            "INSERT INTO users (firstName, lastName, email, password, gender, phone, profileImage) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (first, last, email, hashed_pw, gender, phone, image_path)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"message": "Email already exists"}), 400
    conn.close()

    token = make_token(email)
    return jsonify({
        "user": {
            "firstName": first,
            "lastName": last,
            "email": email,
            "gender": gender,
            "phone": phone,
            "profileImage": f"/uploads/profiles/{os.path.basename(image_path)}" if image_path else None
        },
        "token": token
    }), 201


# -------------------------------
# ✅ LOGIN
# -------------------------------
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email, password = data.get("email"), data.get("password")

    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute("SELECT firstName, lastName, password, gender, phone, profileImage FROM users WHERE email=?", (email,))
    row = c.fetchone()
    conn.close()

    if not row or not check_pw(password, row[2]):
        return jsonify({"message": "Invalid credentials"}), 401

    token = make_token(email)
    return jsonify({
        "user": {
            "firstName": row[0],
            "lastName": row[1],
            "email": email,
            "gender": row[3],
            "phone": row[4],
            "profileImage": f"/uploads/profiles/{os.path.basename(row[5])}" if row[5] else None
        },
        "token": token
    })


# -------------------------------
# ✅ UPDATE PROFILE
# -------------------------------
@app.route("/api/auth/update-profile", methods=["POST"])
def update_profile():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({"message": "Invalid token"}), 401

    email = payload["email"]

    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=?", (email,))
    user = c.fetchone()

    if not user:
        conn.close()
        return jsonify({"message": "User not found"}), 404

    first = request.form.get("firstName") or user[1]
    last = request.form.get("lastName") or user[2]
    gender = request.form.get("gender") or user[5]
    phone = request.form.get("phone") or user[6]
    profile_image = request.files.get("profileImage")

    image_path = user[7]
    if profile_image:
        profile_dir = os.path.join(UPLOAD_FOLDER, "profiles")
        os.makedirs(profile_dir, exist_ok=True)
        filename = f"{uuid.uuid4().hex}_{secure_filename(profile_image.filename)}"
        image_path = os.path.join(profile_dir, filename)
        profile_image.save(image_path)

    c.execute("""
        UPDATE users SET firstName=?, lastName=?, gender=?, phone=?, profileImage=? WHERE email=?
    """, (first, last, gender, phone, image_path, email))
    conn.commit()
    conn.close()

    return jsonify({
        "message": "Profile updated successfully!",
        "user": {
            "firstName": first,
            "lastName": last,
            "email": email,
            "gender": gender,
            "phone": phone,
            "profileImage": f"/uploads/profiles/{os.path.basename(image_path)}" if image_path else None
        }
    })


# -------------------------------
# ✅ PREDICTION ROUTE (Full probability output)
# -------------------------------
@app.route("/api/predict", methods=["POST"])
def predict():
    print("🧠 Incoming prediction request...")
    print("Request Content-Type:", request.content_type)
    print("Files:", request.files)
    print("Form Data:", request.form)

    if "image" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["image"]
    email = request.form.get("email", "guest")

    if file.filename == "":
        return jsonify({"message": "Empty file name"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXT:
        return jsonify({"message": "Invalid file type"}), 400

    pred_dir = os.path.join(UPLOAD_FOLDER, "predictions")
    os.makedirs(pred_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    path = os.path.join(pred_dir, filename)
    file.save(path)

    if model is None:
        return jsonify({"message": "Model not loaded"}), 500

    img_arr = preprocess_image(path)
    preds = model.predict(img_arr)[0]
    idx = int(np.argmax(preds))
    label = LABELS[idx]
    confidence = float(preds[idx])

    probabilities = [{"label": LABELS[i], "prob": float(preds[i])} for i in range(len(LABELS))]

    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO predictions VALUES (?, ?, ?, ?, ?, ?)", (
        str(uuid.uuid4()),
        email,
        label,
        confidence,
        datetime.datetime.now().isoformat(),
        path
    ))
    conn.commit()
    conn.close()

    print(f"✅ Prediction complete: {label} ({confidence:.2f})")

    return jsonify({
        "label": label,
        "confidence": round(confidence * 100, 2),
        "image": f"/uploads/predictions/{os.path.basename(path)}",
        "probabilities": probabilities
    })


# -------------------------------
# ✅ RECENT PREDICTIONS (New Route)
# -------------------------------
@app.route("/api/predictions", methods=["GET"])
def get_recent_predictions():
    """Return only the logged-in user's recent predictions."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({"message": "Invalid or expired token"}), 401

    email = payload.get("email")
    if not email:
        return jsonify({"message": "Invalid token payload"}), 400

    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT label, confidence, createdAt, image_path FROM predictions WHERE user_email=? ORDER BY createdAt DESC LIMIT 10",
        (email,),
    )
    rows = c.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "label": row[0],
            "confidence": float(row[1]),
            "createdAt": row[2],
            "image": f"/uploads/predictions/{os.path.basename(row[3])}" if row[3] else None
        })

    return jsonify(results)

    """Return the 10 most recent predictions."""
    email = request.args.get("email")

    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()

    if email:
        c.execute(
            "SELECT label, confidence, createdAt, image_path FROM predictions WHERE user_email=? ORDER BY createdAt DESC LIMIT 10",
            (email,),
        )
    else:
        c.execute(
            "SELECT label, confidence, createdAt, image_path FROM predictions ORDER BY createdAt DESC LIMIT 10"
        )

    rows = c.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "label": row[0],
            "confidence": float(row[1]),
            "createdAt": row[2],
            "image": f"/uploads/predictions/{os.path.basename(row[3])}" if row[3] else None
        })

    return jsonify(results)


# -------------------------------
# ✅ CHAT (thyroid only)
# -------------------------------
@app.route("/api/chat", methods=["POST"])
def chat_with_ollama():
    data = request.get_json()
    user_message = data.get("message", "").strip()
    if not user_message:
        return "Please enter a question.", 400

    thyroid_keywords = ["thyroid", "hypothyroid", "hyperthyroid", "thyroiditis", "nodules", "thyroxine", "t3", "t4"]
    if not any(re.search(rf"\b{kw}\b", user_message, re.IGNORECASE) for kw in thyroid_keywords):
        return Response("💡 I’m your Thyroid Health Assistant. I can only help with thyroid-related conditions like hypothyroidism, hyperthyroidism, thyroiditis, nodules, and thyroid cancer.", content_type="text/plain")

    ollama_url = "http://127.0.0.1:11434/api/generate"

    def stream_reply():
        try:
            with requests.post(ollama_url, json={"model": "mistral", "prompt": user_message, "stream": True}, stream=True) as r:
                for line in r.iter_lines():
                    if line:
                        try:
                            data = json.loads(line.decode("utf-8"))
                            if "response" in data:
                                yield data["response"]
                        except Exception:
                            continue
        except Exception as e:
            print("❌ Ollama error:", e)
        yield "[END]"

    return Response(stream_reply(), content_type="text/plain")
# -------------------------------
# ✅ DELETE ACCOUNT (Fix)
# -------------------------------
from flask_cors import cross_origin

@app.route("/api/auth/delete-account", methods=["DELETE", "OPTIONS"])
@cross_origin()
def delete_account():

    """Delete the logged-in user's account permanently."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({"message": "Invalid or expired token"}), 401

    email = payload.get("email")
    if not email:
        return jsonify({"message": "Invalid token payload"}), 400

    try:
        conn = sqlite3.connect(DATABASE_PATH)
        c = conn.cursor()

        # ✅ Check if user exists
        c.execute("SELECT * FROM users WHERE email=?", (email,))
        user = c.fetchone()
        if not user:
            conn.close()
            return jsonify({"message": "User not found"}), 404

        # ✅ Delete user's predictions
        c.execute("DELETE FROM predictions WHERE user_email=?", (email,))

        # ✅ Delete user's profile image (if exists)
        if user[7] and os.path.exists(user[7]):
            os.remove(user[7])

        # ✅ Delete user account
        c.execute("DELETE FROM users WHERE email=?", (email,))
        conn.commit()
        conn.close()

        print(f"🗑️ Deleted user and predictions for: {email}")
        return jsonify({"message": "Account deleted successfully"}), 200

    except Exception as e:
        print("❌ Error deleting account:", e)
        return jsonify({"message": "Internal server error"}), 500



# -------------------------------
# ✅ STATIC FILES
# -------------------------------
@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# -------------------------------
# ✅ RUN APP
# -------------------------------
if __name__ == "__main__":
    print("🚀 Flask running...")
    app.run(debug=True)
