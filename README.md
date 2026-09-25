# MediCart - Amazon-Style Online Pharmacy & Medicine Shopping Platform

MediCart is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed for online medicine ordering and healthcare product shopping. It features a responsive Amazon/PharmEasy-style shopping storefront, user authentication with JWT, a dynamic cart and checkout system, user order tracking, and an admin dashboard for medicine catalog and order management.

---

## Main Features

### 🛍️ Customer Storefront
* **Interactive Shopping Interface:** Modern header/navbar, category navigation bar, hero section, product grid, health & wellness cards, promotional banners, and footer.
* **Product Search & Filtering:** Dynamic client-side filtering by medicine name, category (e.g., Pain Relief, Cold & Flu, Wellness), and search query.
* **Shopping Cart System:** Persistent shopping cart backed by local storage with quantity adjustment, stock availability capping, subtotal calculation, and total discount savings breakdown.
* **Checkout & Address Validation:** Multi-step checkout form with regex validation for phone numbers, pincodes, and email addresses.
* **Order History & Details:** Registered users can view past orders, order status updates (`Placed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), itemized pricing, and delivery addresses.

### 🔑 Authentication & Security
* **User Signup & Login:** Email and password registration with bcrypt password hashing.
* **JWT Token Security:** Role-based access control (`user` vs `admin`) with 7-day JWT expiration.
* **Protected Routes:** Frontend route guards (`AdminRoute`) and backend security middleware (`authMiddleware` and `adminMiddleware`).
* **Server-Side Pricing & Stock Integrity:** Order pricing and stock availability are strictly verified on the server side to prevent client price tampering.

### 🛡️ Admin Dashboard & Management
* **Analytics Overview:** Real-time metrics for total registered users, catalog medicines, total orders, total revenue, and status distribution (`Placed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
* **Medicine Catalog CRUD:** Add new medicines, update pricing/stock/details, and delete discontinued medicines.
* **Order Status Management:** View full order list, customer shipping details, itemized breakdown, and update fulfillment status.

---

## Technology Stack

### Frontend
* **Core:** React 18, JavaScript (ES6+), HTML5, CSS3
* **Build Tool & Server:** Vite
* **Routing:** React Router DOM (v7)
* **Icons:** Lucide React
* **State Management:** React Context API (`AuthContext`, `CartContext`)

### Backend
* **Runtime & Framework:** Node.js, Express.js
* **Database & ODM:** MongoDB, Mongoose
* **Authentication & Hashing:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
* **Configuration & Middleware:** `dotenv`, `cors`

---

## Project Folder Structure

```
medicine_shopping/
├── client/                     # React / Vite Frontend Application
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Brand logos & icons
│   │   ├── components/         # UI components & pages (Navbar, Hero, Checkout, Admin, etc.)
│   │   ├── config/             # API base URL configuration (api.js)
│   │   ├── context/            # React Context providers (AuthContext.jsx, CartContext.jsx)
│   │   ├── data/               # Static category & fallback data (products.js)
│   │   ├── App.css             # Component layout & design system styles
│   │   ├── App.jsx             # Main App router and layout wrapper
│   │   ├── index.css           # Global typography & reset CSS
│   │   └── main.jsx            # React entry point
│   ├── .env                    # Frontend environment variables (VITE_API_BASE_URL)
│   ├── .env.example            # Environment template
│   ├── index.html              # HTML entry template
│   ├── package.json            # Frontend dependencies & scripts
│   └── vite.config.js          # Vite configuration
│
└── server/                     # Express / Node.js Backend REST API
    ├── config/                 # Database configuration (db.js)
    ├── middleware/             # Security middleware (authMiddleware.js, adminMiddleware.js)
    ├── models/                 # Mongoose schema definitions (User.js, Medicine.js, Order.js)
    ├── routes/                 # Express API route handlers
    │   ├── adminRoutes.js      # Admin dashboard & order management endpoints
    │   ├── authRoutes.js       # Signup & Login endpoints
    │   ├── medicineRoutes.js   # Public & Admin medicine CRUD endpoints
    │   └── orderRoutes.js      # Authenticated user order placement & lookup endpoints
    ├── seed/                   # Medicine dataset & database seed script
    │   ├── medicinesData.json  # Initial sample medicines dataset
    │   └── seedMedicines.js    # Database seeding script for medicines
    ├── .env                    # Backend environment variables (PORT, MONGODB_URI, JWT_SECRET)
    ├── package.json            # Backend dependencies & scripts
    ├── seedAdmin.js            # Initial admin account creation script
    ├── server.js               # Express application entry point
    └── verify*.js              # Automated integration & verification test scripts
```

---

## Prerequisites

Ensure you have the following installed on your local machine:
* **Node.js** (v16.x or higher) & **npm** (v8.x or higher)
* **MongoDB** (Local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI)

---

## Installation & Setup

### 1. Clone or Open Project Workspace
Navigate to the project root directory:
```bash
cd medicine_shopping
```

### 2. Backend Setup
Navigate into the `server` directory and install dependencies:
```bash
cd server
npm install
```

Configure backend environment variables in `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medicart
JWT_SECRET=medicart_jwt_secret_key_2026_super_secure
```

Seed initial medicine catalog into MongoDB:
```bash
node seed/seedMedicines.js
```

Create initial development admin account:
```bash
node seedAdmin.js
```

### 3. Frontend Setup
Navigate into the `client` directory and install dependencies:
```bash
cd ../client
npm install
```

Configure frontend environment variables in `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## How to Run the Project

### Start Backend Development Server
In the `server` folder:
```bash
cd server
npm start
```
The API server runs at `http://localhost:5000`. You can verify API health at `http://localhost:5000/api/test`.

### Start Frontend Development Server
In a new terminal, navigate to the `client` folder:
```bash
cd client
npm run dev
```
The Vite development server will start (typically at `http://localhost:5173`).

---

## API Endpoint Summary

### Public Endpoints
* `GET /api/test` — Health check endpoint.
* `GET /api/medicines` — Retrieve all medicines in the database.
* `GET /api/medicines/:id` — Retrieve single medicine details.
* `POST /api/auth/signup` — Register a new customer account.
* `POST /api/auth/login` — Authenticate user and receive JWT token.

### Customer Endpoints (Bearer Token Required)
* `POST /api/orders` — Place a new order (validates stock & calculates price server-side).
* `GET /api/orders` — View logged-in user's order history.
* `GET /api/orders/:id` — View details of a specific order owned by the user.

### Admin Endpoints (Admin Bearer Token Required)
* `GET /api/admin/dashboard` — Get dashboard statistics (user count, medicine count, order count, total revenue, status breakdown, recent orders).
* `GET /api/admin/orders` — Retrieve all orders across all customers.
* `GET /api/admin/orders/:id` — Retrieve detailed information for any customer order.
* `PUT /api/admin/orders/:id/status` — Update order status (`Placed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
* `POST /api/medicines` — Create a new medicine record.
* `PUT /api/medicines/:id` — Update an existing medicine record.
* `DELETE /api/medicines/:id` — Delete a medicine record.

---

## User & Admin Workflows

### User Workflow
1. Browse medicines by category or search bar on the homepage.
2. Add desired medicines to cart or click **Buy Now**.
3. Open Cart drawer to adjust quantities or remove items.
4. Click **Proceed to Checkout** to navigate to `/checkout`.
5. Sign up (`/signup`) or log in (`/login`) if not already authenticated.
6. Enter shipping details and confirm order placement.
7. Track order status and purchase history under **My Orders** (`/orders`).

### Admin Workflow
1. Log in via `/login` using development admin credentials.
2. Access the Admin Dashboard (`/admin`) to view system overview statistics.
3. Manage catalog via `/admin/medicines` (Add new medicines, edit prices/stock, delete discontinued medicines).
4. Manage fulfillment via `/admin/orders` (View customer orders and update shipping statuses).

---

## Development Credentials

> ⚠️ **Development / Demonstration Credentials Only:**  
> The following credentials are generated automatically by running `node seedAdmin.js` in development. Do **NOT** use these credentials in a production environment.

* **Development Admin Email:** `admin@medicart.local`
* **Development Admin Password:** `Admin123!`

---

## Testing & Verification Commands

The `server` directory contains automated test verification scripts to validate backend routes, security policies, and data handling:

```bash
cd server

# Verify Auth & Login Integration
node verifyStep5C.js

# Verify Cart Logic & Stock Boundaries
node verifyStep6A.js

# Verify Checkout Summary Calculations
node verifyStep6B.js

# Verify Order Creation, Stock Limits & Authorization Checks
node verifyStep6C.js

# Verify Admin Dashboard Metrics & Admin Access Policy
node verifyStep7A.js

# Verify Admin Medicine Management (CRUD Security & Persistence)
node verifyStep7B.js

# Verify Admin Order Status Management & Authorization
node verifyStep7C.js
```

---

## Production Build

To test or build the frontend for production deployment:

```bash
cd client
npm run build
```

This compiles optimized static assets into the `client/dist/` directory.

---

## Security Notes
* **Password Hashing:** All user passwords are encrypted using `bcryptjs` before storage.
* **Token Expiration:** JWT authentication tokens expire in 7 days.
* **Server-Side Validation:** Order subtotals and item pricing are calculated authoritatively on the backend, overriding client-submitted price fields.
* **Role Verification:** Endpoints and pages requiring administrative rights enforce double verification via `adminMiddleware` on Express routes and `AdminRoute` on React views.

---

## Future Improvements
* Payment Gateway Integration (e.g., Razorpay / Stripe).
* Prescription Upload for restricted prescription-only medicines.
* Email & SMS Notifications for order updates.
* Customer Product Reviews & Rating Submissions.
