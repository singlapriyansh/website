import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { Product } from '@/lib/types';
import { formatProduct, DBProductRow } from '@/lib/formatProduct';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search') || searchParams.get('q');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sort = searchParams.get('sort');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const deal = searchParams.get('deal');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (category && category !== 'all') {
      conditions.push('(p.category_id = ? OR c.slug = ?)');
      params.push(category, category);
    }

    if (search) {
      conditions.push('(p.title LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR p.subcategory LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (brand && brand !== 'all') {
      conditions.push('p.brand = ?');
      params.push(brand);
    }

    if (minPrice) {
      conditions.push('p.price >= ?');
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      conditions.push('p.price <= ?');
      params.push(Number(maxPrice));
    }

    if (minRating) {
      conditions.push('p.rating >= ?');
      params.push(Number(minRating));
    }

    if (featured === '1' || featured === 'true') {
      conditions.push('p.is_featured = 1');
    }

    if (trending === '1' || trending === 'true') {
      conditions.push('p.is_trending = 1');
    }

    if (deal === '1' || deal === 'true') {
      conditions.push('p.is_deal = 1');
    }

    let whereClause = '';
    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    let orderBy = 'ORDER BY p.is_featured DESC, p.rating DESC, p.created_at DESC';
    if (sort === 'price_asc') {
      orderBy = 'ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'ORDER BY p.price DESC';
    } else if (sort === 'rating') {
      orderBy = 'ORDER BY p.rating DESC';
    } else if (sort === 'newest') {
      orderBy = 'ORDER BY p.created_at DESC';
    } else if (sort === 'discount') {
      orderBy = 'ORDER BY p.discount_percent DESC';
    }

    const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countRow = db.prepare(countSql).get(...params) as { total: number };
    const total = countRow?.total || 0;

    const dataSql = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(dataSql).all(...params, limit, offset) as DBProductRow[];
    const products = rows.map(formatProduct);

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      price,
      originalPrice,
      categoryId,
      subcategory,
      brand,
      stock = 50,
      images = [],
      sizes = [],
      colors = [],
      specs = {},
      isFeatured = false,
      isTrending = false,
      isDeal = false,
      deliveryDays = 3,
    } = body;

    if (!title || !price || !categoryId || !brand) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    const origPrice = Number(originalPrice) || Number(price);
    const numPrice = Number(price);
    const discountPercent = origPrice > numPrice ? Math.round(((origPrice - numPrice) / origPrice) * 100) : 0;
    const productId = 'prod_' + Date.now();

    const insertSql = `
      INSERT INTO products (
        id, title, slug, description, price, original_price, discount_percent,
        category_id, subcategory, brand, rating, reviews_count, stock, in_stock,
        is_featured, is_trending, is_deal, delivery_days, images_json, sizes_json, colors_json, specs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.prepare(insertSql).run(
      productId,
      title,
      slug,
      description || '',
      numPrice,
      origPrice,
      discountPercent,
      categoryId,
      subcategory || 'General',
      brand,
      Number(stock),
      isFeatured ? 1 : 0,
      isTrending ? 1 : 0,
      isDeal ? 1 : 0,
      Number(deliveryDays),
      JSON.stringify(images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop']),
      JSON.stringify(sizes),
      JSON.stringify(colors),
      JSON.stringify(specs)
    );

    const created = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(productId) as DBProductRow;
    return NextResponse.json({ success: true, product: formatProduct(created) });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
