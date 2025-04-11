import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RecommendationCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const GridContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
  width: '100%',
});

interface ClothingItem {
  category: string;
  items: string[];
}

interface Recommendation {
  datetime: string;
  temperature: number;
  recommendations: string[];
}

interface ClothingRecommendationsProps {
  recommendations: Recommendation[];
}

export const ClothingRecommendations: React.FC<ClothingRecommendationsProps> = ({
  recommendations,
}) => {
  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      hour12: true,
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Clothing Recommendations
      </Typography>
      <GridContainer>
        {recommendations.map((recommendation, index) => (
          <div key={index}>
            <RecommendationCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {formatDate(recommendation.datetime)}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {Math.round(recommendation.temperature)}°C
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {recommendation.recommendations.map((item, idx) => (
                    <Chip
                      key={idx}
                      label={item}
                      color="primary"
                      variant="outlined"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </RecommendationCard>
          </div>
        ))}
      </GridContainer>
    </Box>
  );
}; 