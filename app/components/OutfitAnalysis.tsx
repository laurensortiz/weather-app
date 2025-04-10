import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const AnalysisPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

interface OutfitAnalysisProps {
  imageUrl: string;
  temperature: number;
  weatherDescription: string;
}

export const OutfitAnalysis: React.FC<OutfitAnalysisProps> = ({
  imageUrl,
  temperature,
  weatherDescription,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    isAppropriate: boolean;
    feedback: string;
  } | null>(null);

  const analyzeOutfit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analyze-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          temperature,
          weatherDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze outfit');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze outfit. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (imageUrl) {
      analyzeOutfit();
    }
  }, [imageUrl, temperature, weatherDescription]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <AnalysisPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Outfit Analysis
      </Typography>
      <Typography
        variant="body1"
        color={analysis.isAppropriate ? 'success.main' : 'error.main'}
        gutterBottom
      >
        {analysis.isAppropriate ? '✅ Appropriate' : '❌ Not Appropriate'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {analysis.feedback}
      </Typography>
    </AnalysisPaper>
  );
}; 