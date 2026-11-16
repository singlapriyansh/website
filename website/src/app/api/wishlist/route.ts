import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { formatProduct } from '@/lib/formatProduct';

export const dynamic = 'force-dynamic';

function getUserId(req: NextRequest, sessionUser: { id: string } | null): string {
  if (sessionUser) return sessionUser.id;
  const guestHeader = req.headers.get('x-guest-id');
  return guestHeader || 'guest_default';
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    const userId = getUserId(req, session);

    const rows = db.prepare(`
      SELECT 
        wi.id as wishlist_item_id,
        wi.user_id,
        wi.product_id,
        wi.created_at as wishlist_item_created_at,
        p.*,
        c.name as category_name
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE wi.user_id = ?
      ORDER BY wi.created_at DESC
    `).all(userId) as any[];

    const items = rows.map((r) => ({
      id: r.wishlist_item_id,
      userId: r.user_id,
      productId: r.product_id,
      createdAt: r.wishlist_item_created_at,
      product: formatProduct(r),
    }));

    return NextResponse.json({ items, count: items.length });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    const userId = getUserId(req, session);
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?').get(userId, productId) as { id: string } | undefined;

    if (existing) {
      db.prepare('DELETE FROM wishlist_items WHERE id = ?').run(existing.id);
      return NextResponse.json({ success: true, inWishlist: false, message: 'Removed from wishlist' });
    } else {
      const id = 'wish_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      db.prepare('INSERT INTO wishlist_items (id, user_id, product_id) VALUES (?, ?, ?)').run(id, userId, productId);
      return NextResponse.json({ success: true, inWishlist: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ error: 'Failed to toggle wishlist' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    const userId = getUserId(req, session);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const id = searchParams.get('id');

    if (productId) {
      db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
    } else if (id) {
      db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND id = ?').run(userId, id);
    }

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
