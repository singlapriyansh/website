'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/context/AppContext';
import { Order } from '@/lib/types';
import { Package, ChevronRight, Clock, ArrowRight, Truck } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Please Sign In to View Orders</h2>
            <p className="text-xs text-slate-500">Sign in with your account to review purchases, tracking, and invoices.</p>
            <Link
              href="/auth/login?redirect=/orders"
              className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Sign In Now
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                My Orders & Purchases
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Track shipments, view detailed invoice breakdowns, or request returns
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No orders placed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you place an order, its real-time shipping status and invoice will appear here.
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:border-slate-300 transition"
                >
                  {/* Order Card Header */}
                  <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Placed</span>
                        <span className="font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
                        <span className="font-bold text-slate-900">₹{order.total.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Order ID</span>
                        <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : order.status === 'Shipped' || order.status === 'Out for Delivery'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                      >
                        <span>Details & Invoice</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4 sm:p-6 divide-y divide-slate-100">
                    {order.items.map((it) => (
                      <div key={it.id} className="py-3 flex items-center justify-between text-xs gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={it.productImage}
                            alt={it.productTitle}
                            className="w-14 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{it.productTitle}</h4>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              Qty: {it.quantity} {it.size ? `• Size: ${it.size}` : ''} {it.color ? `• Color: ${it.color}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-900 text-sm">₹{it.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
