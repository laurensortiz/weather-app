import React from 'react';
import { Alert, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const ErrorPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onClose,
}) => {
  return (
    <ErrorPaper elevation={3}>
      <Alert severity="error" onClose={onClose}>
        {message}
      </Alert>
    </ErrorPaper>
  );
}; 