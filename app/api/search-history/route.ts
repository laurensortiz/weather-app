import { NextResponse } from 'next/server';
import { executeQuery } from '../db/config';
import { verifyToken } from '../auth/auth';

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { userId } = verifyToken(token);

    // Obtener historial de búsquedas
    const searchHistory = await executeQuery(
      `SELECT 
        s.id,
        s.location,
        s.start_date,
        s.end_date,
        s.created_at,
        (
          SELECT json_agg(json_build_object(
            'date', r.date,
            'temperature', r.temperature,
            'recommendation_text', r.recommendation_text,
            'weather_image', r.weather_image
          ))
          FROM recommendations r
          WHERE r.search_id = s.id
        ) as recommendations
      FROM searches s
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
      LIMIT 10`,
      [userId]
    );

    return NextResponse.json({ searchHistory });
  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 });
  }
} 