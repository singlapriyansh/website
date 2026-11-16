'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Package,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Percent,
} from 'lucide-react';
import { Product } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const { user, cartCount, wishlistCount, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced live search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const data = await res.json();
        if (data.products) {
          setSuggestions(data.products);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Search suggestion error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listeners
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Top promotional bar */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
              Exclusive Sale
            </span>
            <span className="hidden sm:inline text-slate-300">
              Extra 20% OFF on all orders using code <strong className="text-amber-400">FESTIVE20</strong>
            </span>
          </div>
          <div className="flex items-center gap-6 text-slate-300">
            <span className="hidden md:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Genuine Products
            </span>
            <Link href="/orders" className="hover:text-white transition flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> Track Order
            </Link>
            <Link href="/contact" className="hover:text-white transition">
              Customer Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Shop<span className="text-rose-600">Sphere</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-1">
                Fashion & Tech
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Bar with Live Suggestions */}
        <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search for clothing, sneakers, electronics, watches and more..."
              className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm pl-11 pr-24 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-slate-900 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 flex items-center justify-between">
                <span>Products matching &quot;{searchQuery}&quot;</span>
                <span className="text-[11px] text-rose-600 font-medium">{suggestions.length} results</span>
              </div>
              <div className="divide-y divide-slate-50">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 transition"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">{item.brand}</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">₹{item.price.toLocaleString()}</span>
                      {item.discountPercent > 0 && (
                        <p className="text-xs text-rose-600 font-semibold">{item.discountPercent}% OFF</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/products?search=${encodeURIComponent(searchQuery)}`}
                onClick={() => setShowSuggestions(false)}
                className="block text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-rose-600 transition"
              >
                View all results for &quot;{searchQuery}&quot; →
              </Link>
            </div>
          )}
        </div>

        {/* Right Action Icons: Account, Wishlist, Cart */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Account Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs text-slate-400 font-medium">Hello,</span>
                <span className="text-xs font-bold text-slate-800 -mt-0.5 truncate max-w-[100px]">
                  {user ? user.name.split(' ')[0] : 'Sign In'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[10px] rounded uppercase">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 transition"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" /> My Profile & Addresses
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Package className="w-4 h-4 text-slate-400" /> My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Heart className="w-4 h-4 text-slate-400" /> My Wishlist ({wishlistCount})
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex flex-col gap-3">
                    <p className="text-sm font-semibold text-slate-900">Welcome to ShopSphere</p>
                    <p className="text-xs text-slate-500">Sign in to track orders, save items to your wishlist, and checkout fast.</p>
                    <Link
                      href="/auth/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full py-2 bg-slate-900 hover:bg-rose-600 text-white text-center text-xs font-bold rounded-xl transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full py-2 border border-slate-200 hover:border-slate-400 text-slate-700 text-center text-xs font-bold rounded-xl transition"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="relative p-2 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-scale">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag / Cart */}
          <Link
            href="/cart"
            className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition relative"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-slate-800">
              Bag
            </span>
          </Link>
        </div>
      </div>

      {/* Category Navigation Strip */}
      <nav className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/products" className="text-slate-900 hover:text-rose-600 transition flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" /> All Products
            </Link>
            <Link href="/products?category=men" className="hover:text-rose-600 transition whitespace-nowrap">
              Men
            </Link>
            <Link href="/products?category=women" className="hover:text-rose-600 transition whitespace-nowrap">
              Women
            </Link>
            <Link href="/products?category=footwear" className="hover:text-rose-600 transition whitespace-nowrap">
              Footwear
            </Link>
            <Link href="/products?category=electronics" className="hover:text-rose-600 transition whitespace-nowrap">
              Electronics
            </Link>
            <Link href="/products?category=accessories" className="hover:text-rose-600 transition whitespace-nowrap">
              Watches & More
            </Link>
            <Link href="/products?category=beauty" className="hover:text-rose-600 transition whitespace-nowrap">
              Beauty
            </Link>
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
            <Link
              href="/products?deal=1"
              className="text-rose-600 hover:text-rose-700 transition flex items-center gap-1 whitespace-nowrap font-extrabold"
            >
              <Percent className="w-3.5 h-3.5" /> Deals of the Day
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-100 text-slate-900 text-sm pl-10 pr-4 py-2 rounded-xl outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-slate-800">
            <Link
              href="/products?category=men"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Men&apos;s Fashion
            </Link>
            <Link
              href="/products?category=women"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Women&apos;s Fashion
            </Link>
            <Link
              href="/products?category=footwear"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Footwear & Kicks
            </Link>
            <Link
              href="/products?category=electronics"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Electronics
            </Link>
            <Link
              href="/products?category=accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Accessories
            </Link>
            <Link
              href="/products?deal=1"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-rose-50 text-rose-600 font-bold"
            >
              Hot Deals
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-700 p-2"
                >
                  My Orders
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-700 p-2"
                >
                  My Profile & Addresses
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-bold text-indigo-600 p-2"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-left text-sm font-semibold text-rose-600 p-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold bg-slate-900 text-white rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold border border-slate-300 text-slate-700 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
