import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { formatProduct } from '@/lib/formatProduct';

export const dynamic = 'force-dynamic';

function getUserId(req: NextRequest, sessionUser: { id: string } | null): string {
  if (sessionUser) return sessionUser.id;
  const guestHeader = req.headers.get('x-guest-id');
  if (guestHeader) return guestHeader;
  return 'guest_default';
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    const userId = getUserId(req, session);

    const rows = db.prepare(`
      SELECT 
        ci.id as cart_item_id,
        ci.user_id,
        ci.product_id,
        ci.size,
        ci.color,
        ci.quantity,
        ci.created_at as cart_item_created_at,
        p.*,
        c.name as category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(userId) as any[];

    const items = rows.map((r) => ({
      id: r.cart_item_id,
      userId: r.user_id,
      productId: r.product_id,
      size: r.size,
      color: r.color,
      quantity: r.quantity,
      createdAt: r.cart_item_created_at,
      product: formatProduct(r),
    }));

    // Server-side calculations
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const originalSubtotal = items.reduce((sum, item) => sum + item.product.originalPrice * item.quantity, 0);
    const savings = originalSubtotal - subtotal;
    // Free shipping above ₹999, else ₹99
    const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
    const tax = 0; // Prices are tax-inclusive
    const total = subtotal + shippingFee;

    return NextResponse.json({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      originalSubtotal,
      savings,
      shippingFee,
      tax,
      total,
    });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    const userId = getUserId(req, session);
    const { productId, size, color, quantity = 1 } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = db.prepare('SELECT id, stock, in_stock FROM products WHERE id = ?').get(productId) as {
      id: string;
      stock: number;
      in_stock: number;
    } | undefined;

    if (!product || !product.in_stock || product.stock < 1) {
      return NextResponse.json({ error: 'Product is currently out of stock' }, { status: 400 });
    }

    // Check if item already exists in cart with same size and color
    const existing = db.prepare(`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = ? AND product_id = ? 
      AND (size IS ? OR size = ?) 
      AND (color IS ? OR color = ?)
    `).get(userId, productId, size || null, size || null, color || null, color || null) as { id: string; quantity: number } | undefined;

    if (existing) {
      const newQty = existing.quantity + Number(quantity);
      if (newQty > product.stock) {
        return NextResponse.json({ error: `Cannot add more than ${product.stock} items (stock limit)` }, { status: 400 });
      }
      if (newQty <= 0) {
        db.prepare('DELETE FROM cart_items WHERE id = ?').run(existing.id);
      } else {
        db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
      }
    } else {
      if (Number(quantity) > product.stock) {
        return NextResponse.json({ error: `Only ${product.stock} items left in stock` }, { status: 400 });
      }
      const cartItemId = 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      db.prepare(`
        INSERT INTO cart_items (id, user_id, product_id, size, color, quantity)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(cartItemId, userId, productId, size || null, color || null, Number(quantity));
    }

    return NextResponse.json({ success: true, message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    const userId = getUserId(req, session);
    const { cartItemId, quantity } = await req.json();

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: 'Cart item ID and quantity required' }, { status: 400 });
    }

    if (Number(quantity) <= 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(cartItemId, userId);
    } else {
      // Validate stock
      const item = db.prepare(`
        SELECT ci.id, p.stock 
        FROM cart_items ci 
        JOIN products p ON ci.product_id = p.id 
        WHERE ci.id = ? AND ci.user_id = ?
      `).get(cartItemId, userId) as { id: string; stock: number } | undefined;

      if (!item) {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }

      if (Number(quantity) > item.stock) {
        return NextResponse.json({ error: `Max available stock is ${item.stock}` }, { status: 400 });
      }

      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?').run(Number(quantity), cartItemId, userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json({ error: 'Failed to update item quantity' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    const userId = getUserId(req, session);
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get('id');
    const clearAll = searchParams.get('clear');

    if (clearAll === '1' || clearAll === 'true') {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
      return NextResponse.json({ success: true, message: 'Cart cleared' });
    }

    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID is required' }, { status: 400 });
    }

    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(cartItemId, userId);
    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
