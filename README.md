# AI Wardrobe

An intelligent wardrobe assistant that uses AI to analyze clothing items and find matching pieces online.

## Features

- **AI Image Analysis**: Advanced computer vision to identify clothing type, colors, patterns, and style
- **Smart Style Matching**: Intelligent algorithms to suggest complementary clothing items
- **Web Product Search**: Automated search across major shopping platforms
- **Modern UI**: Beautiful, responsive React frontend
- **Real-time Processing**: Fast analysis and results

## System Architecture

### Backend (`/backend`)
- **Flask API Server**: RESTful API for image processing and analysis
- **AI Models**: Computer vision models for clothing analysis
- **Style Matcher**: Fashion knowledge base for outfit coordination
- **Web Scraper**: Automated product search across shopping sites

### Frontend (`/frontend`)
- **React Application**: Modern, responsive user interface
- **Image Upload**: Drag-and-drop image upload with preview
- **Results Display**: Beautiful product cards and filtering
- **Mobile Responsive**: Works great on all devices

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- Chrome browser (for web scraping)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. Run the Flask server:
   ```bash
   python app.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## How It Works

1. **Upload Image**: User uploads a photo of a clothing item
2. **AI Analysis**: Computer vision models analyze:
   - Clothing type (shirt, pants, dress, etc.)
   - Dominant colors
   - Patterns and textures
   - Style attributes
   - Formality level

3. **Style Matching**: Algorithm determines complementary items based on:
   - Fashion rules and color theory
   - Seasonal appropriateness
   - Style compatibility
   - Formality matching

4. **Product Search**: Web scraper searches for matching items:
   - Multiple shopping platforms
   - Price comparison
   - Relevance scoring
   - Image and product details

## API Endpoints

- `GET /` - API status and information
- `GET /api/health` - Health check
- `POST /api/analyze` - Analyze clothing image
- `POST /api/find-matches` - Find matching items
- `POST /api/analyze-and-match` - Combined analysis and search

## Technologies Used

### Backend
- **Flask**: Web framework
- **OpenCV**: Computer vision
- **PIL/Pillow**: Image processing
- **scikit-learn**: Machine learning
- **BeautifulSoup**: Web scraping
- **Selenium**: Browser automation

### Frontend
- **React**: UI framework
- **Styled Components**: CSS-in-JS styling
- **React Dropzone**: File upload
- **Axios**: HTTP client

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_google_custom_search_engine_id

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Upload Configuration
MAX_CONTENT_LENGTH=16777216
UPLOAD_FOLDER=../uploads
```

### Supported Image Formats
- JPEG, JPG
- PNG
- GIF
- BMP
- WebP

Maximum file size: 16MB

## Future Enhancements

- [ ] User accounts and wardrobe history
- [ ] Advanced style preferences
- [ ] Social sharing features
- [ ] Mobile app version
- [ ] Integration with more shopping platforms
- [ ] Outfit recommendation based on weather
- [ ] Virtual try-on features
