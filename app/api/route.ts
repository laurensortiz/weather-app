import { NextResponse } from 'next/server';
import axios from 'axios';
import { Pool } from 'pg';
import OpenAI from 'openai';
import { verifyToken } from './auth/auth';

// API key should be stored in environment variables
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Database connection configuration
const databasePool = new Pool({
  user: process.env.DB_USER || 'weather_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'weather_app',
  password: process.env.DB_PASSWORD || 'w34th3r',
  port: parseInt(process.env.DB_PORT || '5432'),
});

interface WeatherRecommendation {
  date: string;
  timeOfDay: string;
  temperature: number;
  description: string;
  location: string;
  clothing: string[];
  notes?: string;
  recommendation?: string;
  purchaseLink?: string;
  weatherImage?: string;
}

// Function to interpret location description
async function interpretLocationDescription(description: string): Promise<string> {
  try {
    // Specific hard-coded mappings for common descriptions
    const knownDescriptions: Record<string, string> = {
      "often world champs and home of the school that's better than yale": "Cambridge, US",
      "home of the school that's better than yale": "Cambridge, US",
      "home of the red sox": "Boston, US",
      "city of lights": "Paris, France",
      "city of lights and love": "Paris, France",
      "big apple": "New York, US",
      "windy city": "Chicago, US",
      "city by the bay": "San Francisco, US",
      "emerald city": "Seattle, US"
    };
    
    // Check if the description (or a normalized version) matches any known patterns
    const normalizedDescription = description.toLowerCase().trim();
    for (const [key, value] of Object.entries(knownDescriptions)) {
      if (normalizedDescription.includes(key.toLowerCase())) {
        console.log(`Matched known description pattern: "${description}" → "${value}"`);
        return value;
      }
    }
    
    // Using OpenAI to interpret the location description
    console.log(`Using AI to interpret location: "${description}"`);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a location recognition assistant. Extract the most likely city and country name from the given description. Respond with ONLY the city name followed by a comma and the country/state. For example: 'New York, USA' or 'Paris, France'. If you can't determine a location, respond with 'Unknown location'." 
        },
        { 
          role: "user", 
          content: `Identify the location described by: "${description}"` 
        }
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    // Extract the location from the AI response
    const locationText = response.choices[0]?.message?.content?.trim() || 'Unknown location';
    
    // Check if we got a valid location
    if (locationText === 'Unknown location') {
      throw new Error('Could not determine location from description');
    }

    console.log(`AI interpreted location: "${description}" → "${locationText}"`);
    return locationText;
  } catch (error) {
    console.error('Error interpreting location description:', error);
    throw error;
  }
}

function getTimeOfDay(datetime: string): string {
  const hour = new Date(datetime).getHours();
  
  if (hour >= 5 && hour <= 8) return "Early Morning";
  if (hour >= 9 && hour <= 11) return "Morning";
  if (hour >= 12 && hour <= 14) return "Early Afternoon";
  if (hour >= 15 && hour <= 17) return "Late Afternoon";
  if (hour >= 18 && hour <= 20) return "Evening";
  return "Night";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 });
  }

  try {
    // Check if location is in coordinate format (lat:XX.XXXX,lon:YY.YYYY)
    const coordsMatch = location.match(/lat:(-?\d+\.\d+),lon:(-?\d+\.\d+)/i);
    
    if (coordsMatch) {
      // Extract latitude and longitude
      const lat = parseFloat(coordsMatch[1]);
      const lon = parseFloat(coordsMatch[2]);
      console.log(`Using coordinates directly: lat=${lat}, lon=${lon}`);
      
      // Get weather by coordinates
      const recommendations = await getWeatherRecommendationsByCoords(request, lat, lon, startDate, endDate);
      return NextResponse.json({ recommendations });
    } else {
      // Determine if the location needs interpretation
      let locationToUse = location;
      
      // If the location looks like a description rather than a city name
      if (!location.includes(',') && location.includes(' ') && location.length > 10) {
        try {
          locationToUse = await interpretLocationDescription(location);
        } catch (interpretError) {
          console.warn('Failed to interpret location, trying original input:', interpretError);
          // Continue with original input as fallback
        }
      }
      
      const recommendations = await getWeatherRecommendations(request, locationToUse, startDate, endDate);
      return NextResponse.json({ recommendations });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}

async function getWeatherRecommendations(request: Request, userLocation: string, startDate: string | null, endDate: string | null): Promise<WeatherRecommendation[]> {
  try {
    try {
      const weatherApiResponse = await axios.get(OPENWEATHER_BASE_URL, {
        params: {
          q: userLocation,
          appid: OPENWEATHER_API_KEY,
          units: 'metric',
        },
      });

      const weatherForecastData = weatherApiResponse.data;
      
      let clothingRecommendations = await Promise.all(weatherForecastData.list.map(async (dailyForecast: any) => {
        const temperatureCelsius = dailyForecast.main.temp;
        const weatherDescription = dailyForecast.weather[0].description;
        let clothingRecommendation = 'Wear something comfortable';

        if (temperatureCelsius < 10) {
          clothingRecommendation = 'Wear a heavy coat, it will be cold';
        } else if (temperatureCelsius < 15) {
          clothingRecommendation = 'Wear a warm jacket or sweater';
        } else if (temperatureCelsius < 20) {
          clothingRecommendation = 'Wear a light jacket or long sleeves';
        } else if (temperatureCelsius < 25) {
          clothingRecommendation = 'T-shirt with light pants is perfect';
        } else {
          clothingRecommendation = 'T-shirt and shorts, it will be hot!';
        }

        const shoppingLink = await generateShoppingLink(userLocation, clothingRecommendation);
        const weatherImage = await getWeatherImage(weatherDescription, temperatureCelsius);

        return {
          date: dailyForecast.dt_txt,
          timeOfDay: getTimeOfDay(dailyForecast.dt_txt),
          temperature: temperatureCelsius,
          description: weatherDescription,
          location: userLocation,
          clothing: [clothingRecommendation],
          recommendation: clothingRecommendation,
          purchaseLink: shoppingLink,
          weatherImage: weatherImage
        };
      }));

      // Filter recommendations by date range if provided
      if (startDate || endDate) {
        const startDateObj = startDate ? new Date(startDate) : new Date(0);
        const endDateObj = endDate ? new Date(endDate) : new Date(3000, 0, 1);
        
        clothingRecommendations = clothingRecommendations.filter((item: WeatherRecommendation) => {
          const itemDate = new Date(item.date);
          return itemDate >= startDateObj && itemDate <= endDateObj;
        });
      }

      // Save search to database
      try {
        const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const { userId } = verifyToken(token);
        
        const searchResult = await databasePool.query(
          'INSERT INTO searches (user_id, location, recommendations, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [userId, userLocation, JSON.stringify(clothingRecommendations), startDate, endDate]
        );

        // Save individual recommendations
        for (const rec of clothingRecommendations) {
          await databasePool.query(
            'INSERT INTO recommendations (search_id, date, temperature, recommendation_text, purchase_link, weather_image) VALUES ($1, $2, $3, $4, $5, $6)',
            [searchResult.rows[0].id, rec.date, rec.temperature, rec.recommendation, rec.purchaseLink, rec.weatherImage]
          );
        }
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
        // Continue even if database save fails
      }

      return clothingRecommendations;
    } catch (weatherError) {
      // If the weather API request fails, try with a fallback location
      console.error('Weather API error for location:', userLocation, weatherError);
      
      // Extract the first part before any comma as the city name
      const cityName = userLocation.split(',')[0].trim();
      
      // Try with common locations that might match the description
      const commonLocations = [
        "New York, US",
        "London, UK",
        "Paris, France",
        "Boston, US",
        "Cambridge, US",
        "San Francisco, US",
        "Los Angeles, US",
        "Chicago, US",
        "Seattle, US",
        "Toronto, Canada"
      ];
      
      // Find a matching fallback or use the first one
      let fallbackLocation = commonLocations[0];
      for (const location of commonLocations) {
        if (location.toLowerCase().includes(cityName.toLowerCase())) {
          fallbackLocation = location;
          break;
        }
      }
      
      console.log(`Using fallback location: ${fallbackLocation}`);
      
      // Recursive call with the fallback location
      const recommendations: WeatherRecommendation[] = await getWeatherRecommendations(request, fallbackLocation, startDate, endDate);
      
      // Add note that we're using a fallback location
      return recommendations.map((rec: WeatherRecommendation) => ({
        ...rec,
        location: fallbackLocation,
        recommendation: `${rec.recommendation} (Note: Showing results for ${fallbackLocation} as fallback)`,
      }));
    }
  } catch (error) {
    console.error('Error in weather recommendations processing:', error);
    throw error;
  }
}

async function generateShoppingLink(location: string, clothing: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a shopping assistant. Generate a specific Amazon search URL for the exact clothing items mentioned. 
            Format: https://www.amazon.com/s?k=EXACT+CLOTHING+ITEM
            Example: For "heavy coat" -> https://www.amazon.com/s?k=heavy+coat
            Return ONLY the URL, nothing else.`
        },
        {
          role: "user",
          content: `Generate an Amazon search URL for ${clothing}`
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const url = response.choices[0]?.message?.content?.trim();
    return url || `https://www.amazon.com/s?k=${encodeURIComponent(clothing)}`;
  } catch (error) {
    console.error('Error generating shopping link:', error);
    return `https://www.amazon.com/s?k=${encodeURIComponent(clothing)}`;
  }
}

async function getWeatherRecommendationsByCoords(request: Request, lat: number, lon: number, startDate: string | null, endDate: string | null): Promise<WeatherRecommendation[]> {
  try {
    const weatherApiResponse = await axios.get(OPENWEATHER_BASE_URL, {
      params: {
        lat: lat,
        lon: lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
      },
    });

    const weatherForecastData = weatherApiResponse.data;
    const cityName = weatherForecastData.city?.name || `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
    
    let clothingRecommendations = await Promise.all(weatherForecastData.list.map(async (dailyForecast: any): Promise<WeatherRecommendation> => {
      const temperatureCelsius = dailyForecast.main.temp;
      const weatherDescription = dailyForecast.weather[0].description;
      let clothingRecommendation = 'Wear something comfortable';

      if (temperatureCelsius < 10) {
        clothingRecommendation = 'Wear a heavy coat, it will be cold';
      } else if (temperatureCelsius < 15) {
        clothingRecommendation = 'Wear a warm jacket or sweater';
      } else if (temperatureCelsius < 20) {
        clothingRecommendation = 'Wear a light jacket or long sleeves';
      } else if (temperatureCelsius < 25) {
        clothingRecommendation = 'T-shirt with light pants is perfect';
      } else {
        clothingRecommendation = 'T-shirt and shorts, it will be hot!';
      }

      const shoppingLink = await generateShoppingLink(cityName, clothingRecommendation);
      const weatherImage = await getWeatherImage(weatherDescription, temperatureCelsius);

      return {
        date: dailyForecast.dt_txt,
        timeOfDay: getTimeOfDay(dailyForecast.dt_txt),
        temperature: temperatureCelsius,
        description: weatherDescription,
        location: cityName,
        clothing: [clothingRecommendation],
        recommendation: clothingRecommendation,
        purchaseLink: shoppingLink,
        weatherImage: weatherImage
      };
    }));

    // Filter recommendations by date range if provided
    if (startDate || endDate) {
      const startDateObj = startDate ? new Date(startDate) : new Date(0);
      const endDateObj = endDate ? new Date(endDate) : new Date(3000, 0, 1); // Far future date
      
      clothingRecommendations = clothingRecommendations.filter((item: WeatherRecommendation) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDateObj && itemDate <= endDateObj;
      });
    }

    // Save search to database
    try {
      const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const { userId } = verifyToken(token);
      
      const searchResult = await databasePool.query(
        'INSERT INTO searches (user_id, location, recommendations, start_date, end_date, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [userId, cityName, JSON.stringify(clothingRecommendations), startDate, endDate, lat, lon]
      );

      // Save individual recommendations
      for (const rec of clothingRecommendations) {
        await databasePool.query(
          'INSERT INTO recommendations (search_id, date, temperature, recommendation_text, purchase_link, weather_image) VALUES ($1, $2, $3, $4, $5, $6)',
          [searchResult.rows[0].id, rec.date, rec.temperature, rec.recommendation, rec.purchaseLink, rec.weatherImage]
        );
      }
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // Continue even if database save fails
    }

    return clothingRecommendations;
  } catch (error) {
    console.error('Error in weather recommendations processing by coords:', error);
    throw error;
  }
}

async function getWeatherImage(description: string, temperature: number): Promise<string> {
  try {
    // Mapeo de descripciones de clima a códigos de iconos de OpenWeatherMap
    const weatherIconMap: Record<string, string> = {
      'clear sky': '01',
      'few clouds': '02',
      'scattered clouds': '03',
      'broken clouds': '04',
      'shower rain': '09',
      'rain': '10',
      'thunderstorm': '11',
      'snow': '13',
      'mist': '50'
    };

    // Determinar si es día o noche basado en la temperatura y descripción
    const isDay = temperature > 15 || description.includes('clear') || description.includes('clouds');
    const timeOfDay = isDay ? 'd' : 'n';

    // Encontrar el código de icono más cercano a la descripción
    let iconCode = '01'; // Por defecto, cielo despejado
    for (const [key, value] of Object.entries(weatherIconMap)) {
      if (description.toLowerCase().includes(key)) {
        iconCode = value;
        break;
      }
    }

    // Construir la URL del icono de OpenWeatherMap
    return `https://openweathermap.org/img/wn/${iconCode}${timeOfDay}@2x.png`;
  } catch (error) {
    console.error('Error generating weather image URL:', error);
    return 'https://openweathermap.org/img/wn/01d@2x.png'; // Icono por defecto
  }
} 
