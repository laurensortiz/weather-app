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

const HistoryItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

interface Recommendation {
  id: string;
  location: string;
  date: string;
  temperature: number;
  weatherDescription: string;
  recommendations: string[];
}

interface RecommendationHistoryProps {
  recommendations: Recommendation[];
  onSelectRecommendation: (recommendation: Recommendation) => void;
}

export const RecommendationHistory: React.FC<RecommendationHistoryProps> = ({
  recommendations,
  onSelectRecommendation,
}) => {
  if (recommendations.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No previous recommendations
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {recommendations.map((recommendation, index) => (
        <React.Fragment key={recommendation.id}>
          <div
            onClick={() => onSelectRecommendation(recommendation)}
            style={{ cursor: 'pointer' }}
          >
            <HistoryItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {recommendation.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(recommendation.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Temperature: {recommendation.temperature}°C
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {recommendation.weatherDescription}
                    </Typography>
                  </Box>
                }
              />
            </HistoryItem>
          </div>
          {index < recommendations.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}; 