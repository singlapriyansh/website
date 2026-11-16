import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = db.prepare('SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?').get(session.id) as {
      id: string;
      name: string;
      email: string;
      role: 'customer' | 'admin';
      phone?: string;
      avatar?: string;
      created_at: string;
    } | undefined;

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null });
  }
}
