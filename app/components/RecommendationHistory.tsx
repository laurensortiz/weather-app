import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { RecommendationCard } from './RecommendationCard';

const HistoryItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

interface Recommendation {
  id: number;
  location: string;
  date: Date;
  temperature: number;
  weatherDescription: string;
  recommendations: string[];
}

interface RecommendationHistoryProps {
  recommendations: Recommendation[];
}

export const RecommendationHistory = ({ recommendations }: RecommendationHistoryProps) => {
  if (recommendations.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No recommendations yet</Typography>
      </Box>
    );
  }

  return (
    <List>
      {recommendations.map((recommendation) => (
        <ListItem key={recommendation.id} disablePadding>
          <RecommendationCard recommendation={recommendation} />
        </ListItem>
      ))}
    </List>
  );
}; 