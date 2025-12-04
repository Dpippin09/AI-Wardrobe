from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import cv2
import numpy as np
from PIL import Image
import base64
import io
from clothing_analyzer import ClothingAnalyzer
from style_matcher import StyleMatcher
from web_searcher import WebSearcher

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = '../uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize AI components
clothing_analyzer = ClothingAnalyzer()
style_matcher = StyleMatcher()
web_searcher = WebSearcher()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "AI Wardrobe API is running!",
        "version": "1.0.0",
        "endpoints": {
            "analyze_clothing": "/api/analyze",
            "find_matches": "/api/find-matches",
            "health": "/api/health"
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running normally"})

@app.route('/api/analyze', methods=['POST'])
def analyze_clothing():
    """
    Analyze uploaded clothing image and extract features
    """
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file and allowed_file(file.filename):
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Analyze the clothing item
            analysis_result = clothing_analyzer.analyze_image(filepath)
            
            # Clean up uploaded file
            os.remove(filepath)
            
            return jsonify({
                "success": True,
                "analysis": analysis_result
            })
        
        return jsonify({"error": "Invalid file type"}), 400
    
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/api/find-matches', methods=['POST'])
def find_matching_items():
    """
    Find clothing items that match the analyzed piece
    """
    try:
        data = request.get_json()
        
        if 'clothing_analysis' not in data:
            return jsonify({"error": "No clothing analysis provided"}), 400
        
        analysis = data['clothing_analysis']
        search_preferences = data.get('preferences', {})
        
        # Find style matches
        style_recommendations = style_matcher.find_matches(analysis, search_preferences)
        
        # Search the web for actual products
        search_results = []
        for recommendation in style_recommendations:
            products = web_searcher.search_products(recommendation)
            search_results.extend(products)
        
        return jsonify({
            "success": True,
            "recommendations": style_recommendations,
            "products": search_results[:20]  # Limit to top 20 results
        })
    
    except Exception as e:
        return jsonify({"error": f"Search failed: {str(e)}"}), 500

@app.route('/api/analyze-and-match', methods=['POST'])
def analyze_and_find_matches():
    """
    Combined endpoint: analyze image and find matches in one request
    """
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        search_preferences = request.form.get('preferences', '{}')
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file and allowed_file(file.filename):
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Analyze the clothing item
            analysis_result = clothing_analyzer.analyze_image(filepath)
            
            # Find matches
            import json
            preferences = json.loads(search_preferences) if search_preferences else {}
            style_recommendations = style_matcher.find_matches(analysis_result, preferences)
            
            # Search for products
            search_results = []
            for recommendation in style_recommendations[:5]:  # Limit initial recommendations
                products = web_searcher.search_products(recommendation)
                search_results.extend(products)
            
            # Clean up uploaded file
            os.remove(filepath)
            
            return jsonify({
                "success": True,
                "analysis": analysis_result,
                "recommendations": style_recommendations,
                "products": search_results[:15]
            })
        
        return jsonify({"error": "Invalid file type"}), 400
    
    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

def allowed_file(filename):
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def secure_filename(filename):
    """Create a secure filename"""
    import re
    import uuid
    # Keep only alphanumeric characters and basic punctuation
    filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
    # Add UUID to prevent conflicts
    name, ext = os.path.splitext(filename)
    return f"{name}_{uuid.uuid4().hex[:8]}{ext}"

if __name__ == '__main__':
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)
