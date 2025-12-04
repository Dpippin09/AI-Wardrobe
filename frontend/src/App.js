import React, { useState } from 'react';
import styled from 'styled-components';
import ImageUploader from './components/ImageUploader';
import ClothingAnalysis from './components/ClothingAnalysis';
import MatchingResults from './components/MatchingResults';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Poppins', sans-serif;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px 0;
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  margin: 10px 0 0;
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.9;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
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
  color: white;
  font-weight: 500;
  
  ${props => props.active && `
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  `}
  
  ${props => props.completed && `
    color: #90EE90;
  `}
  
  @media (max-width: 768px) {
    margin: 10px 0;
  }
`;

const StepNumber = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.active ? '#FFD700' : props.completed ? '#90EE90' : 'rgba(255, 255, 255, 0.3)'};
  color: ${props => props.active || props.completed ? '#333' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: 600;
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
        <Title>AI Wardrobe</Title>
        <Subtitle>Discover perfect clothing matches with artificial intelligence</Subtitle>
      </Header>
      
      <MainContent>
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
            background: 'rgba(255, 0, 0, 0.1)', 
            border: '1px solid red', 
            borderRadius: '8px', 
            padding: '15px', 
            margin: '20px 0', 
            color: 'white',
            textAlign: 'center'
          }}>
            <strong>Error:</strong> {error}
            <button 
              onClick={handleReset}
              style={{
                marginLeft: '20px',
                padding: '5px 15px',
                background: 'white',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
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
