'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/context/AppContext';
import { Order, OrderStatus } from '@/lib/types';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Printer,
  ChevronLeft,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

const TRACKING_STEPS: OrderStatus[] = [
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, showToast } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (data.order) setOrder(data.order);
      } catch (err) {
        console.error('Fetch order error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Order cancelled successfully. Stock has been restored.', 'info');
        setOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : null));
      } else {
        showToast(data.error || 'Failed to cancel order', 'error');
      }
    } catch {
      showToast('Error cancelling order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!confirm('Submit return request for this order? Doorstep pickup will be scheduled.')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return' }),
      });
      if (res.ok) {
        showToast('Return pickup requested! Refund will process upon inspection.', 'success');
        setOrder((prev) => (prev ? { ...prev, status: 'Returned' } : null));
      }
    } catch {
      showToast('Error processing return', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-20 text-center text-xs font-semibold text-slate-500">
          Loading order details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-20 text-center">
          <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
          <Link href="/orders" className="text-rose-600 font-bold text-xs mt-3 inline-block">
            ← Back to Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isCancelledOrReturned = order.status === 'Cancelled' || order.status === 'Returned';
  const currentStepIdx = TRACKING_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/orders"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back to My Orders
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Official Invoice</span>
              </button>

              {['Confirmed', 'Pending', 'Processing'].includes(order.status) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}

              {order.status === 'Delivered' && (
                <button
                  onClick={handleReturnOrder}
                  className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition"
                >
                  Request 7-Day Return
                </button>
              )}
            </div>
          </div>

          {/* Visual Order Progress Tracker */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{order.orderNumber}</h1>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Status</span>
                <span
                  className={`block px-3 py-1 rounded-full text-xs font-bold mt-0.5 ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            {!isCancelledOrReturned ? (
              <div className="py-4">
                <div className="relative flex justify-between items-center">
                  {/* Connecting background line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-rose-600 -translate-y-1/2 transition-all duration-500 z-0"
                    style={{
                      width: `${Math.max(0, (currentStepIdx / (TRACKING_STEPS.length - 1)) * 100)}%`,
                    }}
                  />

                  {TRACKING_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            isDone ? 'bg-rose-600 text-white ring-4 ring-rose-100' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-semibold mt-2 text-center max-w-[80px] ${
                            isDone ? 'text-slate-900 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
                  order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {order.status === 'Cancelled' ? <XCircle className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                <span>This order was {order.status.toLowerCase()}. Product inventory has been credited back to catalog.</span>
              </div>
            )}
          </div>

          {/* Printable Invoice Container */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
            {/* Header with ShopSphere Logo */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div>
                <span className="text-xl font-black text-slate-900">
                  Shop<span className="text-rose-600">Sphere</span> India
                </span>
                <p className="text-[11px] text-slate-400">Tax Invoice & Purchase Receipt</p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <p>Invoice Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Payment ID: <code className="font-mono">{order.paymentId || 'N/A'}</code></p>
              </div>
            </div>

            {/* Address & Payment Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Shipping Details</h4>
                <p className="font-bold text-slate-800">{order.shippingAddress?.fullName}</p>
                <p className="text-slate-600">{order.shippingAddress?.street}</p>
                <p className="text-slate-600">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </p>
                <p className="text-slate-600 font-semibold">Phone: {order.shippingAddress?.phone}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Payment Summary</h4>
                <p className="text-slate-700">Method: <strong className="text-slate-900">{order.paymentMethod}</strong></p>
                <p className="text-slate-700">Payment Status: <strong className="text-emerald-700 font-bold">{order.paymentStatus}</strong></p>
                {order.couponCode && (
                  <p className="text-emerald-600 font-bold">Applied Promo: {order.couponCode}</p>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">Itemized Products</h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {order.items.map((it) => (
                  <div key={it.id} className="p-4 flex items-center justify-between text-xs gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.productImage}
                        alt={it.productTitle}
                        className="w-12 h-14 object-cover rounded-xl border border-slate-100 shrink-0"
                      />
                      <div>
                        <h5 className="font-bold text-slate-900">{it.productTitle}</h5>
                        <p className="text-slate-400 text-[11px]">
                          Qty: {it.quantity} {it.size ? `• Size: ${it.size}` : ''} {it.color ? `• Color: ${it.color}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">₹{it.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Price Calculations */}
            <div className="border-t border-slate-200 pt-4 flex justify-end">
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-bold">-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-slate-800">
                    {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-rose-600">₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
