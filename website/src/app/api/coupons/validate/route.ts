import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = db.prepare(`
      SELECT * FROM coupons 
      WHERE UPPER(code) = UPPER(?) AND is_active = 1
    `).get(code.trim()) as any;

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 400 });
    }

    const amount = Number(orderAmount) || 0;
    if (amount < coupon.min_order_value) {
      return NextResponse.json({
        error: `Coupon requires a minimum order value of ₹${coupon.min_order_value}`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((amount * coupon.discount_value) / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    // Ensure discount does not exceed subtotal
    discount = Math.min(discount, amount);

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount: discount,
      },
    });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
