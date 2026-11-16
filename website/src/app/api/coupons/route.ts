import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM coupons ORDER BY is_active DESC, discount_value DESC').all();
    return NextResponse.json({ coupons: rows });
  } catch (error) {
    console.error('Coupons GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { code, discountType, discountValue, minOrderValue, maxDiscount, isActive = 1, expiresAt } = await req.json();

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Missing required coupon fields' }, { status: 400 });
    }

    const id = 'cpn_' + Date.now();
    db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, max_discount, is_active, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      code.toUpperCase().trim(),
      discountType,
      Number(discountValue),
      Number(minOrderValue) || 0,
      maxDiscount ? Number(maxDiscount) : null,
      isActive ? 1 : 0,
      expiresAt || '2027-12-31'
    );

    return NextResponse.json({ success: true, message: 'Coupon created successfully' });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
