"use client";

import { useState, useEffect, useRef } from 'react';
import { TextField, Button, Container, Typography, Card, CardContent, List, ListItem, ListItemText, CircularProgress, Grid, Box, Tooltip, IconButton, Alert, FormControlLabel, Checkbox, Skeleton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { getWeatherRecommendations, WeatherRecommendation } from './api/weather';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import WaterIcon from '@mui/icons-material/Water';
import CloudIcon from '@mui/icons-material/Cloud';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import React from 'react';

// Helper function to convert Celsius to Fahrenheit
const celsiusToFahrenheit = (celsius?: number): number | undefined => {
  if (celsius === undefined) return undefined;
  return (celsius * 9/5) + 32;
};

// Helper function to determine time of day based on the datetime string
const getTimeOfDay = (dateTimeString: string): string => {
  const hour = new Date(dateTimeString).getHours();
  
  if (hour >= 5 && hour < 9) {
    return "Early Morning";
  } else if (hour >= 9 && hour < 12) {
    return "Morning";
  } else if (hour >= 12 && hour < 15) {
    return "Early Afternoon";
  } else if (hour >= 15 && hour < 18) {
    return "Late Afternoon";
  } else if (hour >= 18 && hour < 21) {
    return "Evening";
  } else {
    return "Night";
  }
};

// Helper function to get the appropriate icon based on temperature
const getTemperatureIcon = (temperature?: number) => {
  if (!temperature) return <CloudIcon />;
  
  if (temperature < 5) return <AcUnitIcon color="primary" />;
  if (temperature < 15) return <AcUnitIcon color="info" />;
  if (temperature < 20) return <CloudIcon color="action" />;
  if (temperature < 25) return <WbSunnyIcon color="warning" />;
  return <WbSunnyIcon color="error" />;
};

// Helper function to get text description based on temperature
const getTemperatureDescription = (temperature?: number) => {
  if (!temperature) return "Unknown";
  
  if (temperature < 5) return "Very Cold";
  if (temperature < 15) return "Cold";
  if (temperature < 20) return "Mild";
  if (temperature < 25) return "Warm";
  return "Hot";
};

// Types
interface UserCoordinates {
  lat: number;
  lon: number;
}

export default function Home() {
  const [location, setLocation] = useState('');
  const [recommendations, setRecommendations] = useState<WeatherRecommendation[]>([]);
  const [displayedRecommendations, setDisplayedRecommendations] = useState<WeatherRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));
  const [interpretedLocation, setInterpretedLocation] = useState<string | null>(null);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number, lon: number } | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5; // Number of items to load each time
  
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  
  // Store geoPosition in a ref for direct access to avoid state timing issues
  const geoPosition = useRef<GeolocationPosition | null>(null);
  
  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && recommendations.length > displayedRecommendations.length && !isLoadingMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [displayedRecommendations, recommendations, isLoadingMore]);
  
  // Function to load more items
  const loadMoreItems = () => {
    if (recommendations.length <= displayedRecommendations.length) return;
    
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const nextPage = page + 1;
      const newItems = recommendations.slice(0, nextPage * itemsPerPage);
      
      setDisplayedRecommendations(newItems);
      setPage(nextPage);
      setIsLoadingMore(false);
    }, 500); // Small delay for better UX
  };
  
  // Reset pagination when new recommendations are loaded
  useEffect(() => {
    if (recommendations.length > 0) {
      const initialItems = recommendations.slice(0, itemsPerPage);
      setDisplayedRecommendations(initialItems);
      setPage(1);
    } else {
      setDisplayedRecommendations([]);
    }
  }, [recommendations]);

  // Function to get user's location
  const getUserLocation = async (): Promise<boolean> => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return false;
    }
    
    try {
      // Try to get current position
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Make position available in the outer scope
            geoPosition.current = position;
            
            // Store coordinates for later use
            setUserCoordinates({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            
            resolve(true);
          },
          (err) => {
            console.error('Error getting location:', err);
            setError(`Could not get your location: ${err.message}`);
            resolve(false);
          },
          { timeout: 10000 }
        );
      });
    } catch (err) {
      console.error('Error in getUserLocation:', err);
      setError('An unexpected error occurred while trying to get your location');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setRecommendations([]);

    // Validate inputs
    if (!useMyLocation && !location.trim()) {
      setError('Please enter a location or use your current location.');
      setIsLoading(false);
      return;
    }
    
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      setIsLoading(false);
      return;
    }

    if (endDate.isBefore(startDate)) {
      setError('End date must be after start date');
      setIsLoading(false);
      return;
    }

    try {
      // If using location is checked, get coordinates first
      let currentCoordinates = userCoordinates;
      if (useMyLocation && (!currentCoordinates || !geoPosition.current)) {
        const gotCoordinates = await getUserLocation();
        
        // If we still don't have coordinates after trying, stop
        if (!gotCoordinates) {
          setIsLoading(false);
          return;
        }
        
        // Get coordinates directly from ref if available
        if (geoPosition.current) {
          currentCoordinates = {
            lat: geoPosition.current.coords.latitude,
            lon: geoPosition.current.coords.longitude
          };
        } else {
          // Fall back to state if needed
          currentCoordinates = userCoordinates;
        }
      }

      // Determine what to use as location parameter
      let locationParam = location;
      
      // If "Use my location" is checked and we have coordinates, use them
      if (useMyLocation && currentCoordinates) {
        locationParam = `lat:${currentCoordinates.lat.toFixed(4)},lon:${currentCoordinates.lon.toFixed(4)}`;
      }
      
      console.log('Using location parameter:', locationParam);
      
      setIsInitialLoading(true);
      setInterpretedLocation(null);
      
      const recommendations = await getWeatherRecommendations(
        locationParam,
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );
      
      // Clear previous recommendations first
      setRecommendations([]);
      
      // If the response includes an interpreted location, update the state
      if (recommendations.length > 0 && recommendations[0]?.location) {
        setInterpretedLocation(recommendations[0].location);
      }
      
      setRecommendations(recommendations);
    } catch (error) {
      setError((error as Error).message || 'Failed to fetch weather recommendations');
      console.error('Error fetching weather recommendations:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 800); // Add a slight delay for better UX
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem', paddingBottom: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Weather Outfit Recommender
      </Typography>
      
      <Card elevation={3} style={{ marginBottom: '2rem', padding: '1rem' }}>
        <CardContent>
          <form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', width: '100%', mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Where are you located?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You can enter a specific city name or describe your location creatively.
              </Typography>
              <TextField
                id="location-input"
                label="Enter your location"
                variant="outlined"
                fullWidth
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., 'New York City' or 'home of the school that's better than yale'"
                helperText="Be as creative as you want! Our AI will figure it out."
                disabled={useMyLocation}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useMyLocation}
                    onChange={(e) => setUseMyLocation(e.target.checked)}
                    color="primary"
                  />
                }
                label="Use my current location"
                sx={{ mt: 1 }}
              />
              {useMyLocation && userCoordinates && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Using your current location
                  {interpretedLocation ? ` (${interpretedLocation})` : ''}
                </Typography>
              )}
            </Box>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                    minDate={startDate || undefined}
                  />
                </Box>
              </Box>
            </LocalizationProvider>
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              disabled={isLoading || (!location.trim() && !useMyLocation)}
              style={{ marginTop: '1rem' }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Get Recommendations'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {useMyLocation && userCoordinates && !error && (
        <Card elevation={1} sx={{ mb: 2, mt: 1, p: 1, bgcolor: 'success.light' }}>
          <Typography variant="body2" sx={{ color: 'white' }}>
            Successfully detected your location coordinates. Click "Get Recommendations" to see your forecast.
          </Typography>
        </Card>
      )}
      
      {error && (
        <Typography color="error" variant="body1" style={{ marginBottom: '1rem' }}>
          {error}
        </Typography>
      )}
      
      {interpretedLocation && !useMyLocation && (
        <Box sx={{ mb: 2, mt: -1 }}>
          <Typography variant="body2" color="text.secondary">
            We interpreted your location as: <strong>{interpretedLocation}</strong>
          </Typography>
        </Box>
      )}
      
      {recommendations.length > 0 && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Outfit Recommendations for {interpretedLocation || location}
            </Typography>
            {interpretedLocation && interpretedLocation.includes('fallback') && (
              <Alert severity="info" sx={{ my: 1 }}>
                We couldn't find the exact location you described, so we're showing recommendations for a similar location.
              </Alert>
            )}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                From {startDate?.format('MMM D, YYYY')} to {endDate?.format('MMM D, YYYY')}
              </Typography>
            </Box>
            <List>
              {isInitialLoading ? (
                // Show skeletons while initial loading
                Array.from(new Array(7)).map((_, index) => (
                  <Box key={index} sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                      <Skeleton variant="text" width="60%" height={24} />
                      <Box sx={{ ml: 'auto' }}>
                        <Skeleton variant="text" width={80} height={20} />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="90%" height={20} sx={{ ml: 7 }} />
                  </Box>
                ))
              ) : (
                // Show actual recommendations with lazy loading
                displayedRecommendations.map((recommendationItem, index) => (
                  <LazyLoadComponent
                    key={index}
                    placeholder={
                      <Box sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                          <Skeleton variant="text" width="60%" height={24} />
                          <Box sx={{ ml: 'auto' }}>
                            <Skeleton variant="text" width={80} height={20} />
                          </Box>
                        </Box>
                        <Skeleton variant="text" width="90%" height={20} sx={{ ml: 7 }} />
                      </Box>
                    }
                    visibleByDefault={index < 3} // Always show the first 3 items immediately
                  >
                    <ListItem 
                      divider={index < recommendations.length - 1}
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        py: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', bgcolor: 'background.paper', boxShadow: 1 }}>
                          {getTemperatureIcon(recommendationItem.temperature)}
                        </Box>
                        <Typography variant="subtitle1">
                          {new Date(recommendationItem.date).toLocaleDateString()} {new Date(recommendationItem.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {getTimeOfDay(recommendationItem.date)} - {
                            recommendationItem.temperature 
                              ? `${recommendationItem.temperature.toFixed(1)}°C / ${celsiusToFahrenheit(recommendationItem.temperature)?.toFixed(1)}°F` 
                              : ''
                          }
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                          <Tooltip title={getTemperatureDescription(recommendationItem.temperature)}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1 }}>
                              {getTemperatureDescription(recommendationItem.temperature)}
                            </Typography>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Typography variant="body1" sx={{ pl: 7 }}>
                        {recommendationItem.recommendation}
                      </Typography>
                    </ListItem>
                  </LazyLoadComponent>
                ))
              )}
            </List>
            {recommendations.length > displayedRecommendations.length && (
              <div ref={loadMoreRef} style={{ textAlign: 'center', padding: '1rem' }}>
                {isLoadingMore ? (
                  <CircularProgress size={30} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Scroll for more recommendations...
                  </Typography>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {recommendations.length === 0 && !isLoading && !error && (
        <Card elevation={3} sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              How to Use This App
            </Typography>
            <Typography variant="body2" paragraph>
              Enter your location above - you can be creative with your description!
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Examples of creative location descriptions:</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Home of the school that's better than yale" secondary="Our AI will interpret this as 'Cambridge, MA'" />
              </ListItem>
              <ListItem>
                <ListItemText primary="City of lights and love" secondary="Our AI will interpret this as 'Paris, France'" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Home of the Red Sox" secondary="Our AI will interpret this as 'Boston, MA'" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
