import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface WeatherData {
  location: string;
  date: string;
  temperature: number;
  weatherDescription: string;
  recommendations: string[];
}

export const useWeatherRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getWeatherRecommendations = async (location: string, date: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location, date }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      return data as WeatherData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getWeatherRecommendations,
    loading,
    error,
  };
}; 