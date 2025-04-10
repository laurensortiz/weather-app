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
          <ListItem
            button
            onClick={() => onSelectRecommendation(recommendation)}
            component={HistoryItem}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">
                    {recommendation.location}
                  </Typography>
                  <Chip
                    label={`${recommendation.temperature}°C`}
                    size="small"
                    color="primary"
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(recommendation.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recommendation.weatherDescription}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {recommendation.recommendations.slice(0, 2).map((rec, i) => (
                      <Chip
                        key={i}
                        label={rec}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                    {recommendation.recommendations.length > 2 && (
                      <Chip
                        label={`+${recommendation.recommendations.length - 2} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </>
              }
            />
          </ListItem>
          {index < recommendations.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}; 