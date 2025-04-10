import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const EmptyPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export const EmptyState: React.FC = () => {
  return (
    <EmptyPaper>
      <Typography variant="body1">
        No recommendations available. Please enter a location and date to get started.
      </Typography>
    </EmptyPaper>
  );
}; 