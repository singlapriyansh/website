import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'Account with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = 'u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, phone, avatar)
      VALUES (?, ?, ?, ?, 'customer', ?, ?)
    `).run(
      userId,
      name.trim(),
      cleanEmail,
      passwordHash,
      phone?.trim() || null,
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`
    );

    const token = signToken({
      id: userId,
      email: cleanEmail,
      role: 'customer',
      name: name.trim(),
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: 'customer',
        phone: phone?.trim() || null,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
