import { NextResponse } from 'next/server';
import { executeQuery, executeSingleQuery } from '../db/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function registerUser(email: string, password: string, name?: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await executeSingleQuery<{ id: string }>(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
    [email, hashedPassword, name]
  );
  
  if (!user) {
    throw new Error('Failed to create user');
  }
  
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await executeSingleQuery<{ id: string, password_hash: string }>(
    'SELECT id, password_hash FROM users WHERE email = $1',
    [email]
  );
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  
  return { token, userId: user.id };
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function getUserById(userId: string) {
  return executeSingleQuery<{ id: string, email: string, name: string | null, profile_picture_url: string | null }>(
    'SELECT id, email, name, profile_picture_url FROM users WHERE id = $1',
    [userId]
  );
} 