import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

const UploadContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 60px;
  text-align: center;
  margin: 40px auto;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const DropZone = styled.div`
  border: 3px dashed ${props => props.isDragActive ? '#FFD700' : 'rgba(255, 255, 255, 0.5)'};
  border-radius: 15px;
  padding: 80px 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(255, 215, 0, 0.1)' : 'transparent'};
  
  &:hover {
    border-color: #FFD700;
    background: rgba(255, 215, 0, 0.05);
    transform: translateY(-2px);
  }
`;

const UploadIcon = styled.div`
  font-size: 4rem;
  color: ${props => props.isDragActive ? '#FFD700' : 'white'};
  margin-bottom: 20px;
  transition: all 0.3s ease;
`;

const UploadText = styled.h2`
  color: white;
  font-size: 1.8rem;
  margin-bottom: 15px;
  font-weight: 600;
`;

const UploadSubtext = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.5;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SupportedFormats = styled.div`
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const ImageUploader = ({ onImageUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    maxSize: 16 * 1024 * 1024 // 16MB
  });

  return (
    <UploadContainer>
      <DropZone {...getRootProps()} isDragActive={isDragActive}>
        <FileInput {...getInputProps()} />
        <UploadIcon isDragActive={isDragActive}>
          📸
        </UploadIcon>
        <UploadText>
          {isDragActive ? 'Drop your image here!' : 'Upload Your Clothing Item'}
        </UploadText>
        <UploadSubtext>
          Take a clear photo of a piece of clothing you own and let our AI find perfect matching pieces for you
        </UploadSubtext>
        <UploadButton>
          Choose Image
        </UploadButton>
        <SupportedFormats>
          Supported formats: JPEG, PNG, GIF, WebP (Max 16MB)
        </SupportedFormats>
      </DropZone>
    </UploadContainer>
  );
};

export default ImageUploader;
