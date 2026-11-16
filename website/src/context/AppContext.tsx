'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, CartItem, WishlistItem } from '@/lib/types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  cartSavings: number;
  wishlist: WishlistItem[];
  wishlistCount: number;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  addToCart: (productId: string, size?: string, color?: string, quantity?: number) => Promise<boolean>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartSavings, setCartSavings] = useState(0);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.items) {
        setCart(data.items);
        setCartCount(data.count || 0);
        setCartSubtotal(data.subtotal || 0);
        setCartTotal(data.total || 0);
        setCartSavings(data.savings || 0);
      }
    } catch (e) {
      console.error('Error fetching cart:', e);
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (data.items) {
        setWishlist(data.items);
      }
    } catch (e) {
      console.error('Error fetching wishlist:', e);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    refreshCart();
    refreshWishlist();
  }, [refreshUser, refreshCart, refreshWishlist]);

  const addToCart = async (productId: string, size?: string, color?: string, quantity = 1): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, color, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add item to bag', 'error');
        return false;
      }
      showToast('Item successfully added to your shopping bag!', 'success');
      await refreshCart();
      return true;
    } catch {
      showToast('Network error adding to bag', 'error');
      return false;
    }
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not update quantity', 'error');
        return false;
      }
      await refreshCart();
      return true;
    } catch {
      showToast('Error updating quantity', 'error');
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, { method: 'DELETE' });
      if (!res.ok) {
        showToast('Failed to remove item', 'error');
        return false;
      }
      showToast('Item removed from bag', 'info');
      await refreshCart();
      return true;
    } catch {
      showToast('Error removing item', 'error');
      return false;
    }
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Wishlist update failed', 'error');
        return false;
      }
      showToast(data.message || (data.inWishlist ? 'Saved to Wishlist' : 'Removed from Wishlist'), 'success');
      await refreshWishlist();
      return true;
    } catch {
      showToast('Error updating wishlist', 'error');
      return false;
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.productId === productId);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      showToast('You have been logged out', 'info');
      await refreshCart();
      await refreshWishlist();
      window.location.href = '/';
    } catch {
      showToast('Logout failed', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        cart,
        cartCount,
        cartSubtotal,
        cartTotal,
        cartSavings,
        wishlist,
        wishlistCount: wishlist.length,
        toasts,
        showToast,
        removeToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        toggleWishlist,
        isInWishlist,
        refreshCart,
        refreshWishlist,
        refreshUser,
        logout,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                : toast.type === 'error'
                ? 'bg-slate-900 text-rose-400 border-rose-500/30'
                : 'bg-slate-900 text-sky-400 border-sky-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full animate-ping bg-current" />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-slate-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
