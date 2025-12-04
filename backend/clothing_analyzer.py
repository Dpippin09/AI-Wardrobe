import cv2
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as transforms
from transformers import pipeline
import colorsys
from sklearn.cluster import KMeans
import os

class ClothingAnalyzer:
    def __init__(self):
        """Initialize the clothing analyzer with AI models"""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Initialize image classification pipeline for clothing detection
        self.classifier = pipeline(
            "image-classification",
            model="google/vit-base-patch16-224",
            device=0 if torch.cuda.is_available() else -1
        )
        
        # Color extraction settings
        self.color_threshold = 5
        
    def analyze_image(self, image_path):
        """
        Analyze a clothing image and extract key features
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            dict: Analysis results containing clothing type, colors, style, etc.
        """
        try:
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not load image")
            
            pil_image = Image.open(image_path).convert('RGB')
            
            # Extract clothing type and style
            clothing_type = self._classify_clothing_type(pil_image)
            
            # Extract dominant colors
            colors = self._extract_colors(image)
            
            # Analyze style attributes
            style_attributes = self._analyze_style(image, pil_image)
            
            # Extract texture and pattern information
            texture_info = self._analyze_texture(image)
            
            # Determine formality level
            formality = self._determine_formality(clothing_type, style_attributes)
            
            return {
                "clothing_type": clothing_type,
                "dominant_colors": colors,
                "style_attributes": style_attributes,
                "texture": texture_info,
                "formality_level": formality,
                "season_suitability": self._determine_season(clothing_type, colors),
                "confidence_score": 0.85  # You can implement actual confidence scoring
            }
            
        except Exception as e:
            return {
                "error": f"Analysis failed: {str(e)}",
                "clothing_type": "unknown",
                "dominant_colors": [],
                "style_attributes": {},
                "texture": {"pattern": "unknown", "material": "unknown"},
                "formality_level": "casual",
                "season_suitability": ["spring", "fall"],
                "confidence_score": 0.0
            }
    
    def _classify_clothing_type(self, pil_image):
        """Classify the type of clothing item"""
        try:
            # Use the pre-trained model to classify
            results = self.classifier(pil_image)
            
            # Map model outputs to clothing categories
            clothing_mapping = {
                'suit': 'suit',
                'dress': 'dress',
                'shirt': 'shirt',
                'blouse': 'blouse',
                'sweater': 'sweater',
                'jacket': 'jacket',
                'coat': 'outerwear',
                'pants': 'pants',
                'jeans': 'jeans',
                'skirt': 'skirt',
                'shorts': 'shorts',
                't-shirt': 't-shirt',
                'polo': 'polo',
                'hoodie': 'hoodie',
                'cardigan': 'cardigan',
                'blazer': 'blazer'
            }
            
            # Find the best match
            best_match = results[0]['label'].lower()
            for key in clothing_mapping:
                if key in best_match:
                    return clothing_mapping[key]
            
            # Fallback classification based on image analysis
            return self._fallback_classification(pil_image)
            
        except Exception as e:
            return self._fallback_classification(pil_image)
    
    def _fallback_classification(self, pil_image):
        """Fallback clothing classification using basic image analysis"""
        # Convert to numpy array
        img_array = np.array(pil_image)
        height, width = img_array.shape[:2]
        
        # Basic heuristics based on aspect ratio and shape
        aspect_ratio = width / height
        
        if aspect_ratio > 1.5:
            return 'pants'  # Wide, likely pants or shorts
        elif aspect_ratio < 0.7:
            return 'dress'  # Tall, likely dress or long garment
        else:
            return 'shirt'  # Square-ish, likely top
    
    def _extract_colors(self, image):
        """Extract dominant colors from the clothing item"""
        try:
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Reshape image to be a list of pixels
            pixels = rgb_image.reshape(-1, 3)
            
            # Use KMeans to find dominant colors
            kmeans = KMeans(n_clusters=min(5, len(np.unique(pixels, axis=0))), random_state=42)
            kmeans.fit(pixels)
            
            colors = kmeans.cluster_centers_.astype(int)
            
            # Convert to color names and hex
            color_info = []
            for color in colors:
                color_name = self._rgb_to_color_name(color)
                hex_color = "#{:02x}{:02x}{:02x}".format(color[0], color[1], color[2])
                color_info.append({
                    "name": color_name,
                    "hex": hex_color,
                    "rgb": color.tolist()
                })
            
            return color_info
            
        except Exception as e:
            return [{"name": "unknown", "hex": "#808080", "rgb": [128, 128, 128]}]
    
    def _rgb_to_color_name(self, rgb):
        """Convert RGB values to approximate color names"""
        r, g, b = rgb
        
        # Basic color mapping
        if r > 200 and g > 200 and b > 200:
            return "white"
        elif r < 50 and g < 50 and b < 50:
            return "black"
        elif r > 200 and g < 100 and b < 100:
            return "red"
        elif r < 100 and g > 200 and b < 100:
            return "green"
        elif r < 100 and g < 100 and b > 200:
            return "blue"
        elif r > 200 and g > 200 and b < 100:
            return "yellow"
        elif r > 200 and g < 100 and b > 200:
            return "magenta"
        elif r < 100 and g > 200 and b > 200:
            return "cyan"
        elif r > 150 and g > 100 and b < 100:
            return "orange"
        elif r > 128 and g < 100 and b > 128:
            return "purple"
        elif r > 100 and g > 100 and b > 100:
            return "gray"
        elif r > 139 and g > 69 and b < 50:
            return "brown"
        elif r > 200 and g > 150 and b > 150:
            return "pink"
        else:
            return "mixed"
    
    def _analyze_style(self, image, pil_image):
        """Analyze style attributes of the clothing"""
        try:
            # Convert to grayscale for pattern analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect edges for pattern analysis
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
            
            # Determine style attributes
            attributes = {
                "has_patterns": edge_density > 0.1,
                "complexity": "high" if edge_density > 0.15 else "medium" if edge_density > 0.05 else "low",
                "style_era": self._determine_style_era(pil_image),
                "fit_type": self._analyze_fit(image),
                "sleeve_type": self._analyze_sleeves(image),
                "neckline": self._analyze_neckline(image)
            }
            
            return attributes
            
        except Exception as e:
            return {
                "has_patterns": False,
                "complexity": "medium",
                "style_era": "modern",
                "fit_type": "regular",
                "sleeve_type": "unknown",
                "neckline": "unknown"
            }
    
    def _analyze_texture(self, image):
        """Analyze texture and material properties"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Calculate local binary pattern for texture
            def local_binary_pattern(img):
                rows, cols = img.shape
                lbp = np.zeros((rows-2, cols-2), dtype=np.uint8)
                
                for i in range(1, rows-1):
                    for j in range(1, cols-1):
                        center = img[i, j]
                        code = 0
                        if img[i-1, j-1] >= center: code |= 1
                        if img[i-1, j] >= center: code |= 2
                        if img[i-1, j+1] >= center: code |= 4
                        if img[i, j+1] >= center: code |= 8
                        if img[i+1, j+1] >= center: code |= 16
                        if img[i+1, j] >= center: code |= 32
                        if img[i+1, j-1] >= center: code |= 64
                        if img[i, j-1] >= center: code |= 128
                        lbp[i-1, j-1] = code
                
                return lbp
            
            # Resize for faster processing
            small_gray = cv2.resize(gray, (100, 100))
            lbp = local_binary_pattern(small_gray)
            texture_uniformity = np.std(lbp)
            
            # Determine texture type
            if texture_uniformity < 30:
                texture_type = "smooth"
                material_guess = "silk"
            elif texture_uniformity < 60:
                texture_type = "medium"
                material_guess = "cotton"
            else:
                texture_type = "textured"
                material_guess = "wool"
            
            return {
                "pattern": "solid" if texture_uniformity < 40 else "textured",
                "material": material_guess,
                "texture_type": texture_type,
                "uniformity_score": float(texture_uniformity)
            }
            
        except Exception as e:
            return {
                "pattern": "unknown",
                "material": "cotton",
                "texture_type": "medium",
                "uniformity_score": 50.0
            }
    
    def _determine_formality(self, clothing_type, style_attributes):
        """Determine the formality level of the clothing"""
        formal_items = ['suit', 'blazer', 'dress_shirt', 'tie']
        casual_items = ['t-shirt', 'jeans', 'hoodie', 'shorts']
        
        if clothing_type in formal_items:
            return "formal"
        elif clothing_type in casual_items:
            return "casual"
        else:
            # Use style attributes to determine
            complexity = style_attributes.get('complexity', 'medium')
            if complexity == 'high':
                return "semi-formal"
            else:
                return "casual"
    
    def _determine_season(self, clothing_type, colors):
        """Determine suitable seasons for the clothing"""
        # Heavy items
        if clothing_type in ['coat', 'sweater', 'hoodie']:
            return ['fall', 'winter']
        
        # Light items
        if clothing_type in ['shorts', 't-shirt', 'tank_top']:
            return ['spring', 'summer']
        
        # Check colors for seasonal appropriateness
        dark_colors = ['black', 'brown', 'gray', 'navy']
        light_colors = ['white', 'yellow', 'pink', 'light_blue']
        
        dominant_color = colors[0]['name'] if colors else 'unknown'
        
        if dominant_color in dark_colors:
            return ['fall', 'winter']
        elif dominant_color in light_colors:
            return ['spring', 'summer']
        else:
            return ['spring', 'fall']
    
    def _determine_style_era(self, pil_image):
        """Determine the style era (modern, vintage, etc.)"""
        # This would require a more sophisticated model
        # For now, return modern as default
        return "modern"
    
    def _analyze_fit(self, image):
        """Analyze the fit type of the clothing"""
        # Basic heuristic based on silhouette
        return "regular"
    
    def _analyze_sleeves(self, image):
        """Analyze sleeve type"""
        # Would need more sophisticated analysis
        return "unknown"
    
    def _analyze_neckline(self, image):
        """Analyze neckline type"""
        # Would need more sophisticated analysis
        return "unknown"
