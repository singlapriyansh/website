import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(cleanEmail);

    if (existing) {
      return NextResponse.json({ success: true, message: 'You are already subscribed to our newsletter!' });
    }

    const id = 'sub_' + Date.now();
    db.prepare('INSERT INTO newsletter_subscribers (id, email) VALUES (?, ?)').run(id, cleanEmail);

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! Use coupon WELCOME10 on your first order.',
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
