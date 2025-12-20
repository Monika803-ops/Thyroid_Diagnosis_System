# backend/settings.py
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = os.path.dirname(__file__)

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads"))

MODEL_PATH = os.getenv(
    "MODEL_PATH",
    os.path.abspath(os.path.join(BASE_DIR, "..", "model", "cnn_model.h5"))
)

DATABASE_PATH = os.getenv("DATABASE_PATH", os.path.join(BASE_DIR, "database", "users.db"))

print("🔍 DEBUG PATH CHECK:")
print(f" BASE_DIR:       {BASE_DIR}")
print(f" MODEL_PATH:     {MODEL_PATH}")
print(f" UPLOAD_FOLDER:  {UPLOAD_FOLDER}")
print(f" DATABASE_PATH:  {DATABASE_PATH}")
