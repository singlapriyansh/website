import { Product } from './types';

export interface DBProductRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  original_price: number;
  discount_percent: number;
  category_id: string;
  category_name?: string;
  subcategory: string;
  brand: string;
  rating: number;
  reviews_count: number;
  stock: number;
  in_stock: number;
  is_featured: number;
  is_trending: number;
  is_deal: number;
  delivery_days: number;
  images_json: string;
  sizes_json: string;
  colors_json: string;
  specs_json: string;
  created_at: string;
}

export function formatProduct(row: DBProductRow): Product {
  let images: string[] = [];
  let sizes: string[] = [];
  let colors: string[] = [];
  let specs: Record<string, string> = {};

  try { images = JSON.parse(row.images_json); } catch { images = []; }
  try { sizes = JSON.parse(row.sizes_json); } catch { sizes = []; }
  try { colors = JSON.parse(row.colors_json); } catch { colors = []; }
  try { specs = JSON.parse(row.specs_json); } catch { specs = {}; }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: row.price,
    originalPrice: row.original_price,
    discountPercent: row.discount_percent,
    categoryId: row.category_id,
    categoryName: row.category_name,
    subcategory: row.subcategory,
    brand: row.brand,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    stock: row.stock,
    inStock: Boolean(row.in_stock && row.stock > 0),
    isFeatured: Boolean(row.is_featured),
    isTrending: Boolean(row.is_trending),
    isDeal: Boolean(row.is_deal),
    deliveryDays: row.delivery_days,
    images,
    sizes,
    colors,
    specs,
    createdAt: row.created_at,
  };
}
