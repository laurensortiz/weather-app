import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
      <Grid container spacing={2}>
        {recommendations.map((recommendation, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 