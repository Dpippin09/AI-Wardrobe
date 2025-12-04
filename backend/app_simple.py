from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import base64
import io
import json
from PIL import Image
import uuid

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = '../uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "AI Wardrobe API is running!",
        "version": "1.0.0",
        "status": "Demo mode - simplified analysis",
        "endpoints": {
            "analyze_clothing": "/api/analyze",
            "find_matches": "/api/find-matches",
            "analyze_and_match": "/api/analyze-and-match",
            "health": "/api/health"
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running normally"})

@app.route('/api/analyze-and-match', methods=['POST'])
def analyze_and_find_matches():
    """
    Simplified endpoint for demo: analyze image and find matches
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
            
            # Create upload directory if it doesn't exist
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            file.save(filepath)
            
            # Simplified analysis (demo mode)
            analysis_result = get_demo_analysis()
            
            # Demo product results
            demo_products = get_demo_products()
            
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({
                "success": True,
                "analysis": analysis_result,
                "recommendations": get_demo_recommendations(),
                "products": demo_products
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
    # Keep only alphanumeric characters and basic punctuation
    filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
    # Add UUID to prevent conflicts
    name, ext = os.path.splitext(filename)
    return f"{name}_{uuid.uuid4().hex[:8]}{ext}"

def get_demo_analysis():
    """Return demo analysis results"""
    return {
        "clothing_type": "shirt",
        "dominant_colors": [
            {"name": "blue", "hex": "#1E40AF", "rgb": [30, 64, 175]},
            {"name": "white", "hex": "#FFFFFF", "rgb": [255, 255, 255]},
            {"name": "gray", "hex": "#6B7280", "rgb": [107, 114, 128]}
        ],
        "style_attributes": {
            "has_patterns": False,
            "complexity": "medium",
            "style_era": "modern",
            "fit_type": "regular",
            "sleeve_type": "long",
            "neckline": "collar"
        },
        "texture": {
            "pattern": "solid",
            "material": "cotton",
            "texture_type": "smooth",
            "uniformity_score": 45.0
        },
        "formality_level": "semi-formal",
        "season_suitability": ["spring", "fall", "winter"],
        "confidence_score": 0.89
    }

def get_demo_recommendations():
    """Return demo style recommendations"""
    return [
        {
            "item_type": "dress_pants",
            "recommended_colors": ["navy", "charcoal", "black"],
            "formality_level": "semi-formal",
            "season": ["spring", "fall", "winter"],
            "style_tags": ["dress_pants", "semi-formal", "professional", "business"],
            "search_terms": ["navy dress pants", "charcoal slacks", "business pants"],
            "priority": 1.7,
            "outfit_type": "business"
        },
        {
            "item_type": "tie",
            "recommended_colors": ["red", "burgundy", "navy"],
            "formality_level": "semi-formal",
            "season": ["spring", "fall", "winter"],
            "style_tags": ["tie", "semi-formal", "professional", "elegant"],
            "search_terms": ["red tie", "burgundy necktie", "silk tie"],
            "priority": 1.5,
            "outfit_type": "business"
        },
        {
            "item_type": "blazer",
            "recommended_colors": ["navy", "charcoal", "gray"],
            "formality_level": "semi-formal",
            "season": ["spring", "fall", "winter"],
            "style_tags": ["blazer", "semi-formal", "professional", "jacket"],
            "search_terms": ["navy blazer", "charcoal sport coat", "business jacket"],
            "priority": 1.6,
            "outfit_type": "business"
        }
    ]

def get_demo_products():
    """Return demo product search results"""
    return [
        {
            "title": "Men's Classic Navy Dress Pants - Slim Fit",
            "price": "45.99",
            "url": "https://example.com/navy-pants",
            "image_url": "https://via.placeholder.com/300x400/1E40AF/FFFFFF?text=Navy+Pants",
            "rating": "4.2",
            "source": "Demo Store",
            "relevance_score": 0.95,
            "search_term": "navy dress pants"
        },
        {
            "title": "Silk Red Tie - Professional Business Necktie",
            "price": "24.99",
            "url": "https://example.com/red-tie",
            "image_url": "https://via.placeholder.com/300x400/DC2626/FFFFFF?text=Red+Tie",
            "rating": "4.5",
            "source": "Demo Store",
            "relevance_score": 0.88,
            "search_term": "red tie"
        },
        {
            "title": "Men's Navy Blazer - Classic Business Jacket",
            "price": "129.99",
            "url": "https://example.com/navy-blazer",
            "image_url": "https://via.placeholder.com/300x400/1E3A8A/FFFFFF?text=Navy+Blazer",
            "rating": "4.7",
            "source": "Demo Store",
            "relevance_score": 0.92,
            "search_term": "navy blazer"
        },
        {
            "title": "Charcoal Gray Dress Pants - Modern Fit",
            "price": "52.00",
            "url": "https://example.com/charcoal-pants",
            "image_url": "https://via.placeholder.com/300x400/374151/FFFFFF?text=Charcoal+Pants",
            "rating": "4.3",
            "source": "Demo Store",
            "relevance_score": 0.87,
            "search_term": "charcoal dress pants"
        },
        {
            "title": "Burgundy Silk Tie - Premium Quality",
            "price": "32.99",
            "url": "https://example.com/burgundy-tie",
            "image_url": "https://via.placeholder.com/300x400/991B1B/FFFFFF?text=Burgundy+Tie",
            "rating": "4.6",
            "source": "Demo Store",
            "relevance_score": 0.84,
            "search_term": "burgundy tie"
        },
        {
            "title": "Light Gray Sport Coat - Versatile Blazer",
            "price": "98.50",
            "url": "https://example.com/gray-blazer",
            "image_url": "https://via.placeholder.com/300x400/6B7280/FFFFFF?text=Gray+Blazer",
            "rating": "4.4",
            "source": "Demo Store",
            "relevance_score": 0.81,
            "search_term": "gray blazer"
        }
    ]

if __name__ == '__main__':
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    print("🚀 Starting AI Wardrobe Demo Server...")
    print("📝 Note: Running in demo mode with simplified analysis")
    print("🌐 Server will be available at: http://localhost:5000")
    print("📱 Frontend should connect at: http://localhost:3000")
    print("⏹️  Press Ctrl+C to stop the server")
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)
