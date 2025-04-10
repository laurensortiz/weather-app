import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const WeatherCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

interface WeatherData {
  datetime: string;
  temperature: number;
  weatherDescription: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherForecastProps {
  forecast: WeatherData[];
}

export const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast }) => {
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
        Weather Forecast
      </Typography>
      <Grid container spacing={2}>
        {forecast.map((weather, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <WeatherCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {formatDate(weather.datetime)}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {Math.round(weather.temperature)}°C
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {weather.weatherDescription}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Humidity: {weather.humidity}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wind: {weather.windSpeed} km/h
                </Typography>
              </CardContent>
            </WeatherCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 