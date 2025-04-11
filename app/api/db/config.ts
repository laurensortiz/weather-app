import { Pool, QueryResult, QueryResultRow } from 'pg';

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT,
    key: process.env.DB_CLIENT_KEY,
    cert: process.env.DB_CLIENT_CERT
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const databasePool = new Pool(poolConfig);

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