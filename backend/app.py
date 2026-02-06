


from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS   # Enables Cross-Origin Resource Sharing (requests to backend host from frontend host)
from flask_migrate import Migrate   # Handles migrations for SQLAlchemy database 
import os  
import rasterio   # Reads GeoTiffs
import numpy as np   # Images are Numpy arrays (essential for U-net processing)
from PIL import Image   # Image formatting and operations 

from models import db, Iceberg   # Import database and Iceberg model
from dotenv import load_dotenv   # Load environment variables from .env file
import requests

# Reads .env file and loads variables into environment
load_dotenv()  

# Create Flask app
app = Flask(__name__)
CORS(app)

# Loads configuration from environment variable or defaults to DevelopmentConfig
app.config.from_object(os.getenv("FLASK_CONFIG", "backend.config.DevelopmentConfig"))

# Safety check: ensures SECRET_KEY is set in production or crashes
if not app.config.get("DEBUG") and not app.config.get("SECRET_KEY"):
    raise RuntimeError("SECRET_KEY must be set in production (set SECRET_KEY env var)")

# Initialize database with Flask app
db.init_app(app)
migrate = Migrate(app, db)   # Enable migrations

# Preload demo iceberg if none exist
with app.app_context():
    
    db.create_all()

    if Iceberg.query.count() == 0:
        demo = Iceberg(
            name="A23A Demo Iceberg",
            latitude=-73.5,
            longitude=-40.0,
            image_path="uploads/A23A_001.png", # Pre-converted demo image
            mask_path="masks/A23A_001_mask.png", # Mask displayed in png
            area=123.4,  # Dummy value
            status="complete"
        )
        db.session.add(demo)
        db.session.commit()
        print("✅ Demo iceberg preloaded")



# FOLDERS
UPLOAD_FOLDER = "uploads"
MASK_FOLDER = "masks"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MASK_FOLDER, exist_ok=True)

# Area calculation based on actual pixel size from GeoTIFF metadata
def calculate_area_from_mask(mask_path):
    """
    Calculate iceberg area in square nautical miles from a TIFF mask.
    Uses actual pixel size from GeoTIFF metadata.
    """
    if not mask_path.lower().endswith(".tif"):
        raise ValueError("Mask must be a TIFF file for area calculation.")

    with rasterio.open(mask_path) as src:
        transform = src.transform  # Affine transform
        mask_data = src.read(1)    # Read first band

        # Calculate pixel dimensions in meters
        pixel_width = abs(transform.a)
        pixel_height = abs(transform.e)
        pixel_area_m2 = pixel_width * pixel_height

        # Count iceberg pixels (non-zero)
        white_pixel_count = np.sum(mask_data > 0)

    # Total area in m²
    area_m2 = white_pixel_count * pixel_area_m2

    # Convert to square nautical miles
    area_sqnm = area_m2 / 3_429_904
    return area_sqnm

# Tiff to PNG for image display
def tiff_to_png(tiff_path, png_path, normalize=True):
    img = Image.open(tiff_path)

    if normalize:
        arr = np.array(img).astype("float32")
        arr = (arr - arr.min()) / (arr.max() - arr.min()) * 255
        img = Image.fromarray(arr.astype("uint8"))

    img.save(png_path, format="PNG")


# Example conversion for demo files
tiff_image = "uploads/A23A_001.tif"
tiff_mask = "masks/A23A_001_mask.tif"

png_image = "uploads/A23A_001.png"
png_mask = "masks/A23A_001_mask.png"

if os.path.exists(tiff_image) and os.path.exists(tiff_mask):
    tiff_to_png(tiff_image, png_image)
    tiff_to_png(tiff_mask, png_mask)



# Routes:
# Seed demo iceberg data
@app.route("/seed-demo", methods=["POST"])
def seed_demo():
    tiff_mask = "masks/A23A_001_mask.tif"

    if not os.path.exists(tiff_mask):
        return jsonify({"error": "Demo mask not found"}), 400

    area_sqnm = float(calculate_area_from_mask(tiff_mask))

    print("🔥 SEED DEMO CALLED")

    iceberg = Iceberg.query.filter_by(name="A23A Demo Iceberg").first()

    if iceberg:
        iceberg.area = area_sqnm
        iceberg.status = "complete"
    else:
        iceberg = Iceberg(
            name="A23A Demo Iceberg",
            latitude=-73.5,
            longitude=-40.0,
            image_path="uploads/A23A_001.png",
            mask_path="masks/A23A_001_mask.png",
            area=area_sqnm,
            status="complete"
        )
        db.session.add(iceberg)

    db.session.commit()

    return jsonify({
        "message": "Demo iceberg updated",
        "area": area_sqnm
    })

# Upload image and process
@app.route("/upload-image", methods=["POST"])
def upload_image():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    filename = file.filename
    tiff_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(tiff_path)

    # Convert to PNG
    png_path = os.path.join(UPLOAD_FOLDER, filename.replace(".tif", ".png"))
    tiff_to_png(tiff_path, png_path)

    # No mask is available yet – the ML model will produce it asynchronously.
    # Save the upload and create a pending iceberg record without area/mask.
    iceberg = Iceberg(
        name=filename,
        latitude=-73.5,
        longitude=-40.0,
        image_path=png_path,
        mask_path="",
        area=None,
        status="pending"
    )

    db.session.add(iceberg)
    db.session.commit()

    return jsonify({
        "id": iceberg.id,
        "name": iceberg.name,
        "latitude": iceberg.latitude,
        "longitude": iceberg.longitude,
        "image_path": iceberg.image_path,
        "mask_path": iceberg.mask_path,
        "area": iceberg.area,
        "status": iceberg.status
    })


@app.route("/icebergs", methods=["GET"])
def get_icebergs():
    icebergs = Iceberg.query.all()
    return jsonify([
        {
            "id": i.id,
            "name": i.name,
            "latitude": float(i.latitude),
            "longitude": float(i.longitude),
            "image_path": i.image_path,
            "mask_path": i.mask_path,
            "area": i.area,
            "status": i.status
        }
        for i in icebergs
    ])


# Refresh endpoint to get latest icebergs (called by frontend after notification)
@app.route("/refresh-icebergs", methods=["GET"])
def refresh_icebergs():
    """Return the current list of all icebergs."""
    icebergs = Iceberg.query.all()
    return jsonify([i.serialize() for i in icebergs])


@app.route("/update-areas", methods=["POST"])
def update_areas():
    icebergs = Iceberg.query.all()
    for iceberg in icebergs:
        mask_path = iceberg.mask_path

        if not mask_path.lower().endswith(".tif"):
            print(f"Skipping non-TIFF mask: {mask_path}")
            continue

        area_sqnm = calculate_area_from_mask(mask_path)
        iceberg.area = area_sqnm
        db.session.add(iceberg)
    db.session.commit()
    return jsonify({"status": "success"})



# File Serving endpoints
@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route("/masks/<path:filename>")
def serve_masks(filename):
    return send_from_directory(MASK_FOLDER, filename)


# Endpoint for ML service to upload a generated mask TIFF
@app.route("/upload-mask", methods=["POST"])
def upload_mask():
    """
    Accepts a TIFF mask file from the ML pipeline, saves it to `masks/`,
    converts to PNG for display, computes area using GeoTIFF metadata,
    and updates the corresponding Iceberg record to status 'complete'.

    Expected form-data:
      - file: the mask TIFF (required)
      - id or iceberg_id: integer Iceberg id (preferred)
      - name: iceberg name (string, optional fallback)
    """
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    iceberg_id = request.form.get("id") or request.form.get("iceberg_id")
    name = request.form.get("name")

    filename = file.filename
    mask_tiff_path = os.path.join(MASK_FOLDER, filename)
    file.save(mask_tiff_path)

    if not mask_tiff_path.lower().endswith(".tif"):
        return jsonify({"error": "Mask must be a TIFF file (.tif)"}), 400

    # Create PNG preview
    mask_png_path = mask_tiff_path.replace(".tif", ".png")
    try:
        tiff_to_png(mask_tiff_path, mask_png_path)
    except Exception as e:
        return jsonify({"error": f"Failed to convert mask TIFF: {e}"}), 500

    # Calculate area from mask TIFF
    try:
        area_sqnm = float(calculate_area_from_mask(mask_tiff_path))
    except Exception as e:
        return jsonify({"error": f"Failed to calculate area: {e}"}), 500

    # Locate iceberg record
    iceberg = None
    if iceberg_id:
        try:
            iceberg = Iceberg.query.get(int(iceberg_id))
        except Exception:
            iceberg = None
    if not iceberg and name:
        iceberg = Iceberg.query.filter_by(name=name).first()
    if not iceberg:
        # Try to infer name from filename (strip common suffixes)
        inferred = filename.replace("_mask.tif", "").replace(".tif", "")
        iceberg = Iceberg.query.filter_by(name=inferred).first()

    if not iceberg:
        # create a new iceberg record if one doesn't exist
        inferred_name = inferred
        # try to find a corresponding image PNG in uploads
        candidate_png = os.path.join(UPLOAD_FOLDER, f"{inferred_name}.png")
        image_path = candidate_png if os.path.exists(candidate_png) else ""

        iceberg = Iceberg(
            name=inferred_name,
            latitude=-73.5,
            longitude=-40.0,
            image_path=image_path,
            mask_path=mask_png_path,
            area=area_sqnm,
            status="complete",
        )
    else:
        iceberg.mask_path = mask_png_path
        iceberg.area = area_sqnm
        iceberg.status = "complete"

    db.session.add(iceberg)
    db.session.commit()

    # Return response with notification message
    response = iceberg.serialize()
    response["notification"] = "Mask has been generated and saved!"

    # Optionally notify a frontend/globe webhook that a new iceberg is ready
    notify_url = os.getenv("FRONTEND_NOTIFY_URL")
    if notify_url:
        try:
            requests.post(notify_url, json=response, timeout=5)
        except Exception:
            pass

    return jsonify(response)


# HEALTH CHECK
@app.route("/")
def home():
    return {"message": "API is running"}


if __name__ == "__main__":
     app.run(host="127.0.0.1", port=5000, debug=True)
