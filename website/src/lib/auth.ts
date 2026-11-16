import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'shopsphere-super-secure-production-ready-jwt-key-2026';
const TOKEN_NAME = 'shopsphere_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: Pick<User, 'id' | 'email' | 'role' | 'name'>): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { id: string; email: string; role: 'customer' | 'admin'; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'customer' | 'admin'; name: string };
  } catch {
    return null;
  }
}

export async function getCurrentUserFromCookie(): Promise<{ id: string; email: string; role: 'customer' | 'admin'; name: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = TOKEN_NAME;
