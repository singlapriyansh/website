import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';
import { Order, OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const orderRow = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? OR o.order_number = ?
    `).get(id, id) as any;

    if (!orderRow) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && orderRow.user_id !== session.id) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    let shippingAddress = {};
    try {
      shippingAddress = JSON.parse(orderRow.shipping_address_json);
    } catch {}

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderRow.id) as any[];

    const order: Order = {
      id: orderRow.id,
      orderNumber: orderRow.order_number,
      userId: orderRow.user_id,
      userName: orderRow.user_name,
      userEmail: orderRow.user_email,
      status: orderRow.status,
      subtotal: orderRow.subtotal,
      discount: orderRow.discount,
      couponCode: orderRow.coupon_code,
      shippingFee: orderRow.shipping_fee,
      tax: orderRow.tax,
      total: orderRow.total,
      paymentMethod: orderRow.payment_method,
      paymentStatus: orderRow.payment_status,
      paymentId: orderRow.payment_id,
      shippingAddress: shippingAddress as any,
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
      createdAt: orderRow.created_at,
      updatedAt: orderRow.updated_at,
    };

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const { status, action } = await req.json();

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let targetStatus: OrderStatus = status;

    if (action === 'cancel') {
      if (session.role !== 'admin' && order.user_id !== session.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.status)) {
        return NextResponse.json({ error: `Cannot cancel order in "${order.status}" status` }, { status: 400 });
      }
      targetStatus = 'Cancelled';
    } else if (action === 'return') {
      if (session.role !== 'admin' && order.user_id !== session.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      if (order.status !== 'Delivered') {
        return NextResponse.json({ error: 'Return can only be requested for delivered orders' }, { status: 400 });
      }
      targetStatus = 'Returned';
    } else {
      if (session.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required to update order status' }, { status: 403 });
      }
    }

    const validStatuses: OrderStatus[] = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
    ];

    if (!validStatuses.includes(targetStatus)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(`
        UPDATE orders 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(targetStatus, id);

      // If cancelling or returning, restock items
      if (['Cancelled', 'Returned'].includes(targetStatus) && !['Cancelled', 'Returned'].includes(order.status)) {
        const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id) as any[];
        const restockStmt = db.prepare('UPDATE products SET stock = stock + ?, in_stock = 1 WHERE id = ?');
        for (const it of items) {
          restockStmt.run(it.quantity, it.product_id);
        }
      }

      db.exec('COMMIT');
      return NextResponse.json({ success: true, status: targetStatus });
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
