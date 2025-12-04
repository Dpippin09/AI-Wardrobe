import React from 'react';
import styled from 'styled-components';

const AnalysisContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  margin: 40px auto;
  max-width: 800px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h2`
  color: white;
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const ImageContainer = styled.div`
  text-align: center;
`;

const UploadedImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const AnalysisDetails = styled.div`
  color: white;
`;

const AnalysisSection = styled.div`
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #FFD700;
  font-weight: 600;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  opacity: 0.9;
`;

const DetailValue = styled.span`
  font-weight: 600;
  text-transform: capitalize;
`;

const ColorPalette = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const ColorSwatch = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  cursor: help;
  
  &:hover::after {
    content: "${props => props.colorName}";
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 5px;
`;

const ConfidenceFill = styled.div`
  width: ${props => props.percentage}%;
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcf7f);
  transition: width 0.3s ease;
`;

const ClothingAnalysis = ({ analysis, image }) => {
  if (!analysis) return null;

  const confidencePercentage = Math.round((analysis.confidence_score || 0.85) * 100);

  return (
    <AnalysisContainer>
      <Title>AI Analysis Results</Title>
      
      <ContentGrid>
        <ImageContainer>
          <UploadedImage src={image} alt="Uploaded clothing item" />
        </ImageContainer>
        
        <AnalysisDetails>
          <AnalysisSection>
            <SectionTitle>👔 Clothing Details</SectionTitle>
            <DetailItem>
              <DetailLabel>Type:</DetailLabel>
              <DetailValue>{analysis.clothing_type || 'Unknown'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Formality:</DetailLabel>
              <DetailValue>{analysis.formality_level || 'Casual'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Complexity:</DetailLabel>
              <DetailValue>{analysis.style_attributes?.complexity || 'Medium'}</DetailValue>
            </DetailItem>
          </AnalysisSection>

          <AnalysisSection>
            <SectionTitle>🎨 Color Analysis</SectionTitle>
            {analysis.dominant_colors && analysis.dominant_colors.length > 0 ? (
              <ColorPalette>
                {analysis.dominant_colors.map((color, index) => (
                  <ColorSwatch
                    key={index}
                    color={color.hex}
                    colorName={color.name}
                    title={color.name}
                  />
                ))}
              </ColorPalette>
            ) : (
              <DetailValue>No colors detected</DetailValue>
            )}
          </AnalysisSection>

          <AnalysisSection>
            <SectionTitle>🧵 Material & Texture</SectionTitle>
            <DetailItem>
              <DetailLabel>Material:</DetailLabel>
              <DetailValue>{analysis.texture?.material || 'Cotton'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Pattern:</DetailLabel>
              <DetailValue>{analysis.texture?.pattern || 'Solid'}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Has Patterns:</DetailLabel>
              <DetailValue>{analysis.style_attributes?.has_patterns ? 'Yes' : 'No'}</DetailValue>
            </DetailItem>
          </AnalysisSection>

          <AnalysisSection>
            <SectionTitle>🌍 Season & Style</SectionTitle>
            <DetailItem>
              <DetailLabel>Best Seasons:</DetailLabel>
              <DetailValue>
                {analysis.season_suitability?.join(', ') || 'All seasons'}
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Style Era:</DetailLabel>
              <DetailValue>{analysis.style_attributes?.style_era || 'Modern'}</DetailValue>
            </DetailItem>
          </AnalysisSection>

          <AnalysisSection>
            <SectionTitle>🤖 AI Confidence</SectionTitle>
            <DetailItem>
              <DetailLabel>Confidence Score:</DetailLabel>
              <DetailValue>{confidencePercentage}%</DetailValue>
            </DetailItem>
            <ConfidenceBar>
              <ConfidenceFill percentage={confidencePercentage} />
            </ConfidenceBar>
          </AnalysisSection>
        </AnalysisDetails>
      </ContentGrid>
    </AnalysisContainer>
  );
};

export default ClothingAnalysis;
