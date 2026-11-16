'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/context/AppContext';
import { Address } from '@/lib/types';
import { User as UserIcon, MapPin, Package, Heart, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, showToast } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    async function loadAddresses() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/addresses');
        const data = await res.json();
        if (data.addresses) setAddresses(data.addresses);
      } catch (err) {
        console.error('Addresses fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAddresses();
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !street || !city || !postalCode) {
      showToast('Please fill all fields', 'error');
      return;
    }

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, street, city, state, postalCode }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Address added!', 'success');
        setAddresses((prev) => [data.address, ...prev]);
        setShowAddModal(false);
        setFullName('');
        setPhone('');
        setStreet('');
        setCity('');
        setPostalCode('');
      } else {
        showToast(data.error || 'Failed to add address', 'error');
      }
    } catch {
      showToast('Error adding address', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        showToast('Address deleted', 'info');
      }
    } catch {
      showToast('Error deleting address', 'error');
    }
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-sm">
            <h2 className="text-lg font-bold text-slate-900">Please Sign In</h2>
            <Link
              href="/auth/login"
              className="mt-4 inline-block px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Sign In
            </Link>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop'}
                alt={user?.name || 'User'}
                className="w-16 h-16 rounded-full object-cover border-2 border-rose-500 shadow-md"
              />
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                  {user?.role} Account
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{user?.name}</h1>
                <p className="text-xs text-slate-500">{user?.email} {user?.phone ? `• ${user.phone}` : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/orders"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Package className="w-4 h-4 text-slate-600" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/wishlist"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Wishlist</span>
              </Link>
            </div>
          </div>

          {/* Saved Addresses Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                <h2 className="text-base font-black text-slate-900">Saved Delivery Addresses</h2>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>

            {/* Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl border border-slate-200/80 relative space-y-2 text-xs text-slate-600 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{a.fullName}</span>
                    {a.isDefault && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800">{a.street}</p>
                  <p className="text-slate-500">{a.city}, {a.state} - {a.postalCode}</p>
                  <p className="text-slate-600 font-medium">Contact: {a.phone}</p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleDeleteAddress(a.id)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Address Modal Form */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900">Add New Delivery Address</h3>
                <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Mobile Phone</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Flat / Street / Area</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
