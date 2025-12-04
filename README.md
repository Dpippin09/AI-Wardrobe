# AI Wardrobe 👔

An AI-powered shopping assistant that allows users to upload a picture of a piece of clothing they own and receive personalized recommendations for matching clothing items from various online retailers.

## Features

- **Image Upload**: Upload photos of your clothing items via drag-and-drop or file selection
- **AI-Powered Analysis**: Uses OpenAI's Vision API (GPT-4o) to analyze clothing items
- **Smart Recommendations**: Get 5 personalized suggestions for matching clothing pieces
- **Shopping Integration**: Direct links to search for recommended items on popular retailers (Amazon, Nordstrom, ASOS, Zara)
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Project Structure

```
AI-Wardrobe/
├── client/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   └── App.test.js    # Frontend tests
│   └── package.json
├── server/                 # Node.js/Express backend
│   ├── index.js           # Main server file
│   ├── .env.example       # Environment variables template
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm
- OpenAI API Key (with access to GPT-4 Vision)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AI-Wardrobe.git
cd AI-Wardrobe
```

### 2. Set Up the Server

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### 3. Set Up the Client

```bash
cd ../client
npm install
```

### 4. Run the Application

Start the server (from the `server` directory):

```bash
npm start
```

In a new terminal, start the client (from the `client` directory):

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. **Upload an Image**: Click "Select Image" or drag and drop a photo of your clothing item
2. **Analyze**: Click "Find Matching Clothes" to analyze your clothing
3. **Browse Recommendations**: View AI-generated recommendations for matching items
4. **Shop**: Click on any recommendation to expand and see shopping links to various retailers

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

### Analyze Clothing
```
POST /api/analyze
Content-Type: multipart/form-data
Body: image file
```
Analyzes the uploaded clothing image and returns matching suggestions.

**Response:**
```json
{
  "success": true,
  "imageUrl": "/uploads/filename.jpg",
  "analysis": {
    "description": "Detailed description of the clothing item",
    "category": "Category (e.g., tops, bottoms)",
    "primaryColor": "Main color",
    "style": "Style description"
  },
  "matchingSuggestions": [
    {
      "item": "Suggested item name",
      "reason": "Why it matches",
      "searchTerms": "Search query",
      "colors": ["color1", "color2"],
      "results": [
        {
          "shoppingLinks": [
            { "store": "Amazon", "searchUrl": "..." }
          ]
        }
      ]
    }
  ]
}
```

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **AI**: OpenAI GPT-4 Vision API
- **File Upload**: Multer
- **Styling**: Custom CSS with modern design

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3001) | No |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for the Vision API
- React.js team for the excellent framework
