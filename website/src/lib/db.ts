import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'ecommerce.db');

// Singleton database instance
declare global {
  // eslint-disable-next-line no-var
  var __sqlite_db__: DatabaseSync | undefined;
}

function getDatabase(): DatabaseSync {
  if (!global.__sqlite_db__) {
    const db = new DatabaseSync(dbPath);
    db.exec('PRAGMA busy_timeout = 15000;');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');
    initSchema(db);
    seedData(db);
    global.__sqlite_db__ = db;
  }
  return global.__sqlite_db__;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      phone TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL NOT NULL,
      discount_percent INTEGER NOT NULL,
      category_id TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      brand TEXT NOT NULL,
      rating REAL DEFAULT 4.5,
      reviews_count INTEGER DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 50,
      in_stock INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_trending INTEGER DEFAULT 0,
      is_deal INTEGER DEFAULT 0,
      delivery_days INTEGER DEFAULT 3,
      images_json TEXT NOT NULL,
      sizes_json TEXT NOT NULL,
      colors_json TEXT NOT NULL,
      specs_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      size TEXT,
      color TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount REAL,
      is_active INTEGER DEFAULT 1,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      coupon_code TEXT,
      shipping_fee REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'COMPLETED',
      payment_id TEXT,
      shipping_address_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      product_image TEXT NOT NULL,
      size TEXT,
      color TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT,
      comment TEXT NOT NULL,
      verified_purchase INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedData(db: DatabaseSync) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  const adminHash = bcrypt.hashSync('Admin@123', 10);
  const customerHash = bcrypt.hashSync('Customer@123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('u_admin', 'Administrator', 'admin@website.com', adminHash, 'admin', '+91 98765 43210', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop');
  insertUser.run('u_cust1', 'Aarav Sharma', 'customer@website.com', customerHash, 'customer', '+91 91234 56789', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop');

  const insertAddress = db.prepare(`
    INSERT INTO addresses (id, user_id, full_name, phone, street, city, state, postal_code, country, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAddress.run(
    'addr_1',
    'u_cust1',
    'Aarav Sharma',
    '+91 91234 56789',
    'Flat 402, Prestige Palms, 12th Main Road, Indiranagar',
    'Bangalore',
    'Karnataka',
    '560038',
    'India',
    1
  );

  const insertCat = db.prepare(`
    INSERT INTO categories (id, slug, name, image, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const categories = [
    { id: 'cat_men', slug: 'men', name: "Men's Fashion", image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&auto=format&fit=crop', description: 'Curated apparel, streetwear, and formal attire for men.' },
    { id: 'cat_women', slug: 'women', name: "Women's Fashion", image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop', description: 'Trendsetting ethnic wear, dresses, and designer essentials.' },
    { id: 'cat_footwear', slug: 'footwear', name: 'Footwear & Sneakers', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop', description: 'Performance athletic shoes, street kicks, and leather loafers.' },
    { id: 'cat_electronics', slug: 'electronics', name: 'Electronics & Gadgets', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop', description: 'Premium audio, smart wearables, and computing essentials.' },
    { id: 'cat_accessories', slug: 'accessories', name: 'Watches & Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop', description: 'Luxury timepieces, leather goods, and polarized sunglasses.' },
    { id: 'cat_beauty', slug: 'beauty', name: 'Beauty & Grooming', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop', description: 'Luxury skincare, fragrances, and essential grooming kits.' },
  ];

  for (const c of categories) {
    insertCat.run(c.id, c.slug, c.name, c.image, c.description);
  }

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, title, slug, description, price, original_price, discount_percent,
      category_id, subcategory, brand, rating, reviews_count, stock, in_stock,
      is_featured, is_trending, is_deal, delivery_days, images_json, sizes_json, colors_json, specs_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    {
      id: 'prod_1',
      title: 'Studio Relaxed Heavyweight Cotton Hoodie',
      slug: 'studio-relaxed-heavyweight-cotton-hoodie',
      description: 'Crafted from ultra-soft 450 GSM French terry cotton with dropped shoulders, kangaroo pocket, and ribbed trims. Built for maximum comfort and modern streetwear silhouette.',
      price: 2499,
      original_price: 4999,
      discount_percent: 50,
      category_id: 'cat_men',
      subcategory: 'Hoodies & Sweatshirts',
      brand: 'AURA Originals',
      rating: 4.8,
      reviews_count: 342,
      stock: 45,
      in_stock: 1,
      is_featured: 1,
      is_trending: 1,
      is_deal: 1,
      delivery_days: 2,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors_json: JSON.stringify(['Oatmeal Heather', 'Vintage Black', 'Sage Green']),
      specs_json: JSON.stringify({
        'Material': '100% Organic French Terry Cotton',
        'Fabric Weight': '450 GSM',
        'Fit': 'Oversized Relaxed Fit',
        'Care': 'Machine wash cold, lay flat to dry',
        'Origin': 'Crafted in Tirupur, India'
      })
    },
    {
      id: 'prod_2',
      title: 'Structured Oxford Tailored Linen Shirt',
      slug: 'structured-oxford-tailored-linen-shirt',
      description: 'Pure European flax linen woven for breathable all-day elegance. Features mother-of-pearl buttons, a tailored semi-spread collar, and clean single-needle stitching.',
      price: 1999,
      original_price: 3499,
      discount_percent: 43,
      category_id: 'cat_men',
      subcategory: 'Casual Shirts',
      brand: 'Raymond Artisan',
      rating: 4.7,
      reviews_count: 184,
      stock: 30,
      in_stock: 1,
      is_featured: 1,
      is_trending: 0,
      is_deal: 0,
      delivery_days: 3,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['38', '40', '42', '44']),
      colors_json: JSON.stringify(['Sky Blue', 'Crisp White', 'Soft Olive']),
      specs_json: JSON.stringify({
        'Material': '100% Normandy Linen',
        'Collar': 'Semi-Spread Collar',
        'Fit': 'Slim Tailored',
        'Pattern': 'Solid Woven',
        'Care': 'Gentle wash, steam iron'
      })
    },
    {
      id: 'prod_3',
      title: 'Embroidered Chanderi Silk Anarkali Kurta Set',
      slug: 'embroidered-chanderi-silk-anarkali-kurta-set',
      description: 'Intricately embroidered with gold zari threadwork on luxurious Chanderi silk. Comes paired with tailored cigarette pants and a feather-light organza dupatta with scalloped borders.',
      price: 4599,
      original_price: 8999,
      discount_percent: 49,
      category_id: 'cat_women',
      subcategory: 'Ethnic Wear',
      brand: 'Biba Heritage',
      rating: 4.9,
      reviews_count: 520,
      stock: 25,
      in_stock: 1,
      is_featured: 1,
      is_trending: 1,
      is_deal: 1,
      delivery_days: 2,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors_json: JSON.stringify(['Royal Emerald', 'Deep Crimson', 'Blush Rose']),
      specs_json: JSON.stringify({
        'Fabric': 'Chanderi Silk & Organza',
        'Work': 'Fine Gold Zari Hand Embroidery',
        'Occasion': 'Festive & Wedding',
        'Includes': 'Kurta, Pants, Organza Dupatta',
        'Care': 'Dry clean only'
      })
    },
    {
      id: 'prod_4',
      title: 'Floral Tiered Bohemian Maxi Dress',
      slug: 'floral-tiered-bohemian-maxi-dress',
      description: 'Flowing silhouette with artisanal botanical print, flutter sleeves, and cinched smocked waist. Effortless transition from beach holidays to garden brunches.',
      price: 2199,
      original_price: 3999,
      discount_percent: 45,
      category_id: 'cat_women',
      subcategory: 'Dresses',
      brand: 'Zara Studio',
      rating: 4.6,
      reviews_count: 215,
      stock: 60,
      in_stock: 1,
      is_featured: 0,
      is_trending: 1,
      is_deal: 0,
      delivery_days: 3,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['XS', 'S', 'M', 'L']),
      colors_json: JSON.stringify(['Pastel Floral', 'Navy Botanicals']),
      specs_json: JSON.stringify({
        'Fabric': '100% Breathable Viscose Rayon',
        'Length': 'Maxi (Ankle Length)',
        'Neckline': 'V-Neck with Tie-up Tassels',
        'Fit': 'Flattering A-Line Fit'
      })
    },
    {
      id: 'prod_5',
      title: 'Air Pulse Pro Active Noise Cancelling Headphones',
      slug: 'air-pulse-pro-active-noise-cancelling-headphones',
      description: 'Flagship 40mm custom planar drivers deliver audiophile-grade high-resolution sound. Features dual-chip active noise cancellation up to 45dB, 60-hour playtime, and multipoint Bluetooth 5.4.',
      price: 8999,
      original_price: 16999,
      discount_percent: 47,
      category_id: 'cat_electronics',
      subcategory: 'Audio',
      brand: 'Sony Acoustic',
      rating: 4.9,
      reviews_count: 1420,
      stock: 40,
      in_stock: 1,
      is_featured: 1,
      is_trending: 1,
      is_deal: 1,
      delivery_days: 1,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['One Size']),
      colors_json: JSON.stringify(['Matte Midnight Black', 'Silver Moon', 'Sandstone Tan']),
      specs_json: JSON.stringify({
        'Driver Size': '40mm Titanium Composite',
        'Battery Life': 'Up to 60 Hours with Quick Charge (10 min = 5 hours)',
        'Noise Cancellation': 'Hybrid Adaptive ANC (Up to 45dB)',
        'Connectivity': 'Bluetooth 5.4, AAC, LDAC, 3.5mm Aux',
        'Warranty': '2 Year Comprehensive Brand Warranty'
      })
    },
    {
      id: 'prod_6',
      title: 'Apex Mechanical Wireless RGB Keyboard',
      slug: 'apex-mechanical-wireless-rgb-keyboard',
      description: 'Hot-swappable tactile linear switches encased in CNC-machined aerospace aluminum. Per-key south-facing RGB, gasket mount dampening, and triple-mode wireless connectivity.',
      price: 4999,
      original_price: 7999,
      discount_percent: 38,
      category_id: 'cat_electronics',
      subcategory: 'Computing',
      brand: 'Logitech G',
      rating: 4.8,
      reviews_count: 412,
      stock: 20,
      in_stock: 1,
      is_featured: 0,
      is_trending: 1,
      is_deal: 0,
      delivery_days: 2,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['75% Layout', 'Full Size 104-Key']),
      colors_json: JSON.stringify(['Carbon Gray', 'Retro White']),
      specs_json: JSON.stringify({
        'Switch Type': 'Gateron Pro Yellow (Pre-Lubed)',
        'Keycaps': 'Double-shot PBT Cherry Profile',
        'Mount': 'Gasket Mounted with Poron Foam',
        'Battery': '4000mAh Rechargeable (200 hours without RGB)',
        'Compatibility': 'macOS, Windows, iOS, Android'
      })
    },
    {
      id: 'prod_7',
      title: 'Legacy Retro Court Leather Sneakers',
      slug: 'legacy-retro-court-leather-sneakers',
      description: 'Hand-burnished Italian Nappa leather upper resting on cushioned OrthoLite insoles and vulcanized gum rubber soles. Timeless low-top silhouette engineered for all-day comfort.',
      price: 3799,
      original_price: 6499,
      discount_percent: 42,
      category_id: 'cat_footwear',
      subcategory: 'Casual Sneakers',
      brand: 'Nike Originals',
      rating: 4.8,
      reviews_count: 670,
      stock: 35,
      in_stock: 1,
      is_featured: 1,
      is_trending: 1,
      is_deal: 0,
      delivery_days: 2,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']),
      colors_json: JSON.stringify(['Classic White / Red', 'All White', 'Triple Black']),
      specs_json: JSON.stringify({
        'Upper': 'Full Grain Nappa Leather',
        'Insole': 'Ergonomic OrthoLite Cushioned',
        'Sole': 'Anti-slip Vulcanized Gum Rubber',
        'Closure': 'Lace-Up with Waxed Cotton Laces'
      })
    },
    {
      id: 'prod_8',
      title: 'AeroGlide Carbon Fiber Marathon Running Shoes',
      slug: 'aeroglide-carbon-fiber-marathon-running-shoes',
      description: 'Supercritical PEBA foam midsole embedded with full-length contoured carbon fiber plate. Delivers 85% energy return with featherlight 190g weight for breaking personal records.',
      price: 6499,
      original_price: 11999,
      discount_percent: 46,
      category_id: 'cat_footwear',
      subcategory: 'Sports & Running',
      brand: 'Adidas Performance',
      rating: 4.9,
      reviews_count: 289,
      stock: 18,
      in_stock: 1,
      is_featured: 0,
      is_trending: 1,
      is_deal: 1,
      delivery_days: 2,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']),
      colors_json: JSON.stringify(['Electric Volt / Cyan', 'Sunset Orange']),
      specs_json: JSON.stringify({
        'Weight': '190g (Size UK 9)',
        'Stack Height': '39mm Heel / 31mm Forefoot (8mm Drop)',
        'Midsole': 'Supercritical PEBA Foam + Carbon Plate',
        'Upper': 'AtomKnit Monofilament Mesh'
      })
    },
    {
      id: 'prod_9',
      title: 'Voyager Chronograph Automatic Sapphire Watch',
      slug: 'voyager-chronograph-automatic-sapphire-watch',
      description: '316L surgical stainless steel casing with double-domed anti-reflective sapphire crystal. Powered by a 24-jewel Japanese automatic movement with 42-hour power reserve.',
      price: 11499,
      original_price: 19999,
      discount_percent: 43,
      category_id: 'cat_accessories',
      subcategory: 'Luxury Watches',
      brand: 'Fossil Heritage',
      rating: 4.9,
      reviews_count: 488,
      stock: 15,
      in_stock: 1,
      is_featured: 1,
      is_trending: 1,
      is_deal: 1,
      delivery_days: 2,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['41mm Case']),
      colors_json: JSON.stringify(['Sunray Navy / Silver', 'Emerald Green / Gold', 'Onyx Black']),
      specs_json: JSON.stringify({
        'Movement': 'Automatic Mechanical (Self-Winding)',
        'Glass': 'Anti-Reflective Scratchproof Sapphire Crystal',
        'Water Resistance': '10 ATM (100 Meters / 330 Feet)',
        'Strap': 'Solid 316L Link Bracelet with Deployant Clasp',
        'Warranty': '3 Year International Manufacturer Warranty'
      })
    },
    {
      id: 'prod_10',
      title: 'Handcrafted Full-Grain Leather Bi-Fold Wallet',
      slug: 'handcrafted-full-grain-leather-bi-fold-wallet',
      description: 'Vegetable-tanned full-grain leather that patinas beautifully over years of use. Features 8 card slots, RFID blocking layer, divided currency compartment, and contrast saddle stitching.',
      price: 1299,
      original_price: 2499,
      discount_percent: 48,
      category_id: 'cat_accessories',
      subcategory: 'Leather Goods',
      brand: 'Wildhorn Artisans',
      rating: 4.7,
      reviews_count: 812,
      stock: 75,
      in_stock: 1,
      is_featured: 0,
      is_trending: 0,
      is_deal: 1,
      delivery_days: 3,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['Standard']),
      colors_json: JSON.stringify(['Bourbon Tan', 'Espresso Dark Brown', 'Jet Black']),
      specs_json: JSON.stringify({
        'Material': '100% Full-Grain Vegetable-Tanned Cowhide',
        'Security': 'Built-in Military Grade RFID Shielding',
        'Capacity': '8 Card Slots, 2 Hidden Pockets, 2 Bill Slots',
        'Dimensions': '11.5 cm x 9.5 cm x 1.5 cm'
      })
    },
    {
      id: 'prod_11',
      title: 'Midnight Botanical Night Recovery Facial Elixir',
      slug: 'midnight-botanical-night-recovery-facial-elixir',
      description: 'Cold-pressed botanical serum infused with Bakuchiol (gentle retinol alternative), Squalane, and Blue Tansy. Restores moisture barrier, evens complexion, and plumps fine lines overnight.',
      price: 1899,
      original_price: 3200,
      discount_percent: 41,
      category_id: 'cat_beauty',
      subcategory: 'Skincare',
      brand: 'Forest Botanics',
      rating: 4.9,
      reviews_count: 620,
      stock: 50,
      in_stock: 1,
      is_featured: 1,
      is_trending: 1,
      is_deal: 0,
      delivery_days: 2,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1608248597359-54332906eb6b?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['30ml Dropper Bottle', '50ml Deluxe']),
      colors_json: JSON.stringify(['Natural']),
      specs_json: JSON.stringify({
        'Key Ingredients': 'Bakuchiol 2%, Olive Squalane, Blue Tansy, Rosehip',
        'Skin Type': 'All Skin Types (including sensitive and acne-prone)',
        'Standards': 'Cruelty-Free, Vegan, Paraben & Sulfate Free',
        'Volume': '30 ml / 1.0 fl. oz.'
      })
    },
    {
      id: 'prod_12',
      title: 'Heritage Aviator Polarized Titanium Sunglasses',
      slug: 'heritage-aviator-polarized-titanium-sunglasses',
      description: 'Ultra-lightweight aerospace titanium frame weighing only 18 grams. Precision polarized nylon lenses with UV400 flash mirror coating and oleophobic fingerprint resistance.',
      price: 3299,
      original_price: 5999,
      discount_percent: 45,
      category_id: 'cat_accessories',
      subcategory: 'Eyewear',
      brand: 'Ray-Ban Collection',
      rating: 4.8,
      reviews_count: 310,
      stock: 40,
      in_stock: 1,
      is_featured: 0,
      is_trending: 1,
      is_deal: 1,
      delivery_days: 2,
      images_json: JSON.stringify([
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop'
      ]),
      sizes_json: JSON.stringify(['55mm Medium', '58mm Large']),
      colors_json: JSON.stringify(['Gunmetal / Gradient Grey', 'Gold / G-15 Green']),
      specs_json: JSON.stringify({
        'Frame': 'Aerospace Beta-Titanium (18g)',
        'Lenses': 'Polarized Tri-Acetate Cellulose (TAC)',
        'UV Protection': '100% UVA/UVB (UV400)',
        'Includes': 'Hard Leather Protective Case & Microfiber Cloth'
      })
    }
  ];

  for (const p of products) {
    insertProduct.run(
      p.id, p.title, p.slug, p.description, p.price, p.original_price, p.discount_percent,
      p.category_id, p.subcategory, p.brand, p.rating, p.reviews_count, p.stock, p.in_stock,
      p.is_featured, p.is_trending, p.is_deal, p.delivery_days,
      p.images_json, p.sizes_json, p.colors_json, p.specs_json
    );
  }

  // Active coupons
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, max_discount, is_active, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCoupon.run('cpn_1', 'WELCOME10', 'percentage', 10, 999, 1000, 1, '2027-12-31');
  insertCoupon.run('cpn_2', 'FLAT500', 'fixed', 500, 2999, 500, 1, '2027-12-31');
  insertCoupon.run('cpn_3', 'FESTIVE20', 'percentage', 20, 1999, 1500, 1, '2027-12-31');

  // Seed sample reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, product_id, user_id, user_name, rating, title, comment, verified_purchase)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertReview.run(
    'rev_1',
    'prod_1',
    'u_cust1',
    'Aarav Sharma',
    5,
    'Exceptional quality and heavyweight feel!',
    'The 450 GSM fabric is thick, warm, and holds its shape even after multiple washes. The Oatmeal heather color looks even better in person than in pictures.',
    1
  );
  insertReview.run(
    'rev_2',
    'prod_5',
    'u_cust1',
    'Aarav Sharma',
    5,
    'Best ANC headphones at this price point',
    'Noise cancellation cuts out all metro noise effortlessly. Soundstage is wide and bass is deep without muddying vocals. 10/10.',
    1
  );

  // Seed initial sample order
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, status, subtotal, discount, coupon_code,
      shipping_fee, tax, total, payment_method, payment_status, payment_id,
      shipping_address_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))
  `);

  const sampleAddress = {
    fullName: 'Aarav Sharma',
    phone: '+91 91234 56789',
    street: 'Flat 402, Prestige Palms, 12th Main Road, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India'
  };

  insertOrder.run(
    'ord_sample1',
    'ORD-2026-84920',
    'u_cust1',
    'Delivered',
    2499,
    250,
    'WELCOME10',
    0,
    0,
    2249,
    'RAZORPAY_UPI',
    'COMPLETED',
    'pay_razor_test_94821',
    JSON.stringify(sampleAddress)
  );

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_title, product_image, size, color, price, quantity, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertOrderItem.run(
    'orditem_1',
    'ord_sample1',
    'prod_1',
    'Studio Relaxed Heavyweight Cotton Hoodie',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
    'L',
    'Oatmeal Heather',
    2499,
    1,
    2499
  );
}

export const db = new Proxy({} as DatabaseSync, {
  get(_target, prop) {
    const instance = getDatabase();
    const val = (instance as any)[prop];
    if (typeof val === 'function') {
      return val.bind(instance);
    }
    return val;
  },
});
export default db;
