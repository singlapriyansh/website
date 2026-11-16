import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserFromCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUserFromCookie();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const revenueRow = db.prepare(`
      SELECT SUM(total) as total_revenue, COUNT(*) as total_orders
      FROM orders
      WHERE status != 'Cancelled'
    `).get() as { total_revenue: number; total_orders: number };

    const customerRow = db.prepare(`
      SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'
    `).get() as { total_customers: number };

    const productRow = db.prepare(`
      SELECT COUNT(*) as total_products, SUM(CASE WHEN stock <= 20 THEN 1 ELSE 0 END) as low_stock_count
      FROM products
    `).get() as { total_products: number; low_stock_count: number };

    const statusBreakdown = db.prepare(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `).all() as { status: string; count: number }[];

    const recentOrders = db.prepare(`
      SELECT o.id, o.order_number, o.status, o.total, o.payment_method, o.created_at, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `).all() as any[];

    const categoryStats = db.prepare(`
      SELECT c.name as category_name, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
    `).all();

    return NextResponse.json({
      stats: {
        totalRevenue: revenueRow.total_revenue || 0,
        totalOrders: revenueRow.total_orders || 0,
        totalCustomers: customerRow.total_customers || 0,
        totalProducts: productRow.total_products || 0,
        lowStockCount: productRow.low_stock_count || 0,
        averageOrderValue: revenueRow.total_orders > 0 ? Math.round((revenueRow.total_revenue || 0) / revenueRow.total_orders) : 0,
      },
      statusBreakdown,
      categoryStats,
      recentOrders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
