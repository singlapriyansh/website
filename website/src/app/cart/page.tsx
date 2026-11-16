'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/context/AppContext';
import {
  Trash2,
  Heart,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  ShoppingBag,
  Percent,
} from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartSavings,
    updateCartQuantity,
    removeFromCart,
    toggleWishlist,
    showToast,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Delivery charge rule: Free above ₹999, else ₹99
  const shippingFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 99;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, cartSubtotal - couponDiscount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), orderAmount: cartSubtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.coupon.discountAmount,
        });
        showToast(`Coupon ${data.coupon.code} applied: Saved ₹${data.coupon.discountAmount}!`, 'success');
      } else {
        showToast(data.error || 'Invalid coupon code', 'error');
      }
    } catch {
      showToast('Error validating coupon', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    showToast('Coupon removed', 'info');
  };

  const moveToWishlist = async (item: any) => {
    await toggleWishlist(item.productId);
    await removeFromCart(item.id);
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md bg-white p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Shopping Bag is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Explore our trending seasonal drops, streetwear hoodies, or audio wearables and fill up your wardrobe.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
              >
                Browse Catalogue Now <ArrowRight className="w-4 h-4" />
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Shopping Bag ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-8">
            Review your items and proceed to secure address selection & payment
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List (7 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition hover:border-slate-300"
                >
                  {/* Left: Thumbnail & Meta */}
                  <div className="flex gap-4 items-center">
                    <Link href={`/products/${item.product.slug}`} className="shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-20 h-24 object-cover rounded-xl border border-slate-100"
                      />
                    </Link>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                        {item.product.brand}
                      </span>
                      <Link href={`/products/${item.product.slug}`} className="block">
                        <h3 className="text-sm font-bold text-slate-900 hover:text-rose-600 transition line-clamp-1 max-w-sm">
                          {item.product.title}
                        </h3>
                      </Link>

                      {/* Size and Color tags */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                        {item.size && (
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[11px]">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold text-[11px]">
                            Color: {item.color}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{(item.product.originalPrice * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Adjuster & Remove */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-bold text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => moveToWishlist(item)}
                        className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition flex items-center gap-1"
                      >
                        <Heart className="w-3.5 h-3.5" /> Move to Wishlist
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Coupon Card (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-rose-600" /> Apply Promo Code
                </h3>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-bold">{appliedCoupon.code} Applied</p>
                        <p className="text-[11px] text-emerald-700">You saved ₹{appliedCoupon.discountAmount}!</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10, FESTIVE20"
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-mono uppercase bg-slate-50"
                    />
                    <button
                      type="submit"
                      disabled={validatingCoupon}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition disabled:opacity-50"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                  <p>💡 Tip: Use <strong className="text-slate-700">FESTIVE20</strong> for 20% OFF or <strong className="text-slate-700">FLAT500</strong> on ₹2999+</p>
                </div>
              </div>

              {/* Price Details Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
                  Price Details ({cartCount} Items)
                </h3>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Total MRP</span>
                    <span className="font-semibold text-slate-800">₹{(cartSubtotal + cartSavings).toLocaleString()}</span>
                  </div>

                  {cartSavings > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount on MRP</span>
                      <span className="font-semibold">-₹{cartSavings.toLocaleString()}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span className="font-semibold">-₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    {shippingFee === 0 ? (
                      <span className="font-bold text-emerald-600">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-800">₹{shippingFee}</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-900">Total Payable Amount</span>
                  <span className="text-xl font-black text-slate-900">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>

                <Link
                  href={`/checkout${appliedCoupon ? `?coupon=${appliedCoupon.code}` : ''}`}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL Encrypted Checkout</span>
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
