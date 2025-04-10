import { useState, useRef } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  label?: string;
  disabled?: boolean;
}

export default function ImageUpload({ onUpload, label = 'Upload Image', disabled = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
        border: '2px dashed #ccc',
        borderRadius: 2,
        backgroundColor: '#fafafa',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
      }}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
      
      <Typography variant="body1" color="text.secondary" align="center">
        {isUploading ? 'Uploading...' : label}
      </Typography>
      
      {isUploading && (
        <CircularProgress size={24} />
      )}
      
      <Button
        variant="contained"
        component="span"
        disabled={disabled || isUploading}
        onClick={(e) => e.stopPropagation()}
      >
        Select File
      </Button>
    </Box>
  );
} 