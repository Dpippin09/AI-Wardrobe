import React, { useState } from 'react';
import styled from 'styled-components';
import ImageUploader from './components/ImageUploader';
import ClothingAnalysis from './components/ClothingAnalysis';
import MatchingResults from './components/MatchingResults';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  color: #1a1a1a;
`;

const Header = styled.header`
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  padding: 60px 0 40px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 40px 20px 30px;
  }
  
  @media (max-width: 480px) {
    padding: 30px 15px 25px;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #1a1a1a;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  margin: 10px 0 0;
  font-size: 1.2rem;
  font-weight: 400;
  color: #666666;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 30px 15px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 10px;
  }
`;

const IntroNote = styled.div`
  background: #f8f9fa;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  padding: 24px;
  margin: 40px auto;
  max-width: 800px;
  text-align: center;
  
  h3 {
    color: #1a1a1a;
    margin-bottom: 12px;
    font-weight: 600;
    font-size: 1.3rem;
  }
  
  p {
    color: #666666;
    line-height: 1.6;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    margin: 20px auto;
    border-radius: 8px;
    
    h3 {
      font-size: 1.2rem;
    }
    
    p {
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    margin: 15px auto;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 10px;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  margin: 0 20px;
  color: #666666;
  font-weight: 500;
  
  ${props => props.active && `
    color: #1a1a1a;
    font-weight: 600;
  `}
  
  ${props => props.completed && `
    color: #28a745;
  `}
  
  @media (max-width: 768px) {
    margin: 10px 0;
  }
`;

const StepNumber = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.active ? '#1a1a1a' : props.completed ? '#28a745' : '#e5e5e5'};
  color: ${props => props.active || props.completed ? 'white' : '#666666'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: 600;
  font-size: 0.9rem;
`;

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchingResults, setMatchingResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (imageFile) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('preferences', JSON.stringify({
        budget: 'medium',
        style: 'versatile'
      }));

      // Call the combined API endpoint
      const response = await fetch('/api/analyze-and-match', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadedImage(URL.createObjectURL(imageFile));
        setAnalysisResult(result.analysis);
        setMatchingResults({
          recommendations: result.recommendations,
          products: result.products
        });
        setCurrentStep(3);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setUploadedImage(null);
    setAnalysisResult(null);
    setMatchingResults(null);
    setError(null);
  };

  const steps = [
    { number: 1, title: "Upload Image", active: currentStep === 1, completed: currentStep > 1 },
    { number: 2, title: "AI Analysis", active: currentStep === 2, completed: currentStep > 2 },
    { number: 3, title: "Find Matches", active: currentStep === 3, completed: false }
  ];

  return (
    <AppContainer>
      <Header>
        <Title>AI WARDROBE</Title>
        <Subtitle>Where fashion meets intelligence</Subtitle>
      </Header>
      
      <MainContent>
        {currentStep === 1 && (
          <IntroNote>
            <h3>📱 Mobile-Optimized AI Wardrobe</h3>
            <p>Take a photo of your clothing item using your mobile camera or choose from your gallery. Our AI will analyze the style, colors, and material to find perfect matching pieces for you!</p>
          </IntroNote>
        )}
        
        <StepIndicator>
          {steps.map((step) => (
            <Step key={step.number} active={step.active} completed={step.completed}>
              <StepNumber active={step.active} completed={step.completed}>
                {step.number}
              </StepNumber>
              {step.title}
            </Step>
          ))}
        </StepIndicator>

        {error && (
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '8px', 
            padding: '16px', 
            margin: '20px 0', 
            color: '#856404',
            textAlign: 'center'
          }}>
            <strong>Error:</strong> {error}
            <button 
              onClick={handleReset}
              style={{
                marginLeft: '20px',
                padding: '8px 16px',
                background: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {!isLoading && currentStep === 1 && (
          <ImageUploader onImageUpload={handleImageUpload} />
        )}

        {!isLoading && currentStep === 2 && analysisResult && (
          <ClothingAnalysis 
            analysis={analysisResult} 
            image={uploadedImage}
          />
        )}

        {!isLoading && currentStep === 3 && matchingResults && (
          <MatchingResults 
            results={matchingResults}
            originalAnalysis={analysisResult}
            originalImage={uploadedImage}
            onReset={handleReset}
          />
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
