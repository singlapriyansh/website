import React from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { slug: 'men', name: "Men's Fashion", items: '450+ Styles', img: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&auto=format&fit=crop' },
  { slug: 'women', name: "Women's Fashion", items: '780+ Styles', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop' },
  { slug: 'footwear', name: 'Footwear & Kicks', items: '320+ Styles', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop' },
  { slug: 'electronics', name: 'Audio & Gadgets', items: '210+ Styles', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop' },
  { slug: 'accessories', name: 'Watches & Wallets', items: '190+ Styles', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop' },
  { slug: 'beauty', name: 'Skincare & Grooming', items: '140+ Styles', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop' },
];

export default function CategoryPills() {
  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Curated collections tailored for modern lifestyles
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 transition"
          >
            Explore All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-300 bg-slate-50/50 hover:bg-white"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-rose-500 transition-colors shadow-sm mb-3">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-rose-600 transition">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-400 mt-0.5">{cat.items}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
