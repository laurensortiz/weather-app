import { Pool, QueryResult, QueryResultRow } from 'pg';

export const databasePool = new Pool({
  user: process.env.DB_USER || 'weather_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'weather_app',
  password: process.env.DB_PASSWORD || 'w34th3r',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to be established
});

// Define tipos para los resultados de consultas comunes
export interface UserRecord {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: Date;
}

export interface SearchRecord {
  id: number;
  user_id: string;
  location: string;
  start_date: Date;
  end_date: Date;
  latitude: number | null;
  longitude: number | null;
  recommendations: RecommendationRecord[];
  created_at: Date;
}

export interface RecommendationRecord {
  id: number;
  search_id: number;
  temperature: number;
  description: string;
  time_of_day: string;
  clothing_recommendations: string[];
  created_at: Date;
}

export interface UserOutfitRecord {
  id: number;
  user_id: number | null;
  image_url: string;
  date: Date;
  created_at: Date;
}

// Helper function to execute queries with proper typing
export async function executeQuery<T extends QueryResultRow>(query: string, params: any[] = []): Promise<T[]> {
  const client = await databasePool.connect();
  try {
    const result: QueryResult<T> = await client.query<T>(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Helper function to execute a single query with proper typing
export async function executeSingleQuery<T extends QueryResultRow>(query: string, params: any[] = []): Promise<T | null> {
  const results = await executeQuery<T>(query, params);
  return results[0] || null;
} 