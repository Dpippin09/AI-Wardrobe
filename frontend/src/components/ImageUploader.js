import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

const UploadContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
  margin: 40px auto;
  max-width: 600px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const DropZone = styled.div`
  border: 2px solid ${props => props.isDragActive ? '#1a1a1a' : '#e5e5e5'};
  border-radius: 12px;
  padding: 80px 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? '#fafafa' : 'transparent'};
  
  &:hover {
    border-color: #1a1a1a;
    background: #fafafa;
    transform: translateY(-2px);
  }
`;

const UploadIcon = styled.div`
  font-size: 4rem;
  color: ${props => props.isDragActive ? '#1a1a1a' : '#666666'};
  margin-bottom: 20px;
  transition: all 0.3s ease;
`;

const UploadText = styled.h2`
  color: #1a1a1a;
  font-size: 1.8rem;
  margin-bottom: 15px;
  font-weight: 600;
`;

const UploadSubtext = styled.p`
  color: #666666;
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.5;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 180px;
  
  &:hover {
    background: #333333;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CameraButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 180px;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    
    button {
      width: 100%;
      max-width: 250px;
    }
  }
`;

const SupportedFormats = styled.div`
  margin-top: 20px;
  color: #999999;
  font-size: 0.9rem;
`;

const ImageUploader = ({ onImageUpload }) => {
  const cameraInputRef = useRef(null);
  
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

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <UploadContainer>
      <DropZone {...getRootProps()} isDragActive={isDragActive}>
        <FileInput {...getInputProps()} />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleCameraCapture}
        />
        <UploadIcon isDragActive={isDragActive}>
          📸
        </UploadIcon>
        <UploadText>
          {isDragActive ? 'Drop your image here!' : 'Upload Your Clothing Item'}
        </UploadText>
        <UploadSubtext>
          Take a clear photo of a piece of clothing you own and let our AI find perfect matching pieces for you
        </UploadSubtext>
        <ButtonGroup>
          <UploadButton>
            📁 Choose from Gallery
          </UploadButton>
          <CameraButton onClick={handleCameraClick}>
            📷 Take Photo
          </CameraButton>
        </ButtonGroup>
        <SupportedFormats>
          Supported formats: JPEG, PNG, GIF, WebP (Max 16MB)
        </SupportedFormats>
      </DropZone>
    </UploadContainer>
  );
};

export default ImageUploader;
