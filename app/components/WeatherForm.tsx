'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, IconButton, Collapse } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useWeatherRecommendations } from '../hooks/useWeather';
import { RecommendationCard } from './RecommendationCard';
import { SearchHistory } from './SearchHistory';
import HistoryIcon from '@mui/icons-material/History';

export function WeatherForm() {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: recommendations, isLoading, isSuccess, error } = useWeatherRecommendations(
    location,
    startDate?.toISOString().split('T')[0],
    endDate?.toISOString().split('T')[0]
  );

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    setIsFormValid(value.trim() !== '');
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error: {error.message}
            </Typography>
          )}

          {isSuccess && recommendations && recommendations.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recommendations.map((recommendation, index) => (
                <RecommendationCard key={index} recommendation={recommendation} />
              ))}
            </Box>
          )}

          {isSuccess && (!recommendations || recommendations.length === 0) && (
            <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
              No recommendations found for this location and date range.
            </Typography>
          )}
        </Box>
      </Collapse>

      <Collapse in={showHistory}>
        <SearchHistory />
      </Collapse>
    </Box>
  );
}