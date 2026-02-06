from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Iceberg(db.Model):
    __tablename__ = "icebergs"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    image_path = db.Column(db.String)
    mask_path = db.Column(db.String)
    area = db.Column(db.Float)   # sq NM
    status = db.Column(db.String)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "image_path": self.image_path,
            "mask_path": self.mask_path,
            "area": self.area,
            "status": self.status
        }
