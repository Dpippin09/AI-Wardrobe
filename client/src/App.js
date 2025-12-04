import React, { useState, useCallback } from 'react';
import './App.css';

// Image Upload Component
function ImageUpload({ onImageSelect, selectedImage }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div 
      className="upload-area"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {selectedImage ? (
        <div className="selected-image-container">
          <img src={selectedImage} alt="Selected clothing" className="selected-image" />
          <button 
            className="change-image-btn"
            onClick={() => document.getElementById('file-input').click()}
          >
            Change Image
          </button>
        </div>
      ) : (
        <div className="upload-placeholder">
          <div className="upload-icon">📷</div>
          <h3>Upload Your Clothing Photo</h3>
          <p>Drag and drop an image here, or click to select</p>
          <button 
            className="upload-btn"
            onClick={() => document.getElementById('file-input').click()}
          >
            Select Image
          </button>
        </div>
      )}
      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

// Analysis Results Component
function AnalysisResults({ analysis }) {
  return (
    <div className="analysis-section">
      <h3>Your Clothing Item</h3>
      <div className="analysis-card">
        <div className="analysis-detail">
          <span className="label">Description:</span>
          <span className="value">{analysis.description}</span>
        </div>
        <div className="analysis-row">
          <div className="analysis-detail">
            <span className="label">Category:</span>
            <span className="value tag">{analysis.category}</span>
          </div>
          <div className="analysis-detail">
            <span className="label">Primary Color:</span>
            <span className="value tag">{analysis.primaryColor}</span>
          </div>
          <div className="analysis-detail">
            <span className="label">Style:</span>
            <span className="value tag">{analysis.style}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Matching Suggestion Card Component
function SuggestionCard({ suggestion }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="suggestion-card">
      <div className="suggestion-header" onClick={() => setExpanded(!expanded)}>
        <h4>{suggestion.item}</h4>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </div>
      <p className="suggestion-reason">{suggestion.reason}</p>
      
      {suggestion.colors && suggestion.colors.length > 0 && (
        <div className="suggested-colors">
          <span className="colors-label">Suggested Colors:</span>
          <div className="color-tags">
            {suggestion.colors.map((color, index) => (
              <span key={index} className="color-tag">{color}</span>
            ))}
          </div>
        </div>
      )}

      {expanded && suggestion.results && suggestion.results.length > 0 && (
        <div className="shopping-links">
          <p className="search-terms">
            <strong>Search for:</strong> "{suggestion.searchTerms}"
          </p>
          <div className="store-links">
            {suggestion.results[0].shoppingLinks.map((link, index) => (
              <a
                key={index}
                href={link.searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="store-link"
              >
                {link.store}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main App Component
function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleImageSelect = (file, preview) => {
    setSelectedFile(file);
    setSelectedImage(preview);
    setError(null);
    setResults(null);
  };

  const analyzeClothing = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the image');
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setSelectedImage(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>👔 AI Wardrobe</h1>
        <p>Find matching clothing items with AI-powered recommendations</p>
      </header>

      <main className="app-main">
        <section className="upload-section">
          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
          />
          
          {selectedImage && !results && (
            <button
              className="analyze-btn"
              onClick={analyzeClothing}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Find Matching Clothes'
              )}
            </button>
          )}

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}
        </section>

        {results && (
          <section className="results-section">
            <AnalysisResults analysis={results.analysis} />

            <div className="suggestions-section">
              <h3>Matching Clothing Suggestions</h3>
              <p className="suggestions-intro">
                Based on your clothing item, here are some pieces that would complement it well:
              </p>
              <div className="suggestions-grid">
                {results.matchingSuggestions.map((suggestion, index) => (
                  <SuggestionCard key={index} suggestion={suggestion} />
                ))}
              </div>
            </div>

            <button className="reset-btn" onClick={resetApp}>
              Analyze Another Item
            </button>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by OpenAI Vision API</p>
      </footer>
    </div>
  );
}

export default App;
