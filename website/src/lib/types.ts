export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  categoryId: string;
  categoryName?: string;
  subcategory: string;
  brand: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  inStock: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isDeal: boolean;
  deliveryDays: number;
  images: string[];
  sizes: string[];
  colors: string[];
  specs: Record<string, string>;
  createdAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  description: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  size?: string;
  color?: string;
  quantity: number;
  createdAt?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  expiresAt?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'RAZORPAY_NETBANKING' | 'COD';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentId?: string;
  shippingAddress: Address;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}
