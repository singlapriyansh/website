import React from 'react';
import Link from 'next/link';

const BRANDS = [
  { name: 'Sony Acoustic', category: 'Audio', logo: 'SONY', discount: 'Up to 45% OFF' },
  { name: 'Nike Originals', category: 'Sneakers', logo: 'NIKE', discount: 'Min 40% OFF' },
  { name: 'Zara Studio', category: 'Apparel', logo: 'ZARA', discount: 'New Season' },
  { name: 'Raymond Artisan', category: 'Formalwear', logo: 'RAYMOND', discount: 'Up to 40% OFF' },
  { name: 'Fossil Heritage', category: 'Watches', logo: 'FOSSIL', discount: 'Flat 40% OFF' },
  { name: 'Ray-Ban Collection', category: 'Eyewear', logo: 'RAY-BAN', discount: 'Up to 50% OFF' },
];

export default function BrandShowcase() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Featured Flagship Brands
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guaranteed genuine products from international fashion houses and tech masters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {BRANDS.map((b) => (
            <Link
              key={b.name}
              href={`/products?brand=${encodeURIComponent(b.name)}`}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center justify-center group"
            >
              <div className="h-12 flex items-center justify-center font-black tracking-widest text-slate-800 text-lg sm:text-xl group-hover:scale-110 transition-transform">
                {b.logo}
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2">
                {b.category}
              </span>
              <span className="text-xs font-extrabold text-rose-600 mt-1 bg-rose-50 px-2.5 py-0.5 rounded-full">
                {b.discount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
