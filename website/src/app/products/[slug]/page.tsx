'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Product, Review } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Share2,
  ChevronRight,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart, toggleWishlist, isInWishlist, user, showToast } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);
          if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0]);

          // Fetch reviews
          const revRes = await fetch(`/api/reviews?productId=${data.product.id}`);
          const revData = await revRes.json();
          if (revData.reviews) setReviews(revData.reviews);

          // Fetch related
          const relRes = await fetch(`/api/products?category=${data.product.categoryId}&limit=4`);
          const relData = await relRes.json();
          if (relData.products) {
            setRelated(relData.products.filter((p: Product) => p.id !== data.product.id));
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    await addToCart(product.id, selectedSize, selectedColor, quantity);
    setIsAdding(false);
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode.trim())) {
      setDeliveryStatus(`Express Delivery verified to ${pincode}: Guaranteed delivery in ${product?.deliveryDays || 2} days. Free Delivery.`);
    } else {
      setDeliveryStatus('Please enter a valid 6-digit Indian postal code.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to write a review', 'error');
      return;
    }
    if (!product || !reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle.trim(),
          comment: reviewComment.trim(),
        }),
      });

      if (res.ok) {
        showToast('Review submitted successfully!', 'success');
        setReviewComment('');
        setReviewTitle('');
        const revRes = await fetch(`/api/reviews?productId=${product.id}`);
        const revData = await revRes.json();
        if (revData.reviews) setReviews(revData.reviews);
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to submit review', 'error');
      }
    } catch {
      showToast('Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm font-semibold text-slate-500">
          Loading product details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
          <Link href="/products" className="text-rose-600 font-bold text-sm mt-3 inline-block">
            ← Return to Catalogue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const inWish = isInWishlist(product.id);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
            <Link href="/" className="hover:text-slate-800">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/products?category=${product.categoryId}`} className="hover:text-slate-800">
              {product.categoryName || 'Products'}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-semibold truncate max-w-xs">{product.title}</span>
          </nav>

          {/* Main Product Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
            {/* Gallery Column (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
              {/* Thumbnails */}
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === idx ? 'border-rose-600 ring-2 ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image Display */}
              <div className="relative flex-1 aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
                <img
                  src={product.images[activeImage] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                />

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md ${
                    inWish
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white/90 backdrop-blur-sm text-slate-700 hover:text-rose-600'
                  }`}
                  aria-label="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${inWish ? 'fill-rose-600 text-rose-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Meta & Actions Column (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                {/* Brand & Title */}
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-rose-600">
                    {product.brand}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                    {product.title}
                  </h1>

                  {/* Rating Tag */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">
                      <span>{product.rating}</span>
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500">{product.reviewsCount} Ratings</span>
                    </div>
                    {product.stock <= 20 && (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                        Hurry! Only {product.stock} items left
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Display */}
                <div className="py-4 border-b border-slate-100">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="text-base text-slate-400 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-sm font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {product.discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Inclusive of all taxes</p>
                </div>

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Select Size
                      </span>
                      <span className="text-xs text-rose-600 font-semibold cursor-pointer hover:underline">
                        Size Chart
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-12 h-11 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center ${
                            selectedSize === s
                              ? 'border-rose-600 bg-rose-50 text-rose-600 ring-2 ring-rose-500/20 shadow-sm'
                              : 'border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="py-4 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block mb-2">
                      Color / Shade: <span className="text-rose-600 font-bold">{selectedColor}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                            selectedColor === c
                              ? 'border-slate-900 bg-slate-900 text-white font-bold'
                              : 'border-slate-200 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="py-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3.5 py-2 hover:bg-slate-200 text-slate-700 font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-bold text-sm text-slate-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="px-3.5 py-2 hover:bg-slate-200 text-slate-700 font-bold text-sm"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={isAdding || !product.inStock}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isAdding ? 'Adding to Bag...' : !product.inStock ? 'Out of Stock' : 'Add to Bag'}</span>
                    </button>
                  </div>

                  <Link
                    href="/cart"
                    onClick={handleAddToCart}
                    className="block w-full text-center py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    Buy Now with 1-Click Checkout
                  </Link>
                </div>

                {/* Postal Code Delivery Checker */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Check Delivery & Cash on Delivery Availability</span>
                  </div>
                  <form onSubmit={checkPincode} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter 6-digit Pincode"
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition"
                    >
                      Check
                    </button>
                  </form>
                  {deliveryStatus && (
                    <p className="text-xs text-emerald-600 font-medium pt-1">
                      {deliveryStatus}
                    </p>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-4 text-center">
                  <div className="p-2.5 rounded-xl border border-slate-100 bg-white flex flex-col items-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">100% Genuine</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-100 bg-white flex flex-col items-center">
                    <RotateCcw className="w-5 h-5 text-indigo-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">7-Day Returns</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-100 bg-white flex flex-col items-center">
                    <Truck className="w-5 h-5 text-rose-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-700">Express Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Technical Specifications */}
          <div className="mt-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-3">
                Product Story & Details
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                {product.description}
              </p>
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4">
                  Product Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between p-3 bg-slate-50 rounded-xl text-xs">
                      <span className="font-medium text-slate-500">{k}</span>
                      <span className="font-bold text-slate-800 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews & Ratings Section */}
          <div className="mt-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                  Verified Customer Reviews ({reviews.length})
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900">{product.rating}</span>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">Overall Rating</span>
                </div>
              </div>
            </div>

            {/* Write a Review Box */}
            <form onSubmit={handleReviewSubmit} className="my-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Share Your Experience with this Item
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 font-medium">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Review Headline (e.g. Exceptional fit and premium fabric)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-rose-500"
              />

              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write detailed feedback regarding quality, size fit, and overall value..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-rose-500"
                required
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="divide-y divide-slate-100">
              {reviews.map((rev) => (
                <div key={rev.id} className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-700 text-white rounded text-[11px] font-bold">
                        <span>{rev.rating}</span>
                        <Star className="w-3 h-3 fill-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{rev.title || 'Verified Review'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-700">{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Check className="w-3 h-3" /> Certified Buyer
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related / You May Also Like */}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">
                Similar Styles You May Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
