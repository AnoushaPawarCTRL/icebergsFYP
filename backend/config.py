import os
from dotenv import load_dotenv

# Load .env in development 
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    # Provide a safe fallback for local development only
    SECRET_KEY = Config.SECRET_KEY or "dev-secret"

class ProductionConfig(Config):
    DEBUG = False