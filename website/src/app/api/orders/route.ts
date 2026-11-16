import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { Order, OrderItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const all = searchParams.get('all');

    let ordersQuery = '';
    const params: string[] = [];

    if (session.role === 'admin' && all === 'true') {
      if (status && status !== 'all') {
        ordersQuery = `
          SELECT o.*, u.name as user_name, u.email as user_email
          FROM orders o
          JOIN users u ON o.user_id = u.id
          WHERE o.status = ?
          ORDER BY o.created_at DESC
        `;
        params.push(status);
      } else {
        ordersQuery = `
          SELECT o.*, u.name as user_name, u.email as user_email
          FROM orders o
          JOIN users u ON o.user_id = u.id
          ORDER BY o.created_at DESC
        `;
      }
    } else {
      ordersQuery = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `;
      params.push(session.id);
    }

    const orderRows = db.prepare(ordersQuery).all(...params) as any[];

    const orders: Order[] = orderRows.map((o) => {
      let shippingAddress = {} as any;
      try {
        shippingAddress = JSON.parse(o.shipping_address_json);
      } catch {
        shippingAddress = {};
      }

      const items = db.prepare(`
        SELECT * FROM order_items WHERE order_id = ?
      `).all(o.id) as any[];

      return {
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        userName: o.user_name,
        userEmail: o.user_email,
        status: o.status,
        subtotal: o.subtotal,
        discount: o.discount,
        couponCode: o.coupon_code,
        shippingFee: o.shipping_fee,
        tax: o.tax,
        total: o.total,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        paymentId: o.payment_id,
        shippingAddress,
        items: items.map((i) => ({
          id: i.id,
          orderId: i.order_id,
          productId: i.product_id,
          productTitle: i.product_title,
          productImage: i.product_image,
          size: i.size,
          color: i.color,
          price: i.price,
          quantity: i.quantity,
          total: i.total,
        })),
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'Please log in to place an order' }, { status: 401 });
    }

    const body = await req.json();
    const {
      addressId,
      customAddress,
      paymentMethod = 'COD',
      couponCode,
      paymentId,
    } = body;

    // Get shipping address
    let shippingAddress: any = null;
    if (addressId) {
      shippingAddress = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(addressId, session.id);
    } else if (customAddress) {
      shippingAddress = customAddress;
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    // Fetch user cart items
    const cartRows = db.prepare(`
      SELECT 
        ci.id as cart_item_id,
        ci.product_id,
        ci.size,
        ci.color,
        ci.quantity,
        p.title,
        p.price,
        p.stock,
        p.in_stock,
        p.images_json
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(session.id) as any[];

    if (cartRows.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    // Verify stock and calculate backend subtotal
    let subtotal = 0;
    for (const item of cartRows) {
      if (!item.in_stock || item.stock < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for "${item.title}". Only ${item.stock} available.`,
        }, { status: 400 });
      }
      subtotal += item.price * item.quantity;
    }

    // Validate coupon if applied
    let discount = 0;
    let appliedCoupon: string | null = null;
    if (couponCode) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1').get(couponCode.trim()) as any;
      if (coupon && subtotal >= coupon.min_order_value) {
        if (coupon.discount_type === 'percentage') {
          discount = Math.round((subtotal * coupon.discount_value) / 100);
          if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
          }
        } else {
          discount = coupon.discount_value;
        }
        discount = Math.min(discount, subtotal);
        appliedCoupon = coupon.code;
      }
    }

    const shippingFee = subtotal > 999 ? 0 : 99;
    const tax = 0;
    const total = Math.max(0, subtotal - discount + shippingFee + tax);

    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const generatedPaymentId = paymentId || (paymentMethod === 'COD' ? 'COD_' + Date.now() : 'pay_rzp_test_' + Date.now());

    // Begin atomic execution
    db.exec('BEGIN TRANSACTION');

    try {
      // 1. Insert order
      db.prepare(`
        INSERT INTO orders (
          id, order_number, user_id, status, subtotal, discount, coupon_code,
          shipping_fee, tax, total, payment_method, payment_status, payment_id,
          shipping_address_json
        ) VALUES (?, ?, ?, 'Confirmed', ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?, ?)
      `).run(
        orderId,
        orderNumber,
        session.id,
        subtotal,
        discount,
        appliedCoupon,
        shippingFee,
        tax,
        total,
        paymentMethod,
        generatedPaymentId,
        JSON.stringify(shippingAddress)
      );

      // 2. Insert order items & update product stock
      const insertItem = db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, product_title, product_image, size, color, price, quantity, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const decrementStock = db.prepare(`
        UPDATE products 
        SET stock = stock - ?, in_stock = CASE WHEN stock - ? > 0 THEN 1 ELSE 0 END
        WHERE id = ?
      `);

      for (const item of cartRows) {
        let firstImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop';
        try {
          const imgs = JSON.parse(item.images_json);
          if (imgs && imgs[0]) firstImg = imgs[0];
        } catch {}

        const itemTotal = item.price * item.quantity;
        const itemId = 'orditem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

        insertItem.run(
          itemId,
          orderId,
          item.product_id,
          item.title,
          firstImg,
          item.size || null,
          item.color || null,
          item.price,
          item.quantity,
          itemTotal
        );

        decrementStock.run(item.quantity, item.quantity, item.product_id);
      }

      // 3. Clear cart
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(session.id);

      db.exec('COMMIT');

      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          orderNumber,
          total,
          status: 'Confirmed',
          paymentMethod,
          paymentId: generatedPaymentId,
        },
      });
    } catch (txError) {
      db.exec('ROLLBACK');
      throw txError;
    }
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}
