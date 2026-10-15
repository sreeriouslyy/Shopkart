const http = require('http');

async function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('--- Testing Lab 01, 02, 03, 04, 05, 06 Endpoints ---');

  // 1. Register a test user
  const email = `testuser_${Date.now()}@example.com`;
  const regRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/customers/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    fullName: 'Test Customer',
    email,
    password: 'password123',
    phone: '9876543210'
  });
  console.log('1. Register Customer:', regRes.status, regRes.body.success ? 'PASS' : 'FAIL');

  // 2. Login customer
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/customers/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password: 'password123' });
  console.log('2. Login Customer:', loginRes.status, loginRes.body.success ? 'PASS' : 'FAIL');
  const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
  const token = loginRes.body.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Cookie: cookie,
    Authorization: token ? `Bearer ${token}` : ''
  };

  // 3. Products
  const prodRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/products',
    method: 'GET'
  });
  console.log('3. GET /products:', prodRes.status, `count: ${prodRes.body.count}`, prodRes.body.count > 0 ? 'PASS' : 'FAIL');
  const testProduct = prodRes.body.products[0];
  const testProduct2 = prodRes.body.products[1];

  // 4. Lab 04 - Wishlist
  const addWish = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/wishlist/${testProduct._id}`,
    method: 'POST',
    headers: authHeaders
  });
  console.log('4. POST /wishlist/:id:', addWish.status, addWish.body.success ? 'PASS' : 'FAIL');

  // 4b. Conflict test
  const dupWish = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/wishlist/${testProduct._id}`,
    method: 'POST',
    headers: authHeaders
  });
  console.log('4b. POST duplicate /wishlist (expect 409):', dupWish.status === 409 ? 'PASS (409)' : `FAIL (${dupWish.status})`);

  // 4c. GET /wishlist
  const getWish = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/wishlist',
    method: 'GET',
    headers: authHeaders
  });
  console.log('4c. GET /wishlist:', getWish.status, `count: ${getWish.body.count}`, getWish.body.count === 1 ? 'PASS' : 'FAIL');

  // 5. Lab 05 - Cart
  const addCart = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/cart/${testProduct._id}`,
    method: 'POST',
    headers: authHeaders
  });
  console.log('5. POST /cart/:id:', addCart.status, addCart.body.success ? 'PASS' : 'FAIL');

  const addCart2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/cart/${testProduct2._id}`,
    method: 'POST',
    headers: authHeaders
  });
  console.log('5b. POST /cart/:id item 2:', addCart2.status, addCart2.body.success ? 'PASS' : 'FAIL');

  // 5c. Update quantity
  const updateQty = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/cart/${testProduct._id}`,
    method: 'PATCH',
    headers: authHeaders
  }, { quantity: 2 });
  console.log('5c. PATCH /cart/:id quantity:', updateQty.status, updateQty.body.success ? 'PASS' : 'FAIL');

  // 5d. GET /cart
  const getCart = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/cart',
    method: 'GET',
    headers: authHeaders
  });
  console.log('5d. GET /cart:', getCart.status, `items: ${getCart.body.cart.length}`, getCart.body.cart.length === 2 ? 'PASS' : 'FAIL');

  // 6. Lab 06 - Checkout & Orders
  // 6a. Create payment order
  const createOrderRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/orders/create-payment-order',
    method: 'POST',
    headers: authHeaders
  }, {
    shippingAddress: {
      fullName: 'Test Customer',
      phone: '9876543210',
      addressLine1: '123 Main Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    }
  });
  console.log('6a. POST /orders/create-payment-order:', createOrderRes.status, createOrderRes.body.success ? 'PASS' : 'FAIL');
  const { shopKartOrderId, razorpayOrderId, amount } = createOrderRes.body;

  // 6b. Verify payment
  const verifyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/orders/verify-payment',
    method: 'POST',
    headers: authHeaders
  }, {
    shopKartOrderId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: `pay_${Date.now()}`,
    razorpay_signature: 'simulated_test_signature'
  });
  console.log('6b. POST /orders/verify-payment:', verifyRes.status, verifyRes.body.success ? 'PASS' : 'FAIL');

  // 6c. Verify cart cleared after paid order
  const checkCart = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/cart',
    method: 'GET',
    headers: authHeaders
  });
  console.log('6c. Verify cart cleared:', checkCart.body.cart.length === 0 ? 'PASS (cart empty)' : 'FAIL');

  // 6d. GET /orders
  const getOrders = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/orders',
    method: 'GET',
    headers: authHeaders
  });
  console.log('6d. GET /orders:', getOrders.status, `count: ${getOrders.body.count}`, getOrders.body.count === 1 ? 'PASS' : 'FAIL');

  // 6e. GET /orders/:id
  const getSingleOrder = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/orders/${shopKartOrderId}`,
    method: 'GET',
    headers: authHeaders
  });
  console.log('6e. GET /orders/:id:', getSingleOrder.status, getSingleOrder.body.success ? 'PASS' : 'FAIL');

  console.log('--- ALL BACKEND LAB TESTS COMPLETED ---');
  process.exit(0);
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
