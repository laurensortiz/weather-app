'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, IconButton, Collapse } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useWeatherRecommendations } from '../hooks/useWeather';
import { RecommendationCard } from './RecommendationCard';
import SearchHistory from './SearchHistory';
import HistoryIcon from '@mui/icons-material/History';

interface WeatherFormProps {
  onWeatherData: (data: any) => void;
}

export function WeatherForm({ onWeatherData }: WeatherFormProps) {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { getWeatherRecommendations, loading, error } = useWeatherRecommendations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !date) return;

    const weatherData = await getWeatherRecommendations(location, date.toISOString());
    if (weatherData) {
      onWeatherData(weatherData);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Get Weather Recommendations
        </Typography>
        <IconButton 
          onClick={() => setShowHistory(!showHistory)}
          sx={{ 
            backgroundColor: showHistory ? 'primary.main' : 'transparent',
            color: showHistory ? 'white' : 'primary.main',
            '&:hover': {
              backgroundColor: showHistory ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          <HistoryIcon />
        </IconButton>
      </Box>

      <Collapse in={!showHistory}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Location"
            value={location}
            onChange={handleLocationChange}
            fullWidth
            required
          />
          <LocalizationProvider dateAdapter={AdapterDateFns as any}>
            <DatePicker
              label="Date"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error: {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" onClick={handleSubmit}>
            Get Recommendations
          </Button>
        </Box>
      </Collapse>

      <Collapse in={showHistory}>
        <SearchHistory onSelectHistory={(recommendations) => {
          if (recommendations.length > 0) {
            const lastRecommendation = recommendations[0];
            setLocation(lastRecommendation.location);
            setDate(new Date(lastRecommendation.date));
            setShowHistory(false);
          }
        }} />
      </Collapse>
    </Box>
  );
}