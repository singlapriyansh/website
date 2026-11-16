import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { formatProduct } from '@/lib/formatProduct';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const row = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? OR p.slug = ?
    `).get(id, id) as any;

    if (!row) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: formatProduct(row) });
  } catch (error) {
    console.error('Fetch single product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const {
      title,
      description,
      price,
      originalPrice,
      categoryId,
      subcategory,
      brand,
      stock,
      images,
      sizes,
      colors,
      specs,
      isFeatured,
      isTrending,
      isDeal,
      deliveryDays,
    } = body;

    const origPrice = Number(originalPrice) || Number(price);
    const numPrice = Number(price);
    const discountPercent = origPrice > numPrice ? Math.round(((origPrice - numPrice) / origPrice) * 100) : 0;

    db.prepare(`
      UPDATE products SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        discount_percent = ?,
        category_id = COALESCE(?, category_id),
        subcategory = COALESCE(?, subcategory),
        brand = COALESCE(?, brand),
        stock = COALESCE(?, stock),
        in_stock = CASE WHEN COALESCE(?, stock) > 0 THEN 1 ELSE 0 END,
        is_featured = COALESCE(?, is_featured),
        is_trending = COALESCE(?, is_trending),
        is_deal = COALESCE(?, is_deal),
        delivery_days = COALESCE(?, delivery_days),
        images_json = COALESCE(?, images_json),
        sizes_json = COALESCE(?, sizes_json),
        colors_json = COALESCE(?, colors_json),
        specs_json = COALESCE(?, specs_json)
      WHERE id = ?
    `).run(
      title,
      description,
      numPrice,
      origPrice,
      discountPercent,
      categoryId,
      subcategory,
      brand,
      stock !== undefined ? Number(stock) : null,
      stock !== undefined ? Number(stock) : null,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
      isTrending !== undefined ? (isTrending ? 1 : 0) : null,
      isDeal !== undefined ? (isDeal ? 1 : 0) : null,
      deliveryDays !== undefined ? Number(deliveryDays) : null,
      images ? JSON.stringify(images) : null,
      sizes ? JSON.stringify(sizes) : null,
      colors ? JSON.stringify(colors) : null,
      specs ? JSON.stringify(specs) : null,
      id
    );

    const updated = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(id) as any;
    return NextResponse.json({ success: true, product: formatProduct(updated) });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
