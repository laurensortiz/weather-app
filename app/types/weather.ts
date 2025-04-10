export interface WeatherRecommendation {
  date: string;
  recommendation: string;
  temperature: number;
  location: string;
  imageUrl?: string;
  purchaseLink?: string;
} 