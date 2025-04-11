import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, List, ListItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { format } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const TemperatureChip = styled(Chip)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const GridContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
  width: '100%',
});

const GridItem = styled('div')(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '66.666667%',
  },
}));

const ImageGridItem = styled('div')(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '33.333333%',
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

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {recommendation.location}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {format(new Date(recommendation.date), 'PPP')}
        </Typography>
        <Typography variant="h5" gutterBottom>
          {recommendation.temperature.toFixed(1)}°C
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {recommendation.weatherDescription}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Recommendations:
        </Typography>
        <List>
          {recommendation.recommendations.map((rec, index) => (
            <ListItem key={index}>
              <Typography>{rec}</Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}; 