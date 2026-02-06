# Iceberg Tracker Backend API

A Flask-based REST API for tracking and analyzing satellite imagery of icebergs. The backend handles image processing, mask generation coordination, area calculations from GeoTIFF metadata, and database management.

## Features

- **Image Upload & Processing**: Accepts TIFF satellite images, converts to PNG for display
- **Mask Management**: Receives ML-generated masks, calculates iceberg area from GeoTIFF metadata
- **GIS Integration**: Uses rasterio to read affine transforms and pixel dimensions from GeoTIFF files
- **Area Calculation**: Converts pixel counts to square nautical miles using actual geographic resolution
- **Real-Time Updates**: Notifies frontend when masks are ready via webhook
- **Database Persistence**: SQLAlchemy ORM with migration support (Alembic)
- **CORS Enabled**: Supports frontend requests from different origins

## Project Structure

```
backend/
├── app.py              # Main Flask application and routes
├── models.py           # SQLAlchemy database models
├── config.py           # Environment configuration
├── requirements.txt    # Python dependencies
├── migrations/         # Alembic migration scripts
├── uploads/            # Uploaded satellite TIFF images and converted PNGs
├── masks/              # Generated mask TIFFs and PNG previews
└── seed_demo.py        # Demo data seeding script
```

## Setup

### Prerequisites
- Python 3.8+
- PostgreSQL (or SQLite for development)

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   Create a `.env` file:
   ```
   FLASK_CONFIG=backend.config.DevelopmentConfig
   FLASK_ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/iceberg_tracker
   FRONTEND_NOTIFY_URL=http://localhost:3000/notify  # Optional webhook
   ```

4. **Initialize database**
   ```bash
   flask db upgrade
   ```

5. **Run the server**
   ```bash
   python app.py
   ```
   Server runs on `http://127.0.0.1:5000`

## API Endpoints

### Iceberg Management

**GET `/icebergs`**
- Returns all icebergs in the database
- Response: Array of iceberg objects with id, name, coordinates, image/mask paths, area, status

**GET `/refresh-icebergs`**
- Same as `/icebergs`, used for polling updates after mask generation

**POST `/seed-demo`**
- Recalculates area for demo iceberg using existing mask
- Useful for testing

### Image Upload

**POST `/upload-image`**
- Accepts: Multipart form-data with `file` (TIFF image)
- Saves TIFF to `uploads/`, converts to PNG
- Creates iceberg record with `status: "pending"` (no mask/area yet)
- Returns: Iceberg object

### Mask Processing

**POST `/upload-mask`**
- Accepts: Multipart form-data with:
  - `file`: Mask TIFF (required)
  - `id` or `iceberg_id`: Iceberg ID (optional)
  - `name`: Iceberg name (optional fallback)
- Processes:
  1. Saves mask TIFF to `masks/`
  2. Converts to PNG for display
  3. Calculates area using GeoTIFF affine transform and pixel count
  4. Updates or creates iceberg record with `status: "complete"`
  5. POSTs notification to `FRONTEND_NOTIFY_URL` if set
- Returns: Updated iceberg object with `notification` field

**POST `/update-areas`**
- Recalculates areas for all icebergs from their existing masks
- Useful for bulk updates after GeoTIFF metadata changes

### File Serving

**GET `/uploads/<filename>`**
- Serves uploaded satellite images (PNGs)

**GET `/masks/<filename>`**
- Serves mask preview images (PNGs)

## Data Models

### Iceberg
```python
id          # Integer, primary key
name        # String, iceberg identifier
latitude    # Float, geographic latitude
longitude   # Float, geographic longitude
image_path  # String, path to PNG image (e.g., "uploads/A23A_001.png")
mask_path   # String, path to PNG mask (e.g., "masks/A23A_001_mask.png")
area        # Float, area in square nautical miles
status      # String, "pending" or "complete"
```

## Workflow

1. **User uploads satellite image**
   - POST `/upload-image` → stores TIFF + PNG, creates iceberg with `status: "pending"`

2. **ML model generates mask** (external service)
   - ML service processes the satellite image
   - ML service calls POST `/upload-mask` with generated mask TIFF

3. **Backend processes mask**
   - Converts mask to PNG preview
   - Calculates area from GeoTIFF metadata (pixel dimensions × pixel count)
   - Updates iceberg to `status: "complete"`
   - POSTs to `FRONTEND_NOTIFY_URL` with notification

4. **Frontend receives update**
   - Polls `/refresh-icebergs` periodically
   - Displays updated iceberg on globe with area data

## Area Calculation

Area is calculated using the GeoTIFF's affine transform metadata:

```python
pixel_width = abs(transform.a)    # Meters per pixel (X)
pixel_height = abs(transform.e)   # Meters per pixel (Y)
pixel_area_m2 = pixel_width * pixel_height
white_pixels = count of non-zero pixels in mask
area_m2 = white_pixels * pixel_area_m2
area_sqnm = area_m2 / 3_429_904   # Convert to square nautical miles
```

This requires the mask TIFF to have valid GeoTIFF metadata.

## Dependencies

- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Flask-SQLAlchemy**: ORM
- **Flask-Migrate**: Database migrations
- **rasterio**: GeoTIFF reading and metadata extraction
- **numpy**: Image array operations
- **Pillow**: Image format conversion (TIFF ↔ PNG)
- **python-dotenv**: Environment variable management
- **psycopg2-binary**: PostgreSQL adapter
- **requests**: HTTP client for webhooks

## Development Notes

- Images are stored on disk; ensure `uploads/` and `masks/` directories exist
- Convert TIFFs to PNGs for browser display (browsers support PNG better than TIFF)
- GeoTIFF metadata (affine transform) is essential for accurate area calculations
- The demo iceberg uses pre-existing mask files for testing
- Frontend polls `/refresh-icebergs` every 5 seconds when a notification is active

## Testing

Run the demo with:
```bash
curl -X POST http://127.0.0.1:5000/seed-demo
```

This will:
1. Load the demo mask from `masks/A23A_001_mask.tif`
2. Calculate area from GeoTIFF metadata
3. Update or create the "A23A Demo Iceberg" record

## License

Internal use only.
