import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  margin: 40px auto;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e5e5;
  border-top: 4px solid #1a1a1a;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.h2`
  color: #1a1a1a;
  font-size: 1.5rem;
  margin-bottom: 10px;
  font-weight: 600;
`;

const LoadingSubtext = styled.p`
  color: #666666;
  font-size: 1rem;
  text-align: center;
  line-height: 1.5;
`;

const LoadingSpinner = ({ message = "Analyzing your clothing...", subtext = "Our AI is identifying colors, patterns, and style to find perfect matches" }) => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>{message}</LoadingText>
      <LoadingSubtext>{subtext}</LoadingSubtext>
    </LoadingContainer>
  );
};

export default LoadingSpinner;
