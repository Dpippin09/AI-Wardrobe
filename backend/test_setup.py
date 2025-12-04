#!/usr/bin/env python3
"""
Test script for AI Wardrobe backend components
"""

import sys
import os

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import cv2
        print("✓ OpenCV imported successfully")
    except ImportError as e:
        print(f"✗ OpenCV import failed: {e}")
        return False
    
    try:
        import numpy as np
        print("✓ NumPy imported successfully")
    except ImportError as e:
        print(f"✗ NumPy import failed: {e}")
        return False
    
    try:
        import PIL
        print("✓ Pillow imported successfully")
    except ImportError as e:
        print(f"✗ Pillow import failed: {e}")
        return False
    
    try:
        import flask
        print("✓ Flask imported successfully")
    except ImportError as e:
        print(f"✗ Flask import failed: {e}")
        return False
    
    try:
        import requests
        print("✓ Requests imported successfully")
    except ImportError as e:
        print(f"✗ Requests import failed: {e}")
        return False
    
    try:
        from bs4 import BeautifulSoup
        print("✓ BeautifulSoup imported successfully")
    except ImportError as e:
        print(f"✗ BeautifulSoup import failed: {e}")
        return False
    
    return True

def test_components():
    """Test custom components"""
    print("\nTesting custom components...")
    
    try:
        from clothing_analyzer import ClothingAnalyzer
        analyzer = ClothingAnalyzer()
        print("✓ ClothingAnalyzer initialized successfully")
    except Exception as e:
        print(f"✗ ClothingAnalyzer failed: {e}")
        return False
    
    try:
        from style_matcher import StyleMatcher
        matcher = StyleMatcher()
        print("✓ StyleMatcher initialized successfully")
    except Exception as e:
        print(f"✗ StyleMatcher failed: {e}")
        return False
    
    try:
        from web_searcher import WebSearcher
        searcher = WebSearcher()
        print("✓ WebSearcher initialized successfully")
    except Exception as e:
        print(f"✗ WebSearcher failed: {e}")
        return False
    
    return True

def test_directories():
    """Test if required directories exist"""
    print("\nTesting directories...")
    
    uploads_dir = "../uploads"
    if os.path.exists(uploads_dir):
        print("✓ Uploads directory exists")
    else:
        print("✗ Uploads directory missing - creating it...")
        os.makedirs(uploads_dir, exist_ok=True)
        print("✓ Uploads directory created")
    
    return True

def test_env_file():
    """Test environment file"""
    print("\nTesting environment setup...")
    
    if os.path.exists(".env"):
        print("✓ .env file exists")
        
        # Check if it's just the example file
        with open(".env", "r") as f:
            content = f.read()
            if "your_openai_api_key_here" in content:
                print("⚠ Warning: .env file contains placeholder values")
                print("  Please update with your actual API keys")
            else:
                print("✓ .env file appears to be configured")
    else:
        print("✗ .env file missing")
        if os.path.exists(".env.example"):
            print("  Copying from .env.example...")
            import shutil
            shutil.copy(".env.example", ".env")
            print("✓ .env file created from example")
        else:
            print("  Please create .env file with your configuration")
    
    return True

def main():
    """Run all tests"""
    print("AI Wardrobe Backend Test Suite")
    print("=" * 40)
    
    success = True
    
    success &= test_imports()
    success &= test_components()
    success &= test_directories()
    success &= test_env_file()
    
    print("\n" + "=" * 40)
    if success:
        print("✓ All tests passed! Backend is ready to run.")
        print("\nTo start the server, run:")
        print("python app.py")
    else:
        print("✗ Some tests failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
