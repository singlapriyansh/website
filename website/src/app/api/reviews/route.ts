import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const reviews = db.prepare(`
      SELECT * FROM reviews 
      WHERE product_id = ? 
      ORDER BY created_at DESC
    `).all(productId) as any[];

    // Calculate rating breakdown
    const stats = {
      average: 0,
      total: reviews.length,
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      stats.average = Number((sum / reviews.length).toFixed(1));
    }

    return NextResponse.json({ reviews, stats });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'Please log in to submit a review' }, { status: 401 });
    }

    const { productId, rating, title, comment } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Product, rating, and comment are required' }, { status: 400 });
    }

    const id = 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    // Check if user purchased the product
    const orderCheck = db.prepare(`
      SELECT oi.id FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = ? AND oi.product_id = ?
    `).get(session.id, productId);

    const verified = orderCheck ? 1 : 0;

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, user_name, rating, title, comment, verified_purchase)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, productId, session.id, session.name, Number(rating), title || '', comment, verified);

    // Update product rating and reviews count
    const stats = db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as count 
      FROM reviews WHERE product_id = ?
    `).get(productId) as { avg_rating: number; count: number };

    db.prepare(`
      UPDATE products 
      SET rating = ?, reviews_count = ?
      WHERE id = ?
    `).run(Number((stats.avg_rating || 5).toFixed(1)), stats.count, productId);

    return NextResponse.json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
