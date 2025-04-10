import React from 'react';
import { Card, CardContent, Typography, Box, Button, Grid, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

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

interface RecommendationCardProps {
  date: string;
  temperature: number;
  recommendation: string;
  imageUrl?: string;
  purchaseLink?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  date,
  temperature,
  recommendation,
  imageUrl,
  purchaseLink,
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeOfDay = new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <LazyLoadComponent>
      <StyledCard>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={imageUrl ? 8 : 12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  {formattedDate}
                  <TemperatureChip
                    label={`${temperature.toFixed(1)}°C`}
                    size="small"
                  />
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {timeOfDay}
                </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {recommendation}
              </Typography>
              {purchaseLink && (
                <Button
                  variant="contained"
                  color="primary"
                  href={purchaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 2 }}
                >
                  Shop this look
                </Button>
              )}
            </Grid>
            {imageUrl && (
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 200,
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt="Outfit recommendation"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </StyledCard>
    </LazyLoadComponent>
  );
}; 