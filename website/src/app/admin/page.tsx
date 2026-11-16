'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/context/AppContext';
import { Product, Order, OrderStatus, Coupon } from '@/lib/types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Tag,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function AdminPage() {
  const { user, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('cat_men');
  const [subcategory, setSubcategory] = useState('Streetwear');
  const [stock, setStock] = useState('50');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Add Coupon Modal
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('1000');
  const [maxDiscount, setMaxDiscount] = useState('1000');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes, ordRes, cpnRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/products?limit=100'),
        fetch('/api/orders?all=true'),
        fetch('/api/coupons'),
      ]);

      const statsData = await statsRes.json();
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const cpnData = await cpnRes.json();

      if (statsData.stats) setStats(statsData.stats);
      if (statsData.statusBreakdown) setStatusBreakdown(statsData.statusBreakdown);
      if (prodData.products) setProducts(prodData.products);
      if (ordData.orders) setOrders(ordData.orders);
      if (cpnData.coupons) setCoupons(cpnData.coupons);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to update order', 'error');
      }
    } catch {
      showToast('Error updating order status', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Product removed from catalog', 'info');
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !brand) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setIsSubmittingProduct(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          brand,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.5,
          categoryId,
          subcategory,
          stock: Number(stock) || 50,
          description,
          images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Classic Black', 'Navy', 'Oatmeal'],
          specs: { 'Material': 'Premium Quality', 'Fit': 'Regular Fit', 'Warranty': '1 Year' },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('New product added to catalog!', 'success');
        setProducts((prev) => [data.product, ...prev]);
        setShowAddProduct(false);
        setTitle('');
        setPrice('');
        setOriginalPrice('');
        setBrand('');
        setDescription('');
        setImageUrl('');
      } else {
        showToast(data.error || 'Failed to create product', 'error');
      }
    } catch {
      showToast('Error creating product', 'error');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !discountValue) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase().trim(),
          discountType,
          discountValue: Number(discountValue),
          minOrderValue: Number(minOrderValue) || 0,
          maxDiscount: Number(maxDiscount) || 1000,
        }),
      });
      if (res.ok) {
        showToast(`Coupon ${couponCode} created!`, 'success');
        setShowAddCoupon(false);
        setCouponCode('');
        setDiscountValue('');
        loadData();
      }
    } catch {
      showToast('Failed to create coupon', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md space-y-4">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-500">
              You must be signed in with an Administrator account to view this dashboard.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Sign In as Admin
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Admin Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                Control Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Admin Management Console
              </h1>
              <p className="text-xs text-slate-500">Real-time metrics, order fulfillment, product catalog, and promotions</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm transition"
                title="Refresh Metrics"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAddProduct(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-bold space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition ${
                activeTab === 'orders'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-4 h-4" /> Orders Fulfillment ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition ${
                activeTab === 'products'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Products & Inventory ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition ${
                activeTab === 'coupons'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Tag className="w-4 h-4" /> Promo Coupons ({coupons.length})
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Excludes cancelled orders</span>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {stats.totalOrders}
                  </div>
                  <span className="text-[11px] text-indigo-600 font-semibold">Avg: ₹{stats.averageOrderValue.toLocaleString()}</span>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Customers</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {stats.totalCustomers}
                  </div>
                  <span className="text-[11px] text-slate-400">Verified shopper accounts</span>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Inventory</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {stats.totalProducts} Items
                  </div>
                  <span className="text-[11px] text-rose-600 font-semibold">{stats.lowStockCount} Low stock alerts</span>
                </div>
              </div>

              {/* Status Breakdown & Recent Orders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders by Status */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">Orders Status Distribution</h3>
                  <div className="space-y-2">
                    {statusBreakdown.map((s) => (
                      <div key={s.status} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                        <span className="font-semibold text-slate-700">{s.status}</span>
                        <span className="font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">Latest Live Orders</h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 font-mono">{o.orderNumber}</p>
                          <p className="text-slate-400">{o.userName} • {o.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">₹{o.total.toLocaleString()}</p>
                          <span className="text-[10px] font-bold text-emerald-600">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Orders Fulfillment */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Customer Orders Queue</h3>
                <span className="text-xs text-slate-500 font-semibold">{orders.length} total orders placed</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold font-mono text-slate-900">
                          <Link href={`/orders/${o.id}`} className="hover:text-rose-600">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800">{o.userName}</p>
                          <p className="text-slate-400 text-[11px]">{o.userEmail}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          ₹{o.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                            {o.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className="bg-slate-100 font-bold text-xs p-1.5 rounded-lg border border-slate-200 outline-none cursor-pointer"
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Returned">Returned</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Products & Inventory */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Product Catalog Management</h3>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-10 h-12 object-cover rounded-lg border border-slate-100 shrink-0"
                            />
                            <Link href={`/products/${p.slug}`} className="font-bold text-slate-900 hover:text-rose-600 line-clamp-1 max-w-xs">
                              {p.title}
                            </Link>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">{p.brand}</td>
                        <td className="py-3 px-4 text-slate-500">{p.categoryName || p.categoryId}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">₹{p.price.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.stock <= 20 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-600">★ {p.rating}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Coupons */}
          {activeTab === 'coupons' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Marketing & Promotional Coupons</h3>
                <button
                  onClick={() => setShowAddCoupon(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Create Coupon
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-rose-600 text-sm">{c.code}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                        Active
                      </span>
                    </div>
                    <p className="font-bold text-slate-800">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `Flat ₹${c.discountValue} OFF`}
                    </p>
                    <p className="text-slate-500 text-[11px]">Min Order: ₹{c.minOrderValue}</p>
                    {c.maxDiscount && (
                      <p className="text-slate-500 text-[11px]">Max Discount Cap: ₹{c.maxDiscount}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal: Add Product */}
          {showAddProduct && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-bold text-slate-900">Add New Product to Catalog</h3>
                <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Classic Oversized Knit Sweater"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Brand Name</label>
                      <input
                        type="text"
                        required
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g. Zara Studio"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Category</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <option value="cat_men">Men&apos;s Fashion</option>
                        <option value="cat_women">Women&apos;s Fashion</option>
                        <option value="cat_footwear">Footwear & Sneakers</option>
                        <option value="cat_electronics">Electronics & Audio</option>
                        <option value="cat_accessories">Watches & Accessories</option>
                        <option value="cat_beauty">Beauty & Grooming</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="1999"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Original Price (₹)</label>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="3499"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Initial Stock</label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="50"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Image URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter detailed fabric, styling and feature notes..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingProduct}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                    >
                      {isSubmittingProduct ? 'Saving...' : 'Save Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Add Coupon */}
          {showAddCoupon && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900">Create New Promo Coupon</h3>
                <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FLASH30"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Discount Type</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Discount Value</label>
                      <input
                        type="number"
                        required
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder="20"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Min Order Value (₹)</label>
                      <input
                        type="number"
                        value={minOrderValue}
                        onChange={(e) => setMinOrderValue(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Max Discount Cap (₹)</label>
                      <input
                        type="number"
                        value={maxDiscount}
                        onChange={(e) => setMaxDiscount(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCoupon(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition"
                    >
                      Create Coupon
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
