'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/lib/types';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Star, Check } from 'lucide-react';

const CATEGORIES = [
  { slug: 'all', name: 'All Categories' },
  { slug: 'men', name: "Men's Fashion" },
  { slug: 'women', name: "Women's Fashion" },
  { slug: 'footwear', name: 'Footwear & Kicks' },
  { slug: 'electronics', name: 'Electronics & Audio' },
  { slug: 'accessories', name: 'Watches & Accessories' },
  { slug: 'beauty', name: 'Beauty & Grooming' },
];

const BRANDS = [
  'All Brands',
  'AURA Originals',
  'Raymond Artisan',
  'Biba Heritage',
  'Zara Studio',
  'Sony Acoustic',
  'Logitech G',
  'Nike Originals',
  'Adidas Performance',
  'Fossil Heritage',
  'Wildhorn Artisans',
  'Forest Botanics',
  'Ray-Ban Collection',
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const brandParam = searchParams.get('brand') || 'All Brands';
  const sortParam = searchParams.get('sort') || 'popular';
  const dealParam = searchParams.get('deal') === '1';
  const trendingParam = searchParams.get('trending') === '1';
  const featuredParam = searchParams.get('featured') === '1';
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (categoryParam && categoryParam !== 'all') query.set('category', categoryParam);
        if (searchParam) query.set('search', searchParam);
        if (brandParam && brandParam !== 'All Brands') query.set('brand', brandParam);
        if (sortParam) query.set('sort', sortParam);
        if (dealParam) query.set('deal', '1');
        if (trendingParam) query.set('trending', '1');
        if (featuredParam) query.set('featured', '1');
        if (maxPrice < 20000) query.set('maxPrice', maxPrice.toString());
        if (minRating > 0) query.set('minRating', minRating.toString());

        const res = await fetch(`/api/products?${query.toString()}`);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
          setTotal(data.total || data.products.length);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [categoryParam, searchParam, brandParam, sortParam, dealParam, trendingParam, featuredParam, maxPrice, minRating]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'All Brands') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setMaxPrice(20000);
    setMinRating(0);
    router.push('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {searchParam
              ? `Results for "${searchParam}"`
              : categoryParam !== 'all'
              ? CATEGORIES.find((c) => c.slug === categoryParam)?.name || 'Products'
              : dealParam
              ? 'Hot Deals of the Day'
              : trendingParam
              ? 'Trending Styles'
              : featuredParam
              ? 'Curated Premium Drops'
              : 'All Products Catalogue'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <strong className="text-slate-900">{total}</strong> verified items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
          >
            <Filter className="w-4 h-4 text-rose-600" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="popular">Recommended / Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
              <option value="discount">Biggest Discounts</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(categoryParam !== 'all' || brandParam !== 'All Brands' || searchParam || dealParam || maxPrice < 20000 || minRating > 0) && (
        <div className="flex flex-wrap items-center gap-2 py-4">
          <span className="text-xs text-slate-400 font-medium">Active filters:</span>
          {categoryParam !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold">
              Category: {CATEGORIES.find((c) => c.slug === categoryParam)?.name}
              <button onClick={() => updateParam('category', 'all')} className="hover:text-rose-600">✕</button>
            </span>
          )}
          {brandParam !== 'All Brands' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold">
              Brand: {brandParam}
              <button onClick={() => updateParam('brand', 'All Brands')} className="hover:text-rose-600">✕</button>
            </span>
          )}
          {searchParam && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold">
              Search: {searchParam}
              <button onClick={() => updateParam('search', '')} className="hover:text-rose-600">✕</button>
            </span>
          )}
          {minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold">
              Rating: {minRating}★ & above
              <button onClick={() => setMinRating(0)} className="hover:text-rose-600">✕</button>
            </span>
          )}
          {maxPrice < 20000 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold">
              Under ₹{maxPrice.toLocaleString()}
              <button onClick={() => setMaxPrice(20000)} className="hover:text-rose-600">✕</button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-rose-600 hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-rose-600" /> Filter Catalog
            </h3>
            <button onClick={clearAllFilters} className="text-xs font-bold text-slate-400 hover:text-rose-600">
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => updateParam('category', c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    categoryParam === c.slug
                      ? 'bg-rose-50 text-rose-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{c.name}</span>
                  {categoryParam === c.slug && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Max Price</h4>
              <span className="text-xs font-extrabold text-rose-600">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹1,000</span>
              <span>₹20,000</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Brands</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => updateParam('brand', b)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    brandParam === b
                      ? 'bg-rose-50 text-rose-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{b}</span>
                  {brandParam === b && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Customer Rating</h4>
            <div className="space-y-1.5">
              {[4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? 0 : r)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    minRating === r ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {r}★ & above
                  </span>
                  {minRating === r && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-slate-200 rounded-xl" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-5 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Try loosening your filters or searching for broader terms like &quot;hoodie&quot;, &quot;sneakers&quot;, or &quot;watch&quot;.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Category</h4>
                <div className="space-y-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => {
                        updateParam('category', c.slug);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 text-xs rounded-lg ${
                        categoryParam === c.slug ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Brands</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {BRANDS.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        updateParam('brand', b);
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left py-1.5 px-3 text-xs rounded-lg ${
                        brandParam === b ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 border border-slate-300 text-xs font-bold rounded-xl text-slate-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-sm font-semibold">Loading catalogue...</div>}>
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
