const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize OpenAI client (lazy initialization to allow server to start without API key)
let openai = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// Analyze clothing image and get matching suggestions
async function analyzeClothingImage(imagePath) {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this piece of clothing and provide:
1. A detailed description of the clothing item (type, color, style, pattern, material if visible)
2. 5 specific suggestions for matching clothing items that would go well with it
3. For each suggestion, provide specific search terms that could be used to find these items online

Please respond in the following JSON format:
{
  "description": "Detailed description of the clothing item",
  "category": "Category (e.g., tops, bottoms, outerwear, footwear, accessories)",
  "primaryColor": "Main color of the item",
  "style": "Style description (casual, formal, sporty, etc.)",
  "matchingSuggestions": [
    {
      "item": "Name of matching item",
      "reason": "Why it matches",
      "searchTerms": "Search query to find this item online",
      "colors": ["suggested colors that would match"]
    }
  ]
}`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 1500
  });

  const content = response.choices[0].message.content;
  
  // Try to parse as JSON, handle potential formatting issues
  try {
    // Remove markdown code blocks if present
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedContent);
  } catch {
    // If parsing fails, return raw content with structure
    return {
      description: content,
      category: 'unknown',
      primaryColor: 'unknown',
      style: 'unknown',
      matchingSuggestions: []
    };
  }
}

// Generate mock search results based on search terms
function generateSearchResults(suggestion) {
  const baseResults = [
    {
      id: uuidv4(),
      title: suggestion.item,
      searchTerms: suggestion.searchTerms,
      suggestedColors: suggestion.colors,
      reason: suggestion.reason,
      // Mock shopping links - in production, these would come from actual shopping APIs
      shoppingLinks: [
        {
          store: 'Amazon',
          searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(suggestion.searchTerms)}`
        },
        {
          store: 'Nordstrom',
          searchUrl: `https://www.nordstrom.com/sr?keyword=${encodeURIComponent(suggestion.searchTerms)}`
        },
        {
          store: 'ASOS',
          searchUrl: `https://www.asos.com/us/search/?q=${encodeURIComponent(suggestion.searchTerms)}`
        },
        {
          store: 'Zara',
          searchUrl: `https://www.zara.com/us/en/search?searchTerm=${encodeURIComponent(suggestion.searchTerms)}`
        }
      ]
    }
  ];
  
  return baseResults;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload and analyze clothing image
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const imagePath = req.file.path;
    
    // Analyze the image with OpenAI Vision
    const analysis = await analyzeClothingImage(imagePath);
    
    // Generate search results for each matching suggestion
    const searchResults = analysis.matchingSuggestions.map(suggestion => ({
      ...suggestion,
      results: generateSearchResults(suggestion)
    }));

    res.json({
      success: true,
      imageUrl: `/uploads/${req.file.filename}`,
      analysis: {
        description: analysis.description,
        category: analysis.category,
        primaryColor: analysis.primaryColor,
        style: analysis.style
      },
      matchingSuggestions: searchResults
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image', 
      details: error.message 
    });
  }
});

// Clean up old uploads (files older than 1 hour)
function cleanupOldUploads() {
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) return;

  const files = fs.readdirSync(uploadDir);
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  files.forEach(file => {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);
    if (stats.mtimeMs < oneHourAgo) {
      fs.unlinkSync(filePath);
    }
  });
}

// Run cleanup every 30 minutes
setInterval(cleanupOldUploads, 30 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`AI Wardrobe server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = app;
