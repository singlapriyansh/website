'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/context/AppContext';
import { Heart, ShoppingBag, Trash2, ArrowRight, Star } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, wishlistCount, toggleWishlist, addToCart, showToast } = useApp();

  const handleMoveToCart = async (productId: string, size?: string, color?: string) => {
    const success = await addToCart(productId, size, color, 1);
    if (success) {
      await toggleWishlist(productId);
      showToast('Moved item to Shopping Bag!', 'success');
    }
  };

  if (wishlistCount === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md bg-white p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Wishlist is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Save your favorite items here so you don&apos;t lose track of styles you love.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
              >
                Discover Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                My Wishlist ({wishlistCount} {wishlistCount === 1 ? 'item' : 'items'})
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Items you have bookmarked for later purchase
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[3/4] bg-slate-100">
                  <Link href={`/products/${item.product.slug}`} className="block w-full h-full">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <button
                    onClick={() => toggleWishlist(item.productId)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-rose-600 flex items-center justify-center hover:bg-white shadow"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-800 flex items-center gap-1">
                    <span>{item.product.rating}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.product.brand}
                    </span>
                    <Link href={`/products/${item.product.slug}`}>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-rose-600">
                        {item.product.title}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-extrabold text-slate-900">
                        ₹{item.product.price.toLocaleString()}
                      </span>
                      {item.product.originalPrice > item.product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{item.product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleMoveToCart(
                        item.productId,
                        item.product.sizes?.[0],
                        item.product.colors?.[0]
                      )
                    }
                    className="w-full py-2.5 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
