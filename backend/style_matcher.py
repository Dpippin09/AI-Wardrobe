import json
import os
from typing import Dict, List, Any

class StyleMatcher:
    def __init__(self):
        """Initialize the style matcher with fashion rules and preferences"""
        self.style_rules = self._load_style_rules()
        self.color_compatibility = self._load_color_compatibility()
        
    def find_matches(self, clothing_analysis: Dict[str, Any], preferences: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Find clothing items that would match the analyzed piece
        
        Args:
            clothing_analysis: Analysis results from ClothingAnalyzer
            preferences: User preferences (budget, style, brands, etc.)
            
        Returns:
            List of matching clothing recommendations
        """
        if preferences is None:
            preferences = {}
            
        clothing_type = clothing_analysis.get('clothing_type', 'unknown')
        colors = clothing_analysis.get('dominant_colors', [])
        formality = clothing_analysis.get('formality_level', 'casual')
        season = clothing_analysis.get('season_suitability', ['spring', 'fall'])
        
        matches = []
        
        # Get complementary clothing types
        complementary_types = self._get_complementary_types(clothing_type, formality)
        
        # Generate matches for each complementary type
        for comp_type in complementary_types:
            match_colors = self._get_matching_colors(colors)
            
            for color_scheme in match_colors:
                match = {
                    "item_type": comp_type,
                    "recommended_colors": color_scheme,
                    "formality_level": formality,
                    "season": season,
                    "style_tags": self._generate_style_tags(comp_type, formality, color_scheme),
                    "search_terms": self._generate_search_terms(comp_type, color_scheme, formality),
                    "priority": self._calculate_priority(comp_type, clothing_type, formality),
                    "outfit_type": self._determine_outfit_type(clothing_type, comp_type, formality)
                }
                
                matches.append(match)
        
        # Sort by priority and return top matches
        matches.sort(key=lambda x: x['priority'], reverse=True)
        return matches[:10]  # Return top 10 matches
    
    def _load_style_rules(self) -> Dict[str, Any]:
        """Load fashion style rules"""
        return {
            "formal": {
                "shirt": ["suit", "dress_pants", "blazer", "tie", "dress_shoes"],
                "suit": ["dress_shirt", "tie", "dress_shoes", "belt"],
                "dress": ["heels", "blazer", "cardigan", "accessories"],
                "blazer": ["dress_pants", "shirt", "dress_shoes"],
                "dress_pants": ["shirt", "blazer", "dress_shoes", "belt"]
            },
            "casual": {
                "t-shirt": ["jeans", "shorts", "sneakers", "jacket", "hoodie"],
                "jeans": ["t-shirt", "shirt", "sweater", "sneakers", "boots"],
                "shorts": ["t-shirt", "polo", "sandals", "sneakers"],
                "hoodie": ["jeans", "sweatpants", "sneakers"],
                "sweater": ["jeans", "pants", "boots", "scarf"]
            },
            "semi-formal": {
                "blouse": ["dress_pants", "skirt", "blazer", "heels"],
                "polo": ["chinos", "dress_pants", "loafers"],
                "cardigan": ["dress_pants", "skirt", "blouse", "flats"],
                "chinos": ["polo", "shirt", "loafers", "belt"]
            }
        }
    
    def _load_color_compatibility(self) -> Dict[str, List[str]]:
        """Load color matching rules"""
        return {
            "black": ["white", "gray", "red", "blue", "yellow", "pink", "purple"],
            "white": ["black", "blue", "red", "green", "yellow", "purple", "brown"],
            "gray": ["white", "black", "blue", "yellow", "pink", "purple"],
            "blue": ["white", "gray", "yellow", "orange", "red", "brown"],
            "red": ["white", "black", "gray", "blue", "yellow"],
            "green": ["white", "brown", "yellow", "red", "blue"],
            "yellow": ["black", "blue", "white", "gray", "purple"],
            "brown": ["white", "blue", "green", "yellow", "orange"],
            "pink": ["white", "gray", "black", "blue", "green"],
            "purple": ["white", "yellow", "gray", "black"],
            "orange": ["blue", "white", "brown", "green"],
            "navy": ["white", "yellow", "red", "orange", "pink"]
        }
    
    def _get_complementary_types(self, clothing_type: str, formality: str) -> List[str]:
        """Get clothing types that complement the given item"""
        rules = self.style_rules.get(formality, {})
        complementary = rules.get(clothing_type, [])
        
        # Add general complementary items based on clothing type category
        if self._is_top(clothing_type):
            complementary.extend(["pants", "jeans", "skirt", "shorts"])
        elif self._is_bottom(clothing_type):
            complementary.extend(["shirt", "t-shirt", "blouse", "sweater"])
        elif self._is_outerwear(clothing_type):
            complementary.extend(["shirt", "pants", "dress"])
        
        # Remove duplicates and the original item
        complementary = list(set(complementary))
        if clothing_type in complementary:
            complementary.remove(clothing_type)
            
        return complementary
    
    def _get_matching_colors(self, input_colors: List[Dict[str, Any]]) -> List[List[str]]:
        """Get colors that match well with the input colors"""
        if not input_colors:
            return [["white"], ["black"], ["gray"]]
        
        matching_schemes = []
        
        for color_info in input_colors[:3]:  # Process top 3 colors
            color_name = color_info.get('name', 'white')
            compatible_colors = self.color_compatibility.get(color_name, ["white", "black"])
            
            # Create color schemes
            matching_schemes.append([color_name])  # Monochromatic
            matching_schemes.append(compatible_colors[:2])  # Complementary
            
        # Add neutral schemes
        matching_schemes.extend([
            ["white", "black"],
            ["gray", "white"],
            ["black", "white"],
            ["navy", "white"]
        ])
        
        return matching_schemes[:8]  # Limit to 8 schemes
    
    def _generate_style_tags(self, item_type: str, formality: str, colors: List[str]) -> List[str]:
        """Generate style tags for search optimization"""
        tags = [item_type, formality]
        
        # Add color tags
        tags.extend(colors)
        
        # Add style descriptors
        if formality == "formal":
            tags.extend(["professional", "business", "elegant"])
        elif formality == "casual":
            tags.extend(["comfortable", "relaxed", "everyday"])
        else:
            tags.extend(["smart-casual", "versatile"])
        
        # Add seasonal tags
        tags.extend(["spring", "summer", "fall", "winter"])
        
        return list(set(tags))
    
    def _generate_search_terms(self, item_type: str, colors: List[str], formality: str) -> List[str]:
        """Generate search terms for web scraping"""
        base_terms = [item_type]
        
        # Add color terms
        if colors:
            for color in colors:
                base_terms.append(f"{color} {item_type}")
        
        # Add formality terms
        if formality == "formal":
            base_terms.extend([
                f"formal {item_type}",
                f"business {item_type}",
                f"professional {item_type}"
            ])
        elif formality == "casual":
            base_terms.extend([
                f"casual {item_type}",
                f"comfortable {item_type}"
            ])
        
        # Add brand/style modifiers
        style_modifiers = [
            "cotton", "slim fit", "classic", "modern", "trendy"
        ]
        
        for modifier in style_modifiers:
            base_terms.append(f"{modifier} {item_type}")
        
        return base_terms[:10]  # Limit to 10 search terms
    
    def _calculate_priority(self, comp_type: str, original_type: str, formality: str) -> float:
        """Calculate priority score for the match"""
        base_score = 1.0
        
        # High priority pairs
        high_priority_pairs = [
            ("shirt", "pants"), ("pants", "shirt"),
            ("dress", "shoes"), ("shoes", "dress"),
            ("suit", "shirt"), ("shirt", "suit")
        ]
        
        if (original_type, comp_type) in high_priority_pairs:
            base_score += 0.5
        
        # Formality bonus
        if formality == "formal":
            base_score += 0.3
        elif formality == "semi-formal":
            base_score += 0.2
        
        # Essential items bonus
        essential_items = ["shoes", "pants", "shirt", "dress"]
        if comp_type in essential_items:
            base_score += 0.2
        
        return base_score
    
    def _determine_outfit_type(self, original_type: str, comp_type: str, formality: str) -> str:
        """Determine the type of outfit being created"""
        if formality == "formal":
            return "business"
        elif formality == "casual":
            if comp_type in ["shorts", "t-shirt"]:
                return "leisure"
            else:
                return "everyday"
        else:
            return "smart-casual"
    
    def _is_top(self, clothing_type: str) -> bool:
        """Check if the clothing type is a top"""
        tops = ["shirt", "t-shirt", "blouse", "sweater", "hoodie", "tank_top", "polo", "cardigan"]
        return clothing_type in tops
    
    def _is_bottom(self, clothing_type: str) -> bool:
        """Check if the clothing type is a bottom"""
        bottoms = ["pants", "jeans", "shorts", "skirt", "dress_pants", "chinos", "sweatpants"]
        return clothing_type in bottoms
    
    def _is_outerwear(self, clothing_type: str) -> bool:
        """Check if the clothing type is outerwear"""
        outerwear = ["jacket", "coat", "blazer", "cardigan", "hoodie"]
        return clothing_type in outerwear
