import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Collapse, Paper } from '@mui/material';
import { History as HistoryIcon, ExpandMore, ExpandLess } from '@mui/icons-material';
import dayjs from 'dayjs';

interface SearchHistoryItem {
  id: number;
  location: string;
  start_date: string;
  end_date: string;
  created_at: string;
  recommendations: Array<{
    date: string;
    temperature: number;
    recommendation_text: string;
    weather_image: string;
  }>;
}

interface SearchHistoryProps {
  onSelectHistory: (recommendations: any[]) => void;
}

export default function SearchHistory({ onSelectHistory }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/search-history');
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data.searchHistory);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  const handleExpandClick = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <Box sx={{ 
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 1000,
      maxWidth: '400px',
      width: '100%'
    }}>
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        <HistoryIcon />
      </IconButton>

      <Collapse in={isOpen}>
        <Paper sx={{
          mt: 2,
          mb: 7,
          p: 2,
          maxHeight: '500px',
          overflowY: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
          borderRadius: '16px',
        }}>
          <Typography variant="h6" gutterBottom>
            Search History
          </Typography>
          
          {history.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No previous searches
            </Typography>
          ) : (
            history.map((item) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {item.location}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(item.created_at).format('MMM D, YYYY HH:mm')}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => handleExpandClick(item.id)}
                    sx={{
                      transform: expanded === item.id ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s',
                    }}
                  >
                    {expanded === item.id ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                <Collapse in={expanded === item.id}>
                  <Box sx={{ mt: 2 }}>
                    {item.recommendations?.map((rec, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 1,
                          p: 1,
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundImage: `url(${rec.weather_image})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }}
                        />
                        <Box>
                          <Typography variant="body2">
                            {dayjs(rec.date).format('MMM D, HH:mm')} - {rec.temperature}°C
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rec.recommendation_text}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    <Box sx={{ 
                      mt: 2, 
                      display: 'flex', 
                      justifyContent: 'flex-end' 
                    }}>
                      <IconButton
                        onClick={() => onSelectHistory(item.recommendations)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Collapse>
              </Paper>
            ))
          )}
        </Paper>
      </Collapse>
    </Box>
  );
} 