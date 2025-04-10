import { NextResponse } from 'next/server';
import { verifyToken } from '../auth';
import { executeSingleQuery } from '../../db/config';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = verifyToken(token);

    const user = await executeSingleQuery<{ id: string; email: string; name: string }>(
      'SELECT id, email, name FROM users WHERE id = $1',
      [userId]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
} 