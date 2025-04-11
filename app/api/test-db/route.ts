import { NextResponse } from 'next/server';
import { executeQuery } from '../db/config';

export async function GET() {
  try {
    const result = await executeQuery('SELECT NOW() as time');
    return NextResponse.json({ 
      success: true, 
      time: result[0].time,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 