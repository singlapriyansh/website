import http from 'http';

const BASE_URL = 'http://localhost:3000';

let customerCookie = '';
let adminCookie = '';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE E-COMMERCE END-TO-END TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. AUTHENTICATION TESTS
  console.log('1. Testing Authentication & Session Management...');
  
  // Login with invalid credentials
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@website.com', password: 'WrongPassword99' }),
  });
  assert(badLoginRes.status === 401, 'Rejects invalid password with 401');

  // Customer Login
  const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@website.com', password: 'Customer@123' }),
  });
  assert(custLoginRes.status === 200, 'Customer signs in successfully');
  customerCookie = custLoginRes.headers.get('set-cookie') || '';
  const custData = await custLoginRes.json();
  assert(custData.user.role === 'customer', 'Customer role verified');

  // Verify /api/auth/me
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: customerCookie },
  });
  const meData = await meRes.json();
  assert(meData.user?.email === 'customer@website.com', 'Session persists via secure JWT cookie');

  // Admin Login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@website.com', password: 'Admin@123' }),
  });
  assert(adminLoginRes.status === 200, 'Admin signs in successfully');
  adminCookie = adminLoginRes.headers.get('set-cookie') || '';
  const adminData = await adminLoginRes.json();
  assert(adminData.user.role === 'admin', 'Admin role verified with elevated privileges');

  // 2. PRODUCT CATALOGUE & FILTER TESTS
  console.log('\n2. Testing Product Catalogue, Search & Filtering...');
  
  // Get all products
  const prodsRes = await fetch(`${BASE_URL}/api/products`);
  const prodsData = await prodsRes.json();
  assert(prodsData.products?.length >= 10, `Retrieved ${prodsData.products?.length} products from catalogue`);

  // Search
  const searchRes = await fetch(`${BASE_URL}/api/products?search=hoodie`);
  const searchData = await searchRes.json();
  assert(searchData.products?.length > 0 && searchData.products[0].title.toLowerCase().includes('hoodie'), 'Search query returns relevant matching products');

  // Filter by category
  const catRes = await fetch(`${BASE_URL}/api/products?category=cat_electronics`);
  const catData = await catRes.json();
  assert(catData.products.every(p => p.categoryId === 'cat_electronics'), 'Category filtering works accurately');

  // Filter by brand
  const brandRes = await fetch(`${BASE_URL}/api/products?brand=Sony+Acoustic`);
  const brandData = await brandRes.json();
  assert(brandData.products.length > 0 && brandData.products[0].brand === 'Sony Acoustic', 'Brand filtering works accurately');

  // Sort by price
  const sortRes = await fetch(`${BASE_URL}/api/products?sort=price_asc`);
  const sortData = await sortRes.json();
  const prices = sortData.products.map(p => p.price);
  const isSorted = prices.slice(1).every((p, i) => p >= prices[i]);
  assert(isSorted, 'Sort by Price: Low to High verified mathematically');

  // Single product detail
  const singleSlug = prodsData.products[0].slug;
  const singleRes = await fetch(`${BASE_URL}/api/products/${singleSlug}`);
  const singleData = await singleRes.json();
  assert(singleData.product?.id === prodsData.products[0].id, 'Product detail page retrieved by slug with specifications');

  // 3. CART OPERATIONS
  console.log('\n3. Testing Shopping Cart Operations...');
  const testProduct = prodsData.products[0];

  // Add to cart
  const addCartRes = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({
      productId: testProduct.id,
      size: testProduct.sizes[0],
      color: testProduct.colors[0],
      quantity: 1,
    }),
  });
  assert(addCartRes.status === 200, 'Added product to cart with selected size & color');

  // Fetch cart
  const getCartRes = await fetch(`${BASE_URL}/api/cart`, {
    headers: { Cookie: customerCookie },
  });
  const cartData = await getCartRes.json();
  assert(cartData.items?.length > 0, `Cart retrieved with ${cartData.items?.length} line item(s)`);
  assert(cartData.subtotal === testProduct.price, `Backend subtotal calculated accurately: ₹${cartData.subtotal}`);

  const cartItemId = cartData.items[0].id;

  // Update quantity to 2
  const updateQtyRes = await fetch(`${BASE_URL}/api/cart`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({ cartItemId, quantity: 2 }),
  });
  assert(updateQtyRes.status === 200, 'Updated cart item quantity to 2');

  const updatedCartRes = await fetch(`${BASE_URL}/api/cart`, {
    headers: { Cookie: customerCookie },
  });
  const updatedCartData = await updatedCartRes.json();
  assert(updatedCartData.subtotal === testProduct.price * 2, 'Subtotal correctly scaled with quantity');

  // 4. COUPON VALIDATION
  console.log('\n4. Testing Coupon Validation Engine...');
  const validCouponRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'WELCOME10', orderAmount: updatedCartData.subtotal }),
  });
  const validCouponData = await validCouponRes.json();
  assert(validCouponData.valid === true, 'Coupon WELCOME10 validated successfully');
  assert(validCouponData.coupon.discountAmount > 0, `Discount amount calculated: ₹${validCouponData.coupon.discountAmount}`);

  // Test invalid coupon
  const invalidCouponRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'BOGUS999', orderAmount: 5000 }),
  });
  assert(invalidCouponRes.status === 400, 'Invalid coupon correctly rejected with 400 error message');

  // 5. WISHLIST OPERATIONS
  console.log('\n5. Testing Wishlist Operations...');
  const wishToggleRes = await fetch(`${BASE_URL}/api/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({ productId: testProduct.id }),
  });
  const wishToggleData = await wishToggleRes.json();
  assert(wishToggleRes.status === 200, 'Wishlist item toggled');

  const getWishRes = await fetch(`${BASE_URL}/api/wishlist`, {
    headers: { Cookie: customerCookie },
  });
  const wishData = await getWishRes.json();
  assert(wishData.items?.some(i => i.productId === testProduct.id), 'Product confirmed present in user wishlist');

  // 6. ADDRESS MANAGEMENT
  console.log('\n6. Testing Address Book...');
  const addAddressRes = await fetch(`${BASE_URL}/api/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({
      fullName: 'Aarav Sharma',
      phone: '+91 91234 56789',
      street: 'Flat 502, Prestige Palms, 12th Main',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    }),
  });
  const addAddressData = await addAddressRes.json();
  assert(addAddressRes.status === 200, 'New delivery address saved');
  const addressId = addAddressData.address.id;

  // 7. CHECKOUT & ORDER PLACEMENT
  console.log('\n7. Testing Checkout & Order Placement...');
  const initialStock = testProduct.stock;

  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({
      addressId,
      paymentMethod: 'RAZORPAY_UPI',
      couponCode: 'WELCOME10',
      paymentId: 'pay_rzp_test_e2e_981273',
    }),
  });
  const orderData = await orderRes.json();
  assert(orderRes.status === 200, 'Order successfully placed in database');
  assert(orderData.order?.orderNumber.startsWith('ORD-2026-'), `Generated unique order number: ${orderData.order?.orderNumber}`);

  const placedOrderId = orderData.order.id;

  // Verify cart is now empty
  const postOrderCartRes = await fetch(`${BASE_URL}/api/cart`, {
    headers: { Cookie: customerCookie },
  });
  const postOrderCartData = await postOrderCartRes.json();
  assert(postOrderCartData.count === 0, 'Shopping bag emptied automatically after order completion');

  // Verify stock decremented
  const verifyProdRes = await fetch(`${BASE_URL}/api/products/${testProduct.slug}`);
  const verifyProdData = await verifyProdRes.json();
  assert(verifyProdData.product.stock === initialStock - 2, `Product inventory decremented atomically (Old: ${initialStock}, New: ${verifyProdData.product.stock})`);

  // Verify Order details & timeline
  const orderDetailRes = await fetch(`${BASE_URL}/api/orders/${placedOrderId}`, {
    headers: { Cookie: customerCookie },
  });
  const orderDetailData = await orderDetailRes.json();
  assert(orderDetailData.order?.status === 'Confirmed', 'Order timeline status is "Confirmed"');
  assert(orderDetailData.order?.items?.length > 0, 'Order items and pricing receipt stored correctly');

  // 8. ADMIN OPERATIONS
  console.log('\n8. Testing Admin Console & Controls...');
  
  // Non-admin cannot view stats
  const nonAdminStats = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: customerCookie },
  });
  assert(nonAdminStats.status === 403, 'Customer correctly forbidden (403) from accessing admin metrics');

  // Admin views stats
  const adminStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: adminCookie },
  });
  const adminStatsData = await adminStatsRes.json();
  assert(adminStatsRes.status === 200, 'Admin successfully accesses sales analytics & stats');
  assert(adminStatsData.stats.totalRevenue > 0, `Total Revenue recorded: ₹${adminStatsData.stats.totalRevenue}`);
  assert(adminStatsData.stats.totalOrders > 0, `Total Orders recorded: ${adminStatsData.stats.totalOrders}`);

  // Admin updates order status
  const updateStatusRes = await fetch(`${BASE_URL}/api/orders/${placedOrderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ status: 'Shipped' }),
  });
  assert(updateStatusRes.status === 200, 'Admin updated customer order status to "Shipped"');

  // Admin creates new coupon
  const createCouponRes = await fetch(`${BASE_URL}/api/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      code: 'VIP50',
      discountType: 'percentage',
      discountValue: 50,
      minOrderValue: 2000,
      maxDiscount: 2000,
    }),
  });
  assert(createCouponRes.status === 200, 'Admin created new promotional coupon VIP50');

  // 9. REVIEWS & RATINGS
  console.log('\n9. Testing Product Reviews...');
  const reviewRes = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({
      productId: testProduct.id,
      rating: 5,
      title: 'Absolutely fantastic quality!',
      comment: 'Super comfortable fit and thick, premium fabric. High praise!',
    }),
  });
  assert(reviewRes.status === 200, 'Verified customer review submitted and stored');

  // 10. NEWSLETTER
  console.log('\n10. Testing Newsletter Subscription...');
  const newsRes = await fetch(`${BASE_URL}/api/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'stylish.shopper@gmail.com' }),
  });
  assert(newsRes.status === 200, 'Newsletter subscriber recorded with promo confirmation');

  console.log('\n====================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
