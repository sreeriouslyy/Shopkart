# ShopKart Full-Stack Project — Complete (Labs 01 to 06)

ShopKart is a production-grade full-stack e-commerce web application covering customer authentication, product catalog discovery, persistent wishlist management, global shopping cart state, and order checkout with Razorpay test payment integration.

---

## 🏗️ Architecture & Lab Sequence

```text
Lab 01: Customer Auth API (Node.js, Express, MongoDB, JWT, HttpOnly Cookies)
   ↓
Lab 02: Client-Server Auth (React Router, Axios withCredentials, Auth Guards)
   ↓
Lab 03: Product Catalog & Discovery (Mongoose Schema, Query Search, Category Filters, Sorting)
   ↓
Lab 04: Wishlist System (MongoDB Object References, Population, Duplicate Prevention)
   ↓
Lab 05: Shopping Cart System (Global Cart Context, Derived Subtotals, Stock Checks, Quantity Controls)
   ↓
Lab 06: Checkout & Orders (Shipping Validation, Server Total Calculation, Razorpay Test Payment, Purchase Snapshots, Orders History)
```

---

## 📁 Repository Structure

```text
ShopKart/
├── backend/
│   ├── config/
│   │   └── razorpay.js            # Razorpay SDK configuration
│   ├── controllers/
│   │   ├── customer.controller.js  # Auth (register, login, me, logout)
│   │   ├── product.controller.js   # Products (search, filter, sort)
│   │   ├── wishlist.controller.js  # Wishlist (add, get, remove)
│   │   ├── cart.controller.js      # Cart (add, get, update quantity, remove)
│   │   └── order.controller.js     # Checkout & orders (create payment, verify signature, history)
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT authentication (Cookie + Bearer token support)
│   ├── models/
│   │   ├── customer.model.js       # Customer schema with wishlist & cart
│   │   ├── product.model.js        # Product schema with price/stock validation
│   │   └── order.model.js          # Order schema with purchase snapshots & payment fields
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   ├── seedProducts.js             # Seed sample catalog products
│   ├── testAllLabs.js              # Comprehensive automated tests for Labs 01-06
│   ├── .env                        # Local environment variables
│   └── index.js                    # Express application entrypoint
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Sticky navbar with live cart badge & links
    │   │   └── ProductCard.jsx     # Dynamic card with wishlist toggle & add to cart
    │   ├── context/
    │   │   ├── CartContext.jsx     # Global cart state & derived totals
    │   │   └── WishlistContext.jsx # Global wishlist state & toggle sync
    │   ├── pages/
    │   │   ├── Login.jsx           # Customer sign-in
    │   │   ├── Register.jsx        # Customer registration
    │   │   ├── Home.jsx            # Customer dashboard with stats
    │   │   ├── Products.jsx        # Catalog discovery with search, category & sort
    │   │   ├── ProductDetails.jsx  # Single product details
    │   │   ├── Wishlist.jsx        # Saved products page
    │   │   ├── Cart.jsx            # Shopping cart with quantity counters & summary
    │   │   ├── Checkout.jsx        # Shipping form & Razorpay payment integration
    │   │   ├── OrderSuccess.jsx    # Order confirmation with snapshot review
    │   │   └── Orders.jsx          # Historical order history
    │   ├── services/
    │   │   └── api.js              # Axios client configured with withCredentials: true
    │   ├── styles.css              # Responsive styling system
    │   ├── App.jsx                 # Routing configuration & Context providers
    │   └── main.jsx
    └── vite.config.js
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:5000`.

### 2. Frontend Setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`.

### 3. Run Automated Tests

To test all backend endpoints from Lab 01 through Lab 06:

```bash
cd backend
node testAllLabs.js
```

---

## 🔌 API Reference

### Customer Auth (Labs 01 & 02)
- `POST /customers/register` — Register a new account
- `POST /customers/login` — Sign in and receive HttpOnly cookie / token
- `GET /customers/me` *(Protected)* — Get authenticated profile
- `POST /customers/logout` *(Protected)* — Clear session cookie

### Product Catalog (Lab 03)
- `GET /products` — Get products with query parameters (`?search=`, `?category=`, `?sort=price_asc|price_desc`)
- `GET /products/:id` — Get single product by MongoDB ID
- `POST /products` — Create product in catalog

### Wishlist (Lab 04)
- `POST /wishlist/:productId` *(Protected)* — Save product to wishlist (409 on duplicate)
- `GET /wishlist` *(Protected)* — Get current user's populated wishlist
- `DELETE /wishlist/:productId` *(Protected)* — Remove product from wishlist

### Shopping Cart (Lab 05)
- `POST /cart/:productId` *(Protected)* — Add product to cart (or increment quantity, checks stock)
- `GET /cart` *(Protected)* — Get current user's populated cart
- `PATCH /cart/:productId` *(Protected)* — Update item quantity with stock boundary validation
- `DELETE /cart/:productId` *(Protected)* — Remove item from cart

### Checkout & Orders (Lab 06)
- `POST /orders/create-payment-order` *(Protected)* — Validates shipping address, re-checks stock and latest pricing, snapshots items, creates pending order, and initializes Razorpay test order
- `POST /orders/verify-payment` *(Protected)* — Verifies HMAC SHA256 signature, marks order `PAID`/`PLACED`, decrements stock, and clears user's cart
- `GET /orders` *(Protected)* — Get authenticated customer's order history (newest first)
- `GET /orders/:id` *(Protected)* — Get details of a single order (enforces ownership)

---

## 💳 Razorpay Test Mode Flow

1. User proceeds to checkout from `/cart`.
2. Backend calculates the real total from MongoDB product records and converts to paise.
3. Razorpay test order is generated on the server.
4. User completes payment via Razorpay test modal (or test simulator).
5. Frontend sends payment details and signature to `/orders/verify-payment`.
6. Server computes HMAC SHA256: `crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex')`.
7. Once verified, stock is decremented, cart is wiped, and confirmation screen displays the receipt.
