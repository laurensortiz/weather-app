import { NextResponse } from 'next/server';
import { registerUser } from '../auth';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    const user = await registerUser(email, password, name);
    
    return NextResponse.json({ userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
} 