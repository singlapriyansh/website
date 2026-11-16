import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ addresses: [] });
    }

    const rows = db.prepare(`
      SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC
    `).all(session.id) as any[];

    const addresses = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      fullName: r.full_name,
      phone: r.phone,
      street: r.street,
      city: r.city,
      state: r.state,
      postalCode: r.postal_code,
      country: r.country,
      isDefault: Boolean(r.is_default),
      createdAt: r.created_at,
    }));

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Addresses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, street, city, state, postalCode, country = 'India', isDefault = false } = body;

    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return NextResponse.json({ error: 'All address fields are required' }, { status: 400 });
    }

    const id = 'addr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    if (isDefault) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(session.id);
    }

    // If it's the user's first address, make it default automatically
    const countRow = db.prepare('SELECT COUNT(*) as count FROM addresses WHERE user_id = ?').get(session.id) as { count: number };
    const makeDefault = isDefault || countRow.count === 0 ? 1 : 0;

    db.prepare(`
      INSERT INTO addresses (id, user_id, full_name, phone, street, city, state, postal_code, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, session.id, fullName.trim(), phone.trim(), street.trim(), city.trim(), state.trim(), postalCode.trim(), country.trim(), makeDefault);

    return NextResponse.json({
      success: true,
      address: {
        id,
        userId: session.id,
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: Boolean(makeDefault),
      },
    });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(id, session.id);
    return NextResponse.json({ success: true, message: 'Address removed' });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
