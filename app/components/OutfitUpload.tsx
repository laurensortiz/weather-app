import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  border: `2px dashed ${theme.palette.divider}`,
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: 300,
  objectFit: 'contain',
  marginTop: 16,
});

interface OutfitUploadProps {
  onImageUpload: (file: File) => void;
  currentImage?: string;
}

export const OutfitUpload: React.FC<OutfitUploadProps> = ({
  onImageUpload,
  currentImage,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  return (
    <Box>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="outfit-upload"
        onChange={handleFileSelect}
      />
      <label htmlFor="outfit-upload">
        <UploadBox
          elevation={0}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            borderColor: dragActive ? 'primary.main' : 'divider',
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography variant="h6" gutterBottom>
            Upload Your Outfit
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag and drop an image or click to select
          </Typography>
          <Button
            variant="contained"
            component="span"
            sx={{ mt: 2 }}
          >
            Select Image
          </Button>
        </UploadBox>
      </label>
      {currentImage && (
        <PreviewImage
          src={currentImage}
          alt="Outfit preview"
        />
      )}
    </Box>
  );
}; 