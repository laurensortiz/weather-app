import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const RecommendationPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const TimeChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

interface ClothingRecommendationProps {
  date: string;
  timeOfDay: string;
  temperature: number;
  description: string;
  recommendations: string[];
}

export const ClothingRecommendation: React.FC<ClothingRecommendationProps> = ({
  date,
  timeOfDay,
  temperature,
  description,
  recommendations,
}) => {
  return (
    <RecommendationPaper elevation={2}>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {date}
        </Typography>
        <TimeChip label={timeOfDay} color="primary" />
        <Chip label={`${temperature}°C`} color="secondary" />
      </Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        {description}
      </Typography>
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Recommended Clothing:
        </Typography>
        <ul>
          {recommendations.map((item, index) => (
            <li key={index}>
              <Typography variant="body2">{item}</Typography>
            </li>
          ))}
        </ul>
      </Box>
    </RecommendationPaper>
  );
}; 