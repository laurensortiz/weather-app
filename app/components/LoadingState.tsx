import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const LoadingPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
}));

export const LoadingState: React.FC = () => {
  return (
    <LoadingPaper>
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Loading recommendations...
      </Typography>
    </LoadingPaper>
  );
}; 