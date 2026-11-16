import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryPills from '@/components/home/CategoryPills';
import DealTimer from '@/components/home/DealTimer';
import BrandShowcase from '@/components/home/BrandShowcase';
import ProductCard from '@/components/product/ProductCard';
import { db } from '@/lib/db';
import { formatProduct } from '@/lib/formatProduct';
import { ArrowRight, Sparkles, TrendingUp, Award, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  // Direct server queries for instant SSR performance
  const trendingRows = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_trending = 1
    LIMIT 4
  `).all() as any[];

  const dealRows = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_deal = 1
    LIMIT 4
  `).all() as any[];

  const featuredRows = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_featured = 1
    LIMIT 4
  `).all() as any[];

  const trendingProducts = trendingRows.map(formatProduct);
  const dealProducts = dealRows.map(formatProduct);
  const featuredProducts = featuredRows.map(formatProduct);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Carousel */}
        <HeroBanner />

        {/* Category Circle Pills */}
        <CategoryPills />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
          {/* Trending Products */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Trending Right Now
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Highest velocity drops across streetwear, sneakers, and wearables
                  </p>
                </div>
              </div>
              <Link
                href="/products?trending=1"
                className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          {/* Flash Sale Banner with Ticking Countdown */}
          <DealTimer />

          {/* Deals of the Day Products */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Deals of the Day: Flat Discounts
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Limited stock deals with verified price cuts
                  </p>
                </div>
              </div>
              <Link
                href="/products?deal=1"
                className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
              >
                <span>All Deals</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {dealProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          {/* Brand Showcase */}
          <BrandShowcase />

          {/* Featured Premium Drops */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Curated Editor&apos;s Picks
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Heritage pieces and flagship tech handpicked by our stylists
                  </p>
                </div>
              </div>
              <Link
                href="/products?featured=1"
                className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
              >
                <span>Explore Curated</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          {/* Promotional Banner Callout */}
          <div className="rounded-3xl bg-slate-900 p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl z-10">
              <span className="px-3 py-1 bg-rose-600 text-white font-extrabold text-[11px] rounded-md uppercase tracking-wider">
                Exclusive Member Privilege
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Get ₹500 OFF On Your Order Above ₹2999
              </h3>
              <p className="text-sm text-slate-300">
                Apply coupon code <code className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">FLAT500</code> during checkout. Plus enjoy free express delivery and easy 7-day doorstep pickup returns.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-sm font-bold transition shadow-lg active:scale-95"
                >
                  Start Shopping Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border-4 border-white/10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm bg-white/5">
                <span className="text-xs uppercase font-extrabold text-rose-400 tracking-widest">
                  Verified Authentic
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white mt-1">100%</span>
                <span className="text-xs text-slate-300 mt-1">Brand Direct Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
