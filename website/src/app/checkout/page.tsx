'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/context/AppContext';
import { Address } from '@/lib/types';
import {
  ShieldCheck,
  Check,
  CreditCard,
  Smartphone,
  Banknote,
  Truck,
  Plus,
  MapPin,
  Lock,
  ArrowRight,
} from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCoupon = searchParams.get('coupon') || '';

  const { cart, cartCount, cartSubtotal, user, showToast, refreshCart } = useApp();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New Address Form State
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('Karnataka');
  const [newPostalCode, setNewPostalCode] = useState('');

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING' | 'COD'>('RAZORPAY_UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Load user addresses
  useEffect(() => {
    async function fetchAddresses() {
      if (!user) {
        setLoadingAddresses(false);
        return;
      }
      try {
        const res = await fetch('/api/addresses');
        const data = await res.json();
        if (data.addresses && data.addresses.length > 0) {
          setAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowAddressForm(true);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, [user]);

  // Validate initial coupon
  useEffect(() => {
    if (initialCoupon && cartSubtotal > 0) {
      fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: initialCoupon, orderAmount: cartSubtotal }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.valid) setDiscountAmount(d.coupon.discountAmount);
        })
        .catch(() => {});
    }
  }, [initialCoupon, cartSubtotal]);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone || !newStreet || !newCity || !newPostalCode) {
      showToast('Please fill out all address fields', 'error');
      return;
    }

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newFullName,
          phone: newPhone,
          street: newStreet,
          city: newCity,
          state: newState,
          postalCode: newPostalCode,
          isDefault: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses((prev) => [data.address, ...prev]);
        setSelectedAddressId(data.address.id);
        setShowAddressForm(false);
        showToast('Address saved successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to save address', 'error');
      }
    } catch {
      showToast('Error saving address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      showToast('Please sign in to place your order', 'error');
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (!selectedAddressId && addresses.length === 0) {
      showToast('Please add a delivery address', 'error');
      setShowAddressForm(true);
      return;
    }

    try {
      setIsPlacingOrder(true);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          couponCode: couponCode.trim() || undefined,
          paymentId:
            paymentMethod === 'COD'
              ? 'COD_' + Date.now()
              : 'pay_rzp_mock_' + Math.random().toString(36).substring(2, 9),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to place order', 'error');
        setIsPlacingOrder(false);
        return;
      }

      showToast('🎉 Order placed successfully!', 'success');
      await refreshCart();
      router.push(`/orders/${data.order.id}`);
    } catch {
      showToast('Network error placing order', 'error');
      setIsPlacingOrder(false);
    }
  };

  const shippingFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 99;
  const finalPayable = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  if (cartCount === 0 && !isPlacingOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="max-w-xl mx-auto py-20 px-4 text-center">
          <h2 className="text-xl font-bold text-slate-900">Your bag is empty</h2>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Go to Shop
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center gap-2 mb-8">
        <Lock className="w-5 h-5 text-emerald-600" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Secure Checkout & Payment
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Address Selection & Payment (7 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Delivery Address */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-900">Select Delivery Address</h2>
              </div>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              )}
            </div>

            {/* Address List */}
            {!showAddressForm && (
              <div className="space-y-3 pt-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                      selectedAddressId === addr.id
                        ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 accent-rose-600 cursor-pointer"
                    />
                    <div className="space-y-1 text-xs text-slate-600 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-600">
                          {addr.phone}
                        </span>
                      </div>
                      <p className="text-slate-700">{addr.street}</p>
                      <p className="text-slate-500">
                        {addr.city}, {addr.state} - <strong className="text-slate-800">{addr.postalCode}</strong>
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* New Address Inline Form */}
            {showAddressForm && (
              <form onSubmit={handleAddNewAddress} className="pt-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="Receiver's name"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">10-Digit Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-xs">Flat, House No, Building, Street</label>
                  <input
                    type="text"
                    required
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="e.g. 402, Skyline Residency, 12th Cross Road"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Bangalore"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="Karnataka"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Postal PIN Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      placeholder="560038"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition"
                  >
                    Save & Use This Address
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Step 2: Payment Method */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Payment Method (Razorpay Test Mode)</h2>
                <p className="text-xs text-slate-400">Encrypted 256-bit payment gateway integration</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* UPI Option */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'RAZORPAY_UPI'
                    ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'RAZORPAY_UPI'}
                  onChange={() => setPaymentMethod('RAZORPAY_UPI')}
                  className="mt-1 accent-rose-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" /> UPI (Instant Pay)
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Fastest
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Google Pay, PhonePe, Paytm, BHIM</p>

                  {paymentMethod === 'RAZORPAY_UPI' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank / yourname@upi"
                        className="w-full max-w-sm p-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  )}
                </div>
              </label>

              {/* Card Option */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'RAZORPAY_CARD'
                    ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'RAZORPAY_CARD'}
                  onChange={() => setPaymentMethod('RAZORPAY_CARD')}
                  className="mt-1 accent-rose-600"
                />
                <div className="flex-1">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" /> Credit / Debit Card (Razorpay)
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Visa, Mastercard, RuPay, American Express</p>

                  {paymentMethod === 'RAZORPAY_CARD' && (
                    <div className="mt-3 grid grid-cols-3 gap-2 max-w-md text-xs">
                      <div className="col-span-3">
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="Card Number (4000 0000 0000 0000)"
                          className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                        />
                      </div>
                      <p className="col-span-3 text-[10px] text-slate-400">
                        🔒 Test mode simulation. Card details are processed in memory and never stored in the database.
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {/* Cash On Delivery */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 accent-rose-600"
                />
                <div className="flex-1">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-700" /> Cash on Delivery (COD)
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Pay with cash or UPI QR scan upon delivery at your doorstep.</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 sticky top-28">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Items Thumbnails preview */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {cart.map((it) => (
                <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={it.product.images[0]}
                      alt={it.product.title}
                      className="w-10 h-12 object-cover rounded-lg border border-slate-100"
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate max-w-[140px]">{it.product.title}</p>
                      <p className="text-[11px] text-slate-400">Qty: {it.quantity} {it.size ? `• Size: ${it.size}` : ''}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">₹{(it.product.price * it.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">₹{cartSubtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="font-bold">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Delivery Charge</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-800">₹{shippingFee}</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">Final Payable Amount</span>
              <span className="text-2xl font-black text-rose-600">
                ₹{finalPayable.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || addresses.length === 0}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <span>{isPlacingOrder ? 'Processing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure 256-Bit SSL Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-sm font-semibold">Loading checkout...</div>}>
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
