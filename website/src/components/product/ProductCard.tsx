'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const [hovered, setHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const inWish = isInWishlist(product.id);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    const defaultSize = product.sizes.length > 0 ? product.sizes[0] : undefined;
    const defaultColor = product.colors.length > 0 ? product.colors[0] : undefined;
    await addToCart(product.id, defaultSize, defaultColor, 1);
    setIsAdding(false);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const displayImage = hovered && product.images.length > 1 ? product.images[1] : product.images[0];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Product Image Box */}
      <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={displayImage}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 z-10 shadow-sm ${
            inWish
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.discountPercent > 0 && (
            <span className="bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isDeal && (
            <span className="bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
              Special Deal
            </span>
          )}
        </div>

        {/* Rating Floating Tag */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1 text-[11px] font-bold text-slate-800">
          <span>{product.rating}</span>
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-slate-400 font-normal">|</span>
          <span className="text-slate-500 font-normal">{product.reviewsCount}</span>
        </div>

        {/* Hover Action Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent flex items-center gap-2 transition-all duration-300 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            onClick={handleQuickAdd}
            disabled={isAdding || !product.inStock}
            className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            {isAdding ? (
              'Adding...'
            ) : !product.inStock ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
              </>
            )}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">
            {product.brand}
          </p>
          <Link href={`/products/${product.slug}`} className="block group/title">
            <h3 className="text-sm font-semibold text-slate-900 group-hover/title:text-rose-600 transition truncate line-clamp-1">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="pt-1 flex flex-col gap-1.5">
          {/* Price Row */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-slate-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Delivery & Stock Info */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-medium">
              Get it in {product.deliveryDays} {product.deliveryDays === 1 ? 'day' : 'days'}
            </span>
            {product.stock <= 20 && product.stock > 0 && (
              <span className="text-rose-600 font-semibold text-[10px]">
                Only {product.stock} left!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
