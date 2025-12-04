from flask import Flask
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', '../uploads')
    
    return app

# Global configuration
class Config:
    """Configuration settings"""
    
    # API Keys
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    GOOGLE_CX = os.getenv('GOOGLE_CX')
    
    # AI Model settings
    USE_GPU = os.getenv('USE_GPU', 'False').lower() == 'true'
    MODEL_CACHE_DIR = os.getenv('MODEL_CACHE_DIR', './model_cache')
    
    # Web scraping settings
    REQUEST_DELAY = float(os.getenv('REQUEST_DELAY', 1.0))
    MAX_PRODUCTS_PER_SEARCH = int(os.getenv('MAX_PRODUCTS_PER_SEARCH', 10))
