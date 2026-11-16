'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Mail, ShieldCheck, Truck, RotateCcw, Clock, ArrowRight, Heart } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      setLoading(true);
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus({ message: data.message || 'Subscribed successfully!', success: res.ok });
      if (res.ok) setEmail('');
    } catch {
      setStatus({ message: 'Network error. Please try again.', success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Guarantees Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl text-rose-500">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Express Free Delivery</h4>
            <p className="text-xs text-slate-400 mt-1">Free standard shipping on all orders over ₹999 across India.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl text-amber-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">100% Genuine Guarantee</h4>
            <p className="text-xs text-slate-400 mt-1">Sourced directly from verified brands and licensed distributors.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl text-emerald-500">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Hassle-Free Returns</h4>
            <p className="text-xs text-slate-400 mt-1">7-day doorstep pickup returns with instant refund credit.</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl text-indigo-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">24/7 Dedicated Support</h4>
            <p className="text-xs text-slate-400 mt-1">Always here to assist via live chat, email, and phone helpline.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Newsletter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-rose-500 to-amber-500 flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white">
              Shop<span className="text-rose-500">Sphere</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            India&apos;s premier destination for curated fashion, streetwear, sneakers, luxury timepieces, and cutting-edge electronics.
          </p>

          <div className="pt-2">
            <h5 className="text-sm font-bold text-white mb-2">Subscribe for Special Drops & Secret Sales</h5>
            <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="bg-slate-900 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl flex-1 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                {loading ? '...' : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
            {status && (
              <p className={`text-xs mt-2 ${status.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {status.message}
              </p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4">Shop Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products?category=men" className="hover:text-white transition">Men&apos;s Streetwear & Formal</Link></li>
            <li><Link href="/products?category=women" className="hover:text-white transition">Women&apos;s Ethnic & Western</Link></li>
            <li><Link href="/products?category=footwear" className="hover:text-white transition">Sneakers & Running Kicks</Link></li>
            <li><Link href="/products?category=electronics" className="hover:text-white transition">Headphones & Wearables</Link></li>
            <li><Link href="/products?category=accessories" className="hover:text-white transition">Luxury Watches & Wallets</Link></li>
            <li><Link href="/products?deal=1" className="text-rose-400 hover:text-rose-300 font-semibold transition">Daily Deals & Clearance</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/orders" className="hover:text-white transition">Track Your Order</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Contact Us & Support</Link></li>
            <li><Link href="/faq" className="hover:text-white transition">Frequently Asked Questions</Link></li>
            <li><Link href="/about" className="hover:text-white transition">About ShopSphere</Link></li>
            <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition">Privacy & Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Payment & Security */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4">Secure Shopping</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            All card transactions are encrypted with 256-bit bank-grade TLS. We never store CVV or card details.
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">UPI</span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">Razorpay</span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">Visa</span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">Mastercard</span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">RuPay</span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">Net Banking</span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 ShopSphere India Retail Pvt Ltd. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for modern e-commerce.
        </p>
      </div>
    </footer>
  );
}
