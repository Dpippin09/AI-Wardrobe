import requests
import json
import time
from bs4 import BeautifulSoup
from typing import List, Dict, Any
import urllib.parse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re

class WebSearcher:
    def __init__(self):
        """Initialize web searcher with supported shopping sites"""
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Shopping sites to search
        self.shopping_sites = {
            'amazon': {
                'url': 'https://www.amazon.com/s',
                'params': {'k': '', 'ref': 'sr_pg_1'},
                'selectors': {
                    'products': '[data-component-type="s-search-result"]',
                    'title': 'h2 a span',
                    'price': '.a-price-whole',
                    'image': '.s-image',
                    'link': 'h2 a'
                }
            },
            'zappos': {
                'url': 'https://www.zappos.com/search',
                'params': {'term': ''},
                'selectors': {
                    'products': '[data-test-id="product-grid-item"]',
                    'title': '[data-test-id="product-name"]',
                    'price': '[data-test-id="product-price"]',
                    'image': 'img',
                    'link': 'a'
                }
            }
        }
        
        # Rate limiting
        self.last_request_time = 0
        self.min_delay = 1  # Minimum 1 second between requests
        
    def search_products(self, recommendation: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Search for products based on style recommendation
        
        Args:
            recommendation: Style recommendation from StyleMatcher
            
        Returns:
            List of product information dictionaries
        """
        search_terms = recommendation.get('search_terms', [])
        item_type = recommendation.get('item_type', '')
        
        all_products = []
        
        # Search with multiple terms
        for term in search_terms[:3]:  # Limit to first 3 terms to avoid overwhelming
            try:
                # Add delay for rate limiting
                self._rate_limit()
                
                # Search Amazon (most reliable)
                amazon_products = self._search_amazon(term, recommendation)
                all_products.extend(amazon_products)
                
                # Search other sites if needed
                if len(all_products) < 10:
                    # Add delay between different sites
                    self._rate_limit()
                    other_products = self._search_general_sites(term, recommendation)
                    all_products.extend(other_products)
                
            except Exception as e:
                print(f"Error searching for {term}: {e}")
                continue
        
        # Remove duplicates and sort by relevance
        unique_products = self._remove_duplicates(all_products)
        sorted_products = self._sort_by_relevance(unique_products, recommendation)
        
        return sorted_products[:20]  # Return top 20 products
    
    def _search_amazon(self, search_term: str, recommendation: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search Amazon for products"""
        try:
            # Prepare search URL
            base_url = "https://www.amazon.com/s"
            params = {
                'k': search_term,
                'ref': 'sr_pg_1'
            }
            
            # Add department filter if possible
            item_type = recommendation.get('item_type', '')
            if item_type in ['shirt', 't-shirt', 'blouse']:
                params['i'] = 'fashion-mens'  # or fashion-womens
            
            url = f"{base_url}?{urllib.parse.urlencode(params)}"
            
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            products = []
            
            # Find product containers
            product_containers = soup.find_all('div', {'data-component-type': 's-search-result'})
            
            for container in product_containers[:10]:  # Limit to first 10 results
                try:
                    # Extract product information
                    title_elem = container.find('h2')
                    if title_elem:
                        title_link = title_elem.find('a')
                        title = title_link.find('span').get_text(strip=True) if title_link and title_link.find('span') else 'N/A'
                        product_url = 'https://amazon.com' + title_link.get('href') if title_link else ''
                    else:
                        continue
                    
                    # Extract price
                    price_elem = container.find('span', class_='a-price-whole')
                    price = price_elem.get_text(strip=True) if price_elem else 'N/A'
                    
                    # Extract image
                    img_elem = container.find('img', class_='s-image')
                    image_url = img_elem.get('src') if img_elem else ''
                    
                    # Extract rating
                    rating_elem = container.find('span', class_='a-icon-alt')
                    rating = rating_elem.get_text(strip=True).split()[0] if rating_elem else 'N/A'
                    
                    product = {
                        'title': title,
                        'price': price,
                        'url': product_url,
                        'image_url': image_url,
                        'rating': rating,
                        'source': 'Amazon',
                        'relevance_score': self._calculate_relevance(title, recommendation),
                        'search_term': search_term
                    }
                    
                    products.append(product)
                    
                except Exception as e:
                    print(f"Error parsing Amazon product: {e}")
                    continue
            
            return products
            
        except Exception as e:
            print(f"Error searching Amazon: {e}")
            return []
    
    def _search_general_sites(self, search_term: str, recommendation: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search other shopping sites using a general approach"""
        products = []
        
        # Use Google Shopping search as a fallback
        try:
            google_url = f"https://www.google.com/search?q={urllib.parse.quote(search_term + ' shopping')}&tbm=shop"
            
            response = requests.get(google_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Parse Google Shopping results (simplified)
            shopping_results = soup.find_all('div', class_='sh-dgr__content')
            
            for result in shopping_results[:5]:  # Limit results
                try:
                    # Extract basic information (this is a simplified approach)
                    title_elem = result.find('h3')
                    title = title_elem.get_text(strip=True) if title_elem else 'N/A'
                    
                    # Try to find price
                    price_elem = result.find('span', text=re.compile(r'\$\d+'))
                    price = price_elem.get_text(strip=True) if price_elem else 'N/A'
                    
                    product = {
                        'title': title,
                        'price': price,
                        'url': '',  # Google Shopping doesn't provide direct links easily
                        'image_url': '',
                        'rating': 'N/A',
                        'source': 'Google Shopping',
                        'relevance_score': self._calculate_relevance(title, recommendation),
                        'search_term': search_term
                    }
                    
                    products.append(product)
                    
                except Exception as e:
                    continue
            
        except Exception as e:
            print(f"Error searching general sites: {e}")
        
        return products
    
    def _calculate_relevance(self, title: str, recommendation: Dict[str, Any]) -> float:
        """Calculate how relevant a product is to the recommendation"""
        score = 0.0
        title_lower = title.lower()
        
        # Check for item type match
        item_type = recommendation.get('item_type', '').lower()
        if item_type in title_lower:
            score += 1.0
        
        # Check for color matches
        recommended_colors = recommendation.get('recommended_colors', [])
        for color in recommended_colors:
            if color.lower() in title_lower:
                score += 0.5
        
        # Check for style tags
        style_tags = recommendation.get('style_tags', [])
        for tag in style_tags:
            if tag.lower() in title_lower:
                score += 0.3
        
        # Check for formality level
        formality = recommendation.get('formality_level', '').lower()
        if formality == 'formal' and any(word in title_lower for word in ['business', 'formal', 'dress', 'professional']):
            score += 0.4
        elif formality == 'casual' and any(word in title_lower for word in ['casual', 'comfortable', 'relaxed']):
            score += 0.4
        
        return score
    
    def _remove_duplicates(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate products based on title similarity"""
        unique_products = []
        seen_titles = set()
        
        for product in products:
            title = product.get('title', '').lower()
            # Simple deduplication based on first few words
            title_key = ' '.join(title.split()[:4])
            
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique_products.append(product)
        
        return unique_products
    
    def _sort_by_relevance(self, products: List[Dict[str, Any]], recommendation: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Sort products by relevance score"""
        return sorted(products, key=lambda x: x.get('relevance_score', 0), reverse=True)
    
    def _rate_limit(self):
        """Implement rate limiting to be respectful to websites"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_delay:
            time.sleep(self.min_delay - time_since_last)
        
        self.last_request_time = time.time()
    
    def search_with_selenium(self, search_term: str, site: str = 'amazon') -> List[Dict[str, Any]]:
        """
        Use Selenium for more complex scraping (when needed)
        This method is more robust but slower
        """
        try:
            # Setup Chrome options
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument(f'--user-agent={self.headers["User-Agent"]}')
            
            # Initialize driver
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(30)
            
            products = []
            
            if site == 'amazon':
                url = f"https://www.amazon.com/s?k={urllib.parse.quote(search_term)}"
                driver.get(url)
                
                # Wait for results to load
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, '[data-component-type="s-search-result"]'))
                )
                
                # Extract products
                product_elements = driver.find_elements(By.CSS_SELECTOR, '[data-component-type="s-search-result"]')
                
                for elem in product_elements[:10]:
                    try:
                        title = elem.find_element(By.CSS_SELECTOR, 'h2 a span').text
                        price = elem.find_element(By.CSS_SELECTOR, '.a-price-whole').text
                        image_url = elem.find_element(By.CSS_SELECTOR, '.s-image').get_attribute('src')
                        product_url = elem.find_element(By.CSS_SELECTOR, 'h2 a').get_attribute('href')
                        
                        products.append({
                            'title': title,
                            'price': price,
                            'url': product_url,
                            'image_url': image_url,
                            'source': 'Amazon (Selenium)',
                            'search_term': search_term
                        })
                    except Exception as e:
                        continue
            
            driver.quit()
            return products
            
        except Exception as e:
            print(f"Selenium search error: {e}")
            return []
