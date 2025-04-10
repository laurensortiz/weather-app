import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const SearchPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

interface SearchFormProps {
  onSearch: (location: string, useMyLocation: boolean) => void;
  isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  isLoading,
}) => {
  const [location, setLocation] = useState('');
  const [useMyLocation, setUseMyLocation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(location, useMyLocation);
  };

  return (
    <SearchPaper elevation={3}>
      <Typography variant="h5" gutterBottom>
        Weather Clothing Recommendations
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={useMyLocation}
            placeholder="Enter city name or coordinates"
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={useMyLocation}
                onChange={(e) => setUseMyLocation(e.target.checked)}
              />
            }
            label="Use my current location"
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoading || (!location.trim() && !useMyLocation)}
        >
          {isLoading ? 'Loading...' : 'Get Recommendations'}
        </Button>
      </form>
    </SearchPaper>
  );
}; 