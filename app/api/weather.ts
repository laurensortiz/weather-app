import axios from 'axios';

// Define interfaces for better type safety
export interface WeatherRecommendation {
  date: string;
  recommendation: string;
  temperature?: number;
  location?: string;
}

// Function to interpret location description using AI
export async function interpretLocationDescription(description: string): Promise<string> {
  try {
    const response = await axios.post('/api/location', { description });
    return response.data.location;
  } catch (error) {
    console.error('Error interpreting location description:', error);
    throw new Error('Could not determine your location from the description. Please try a more specific description or enter a city name directly.');
  }
}

// Client-side function to fetch recommendations from the API route
export async function getWeatherRecommendations(
  userLocation: string,
  startDate?: string,
  endDate?: string
): Promise<WeatherRecommendation[]> {
  try {
    // First, determine if we need to interpret the location
    let locationQuery = userLocation;
    
    // If the location doesn't look like a standard city name format, try to interpret it
    if (!userLocation.includes(',') && userLocation.includes(' ')) {
      try {
        locationQuery = await interpretLocationDescription(userLocation);
        console.log(`Interpreted location: "${userLocation}" → "${locationQuery}"`);
      } catch (interpretError) {
        // If interpretation fails, try with the original input as fallback
        console.warn('Location interpretation failed, using original input:', interpretError);
      }
    }
    
    // Build the API request URL
    let url = `/api?location=${encodeURIComponent(locationQuery)}`;
    
    // Add date parameters if provided
    if (startDate) {
      url += `&startDate=${encodeURIComponent(startDate)}`;
    }
    
    if (endDate) {
      url += `&endDate=${encodeURIComponent(endDate)}`;
    }
    
    const response = await axios.get(url);
    return response.data.recommendations;
  } catch (error) {
    console.error('Error fetching weather recommendations:', error);
    throw new Error('Failed to get weather recommendations. Please try again with a different location description.');
  }
} 