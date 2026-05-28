# Aura - Smart E-Commerce Order Management System

A complete, production-grade Full Stack Smart E-Commerce Order Management System. It features modern responsive layouts, a floating conversational AI chatbot, and administrative dashboards utilizing **React, Node.js, Express, MySQL, and the Google Gemini AI API**.

---

## 🚀 Key Features

### 🛒 Customer View
1. **JWT Session Authentication**: Hashed password signups & logins utilizing bcrypt.
2. **Product Browsing Gallery**: Multi-parameter search queries, categories sorting tabs, and modern high-res card galleries.
3. **Persistent Cart Storage**: Saved dynamically in MySQL database tables.
4. **Interactive Checkouts**: Shipping address records and mock transaction configurations.
5. **Live Delivery Timeline Tracking**: Clean horizontal timeline tracking shipping updates (`pending` ➔ `processing` ➔ `in transit` ➔ `delivered`), including carrier parameters (FedEx) and tracking numbers.
6. **Aura AI chatbot widget**: Persistent chatbot in bottom corner. Aura accesses the customer's active account context (order histories, shipping details) and the store catalog to suggest items or trace orders!

### 👑 Administrator Suite
1. **Interactive Metrics Dashboard**: Cards representing total registers, active sales billing, and a scrollable log of recent orders.
2. **Products Manager (CRUD)**: Create, edit, and delete store items. Features a **"✨ Generate with AI"** copywriter! Input product title and category, and Gemini automatically composes description copies.
3. **Orders Manager**: Moderate status updates. Updating order status (e.g. `shipped` or `delivered`) dynamically updates delivery timelines. Cancelling an order automatically returns inventory to stock and refunds payments.
4. **Sales Analytics Graphs**: Visual Area/Line and Bar charts powered by **Recharts** detailing calendar revenues.
5. **Gemini Sales BI Consultant**: Click "Generate AI Business Brief", and Gemini audits sales records to return marketing advice!

---

## 🛠️ Stack Architecture

* **Frontend**: React (Vite), React Router DOM v6, Axios, Tailwind CSS, Lucide Icons, Recharts (Charts).
* **Backend**: Node.js, Express.js (MVC structure), JSON Web Tokens (JWT), Bcrypt.js.
* **Database**: MySQL (using promise connection pool).
* **AI Engine**: Google Gemini API via native spawned CLI subprocess (`curl.exe`).

---

## 📁 Repository Directory Map

```
e-commerce/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MySQL Pool setup
│   │   └── init_db.js            # Automatic seeder script
│   ├── controllers/              # MVC Controller logic (7 controllers)
│   ├── middleware/               # JWT auth & error handlers
│   ├── routes/                   # Routing endpoints (7 files)
│   ├── utils/
│   │   └── gemini.js             # Gemini SDK wrapper & chatbot context
│   ├── .env.example              # Environment variables template
│   └── server.js                 # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, ProtectedRoute, AIChatbot
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── pages/                # General store and admin screens (13 views)
│   │   └── utils/
│   │       └── api.js            # Axios client with request interceptors
│   ├── tailwind.config.js
│   └── index.html
├── schema.sql                    # SQL database table definitions
├── api_documentation.md          # REST API endpoints references
└── package.json                  # Root runner script
```

---

## ⚙️ Installation & Launch Guide

### 📋 Prerequisites
* **Node.js** (v16+) and **npm** installed on your workstation.
* **MySQL Server** installed and running locally on port `3306` (or remote address).

### 1. Clone & Core Setup
Navigate to the project root workspace directory:
```bash
cd "c:\Users\aaroh\OneDrive\Desktop\e ommerce"
```

Configure your environment settings. Go into `backend/` and verify the `.env` settings. The default configuration uses common MySQL defaults:
```env
PORT=5000
NODE_ENV=development

# MySQL Database Configs
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_ecommerce
DB_PORT=3306

# JWT Config
JWT_SECRET=supersecretjwtkey12345!
JWT_EXPIRE=30d

# Gemini API Key (Required for AI description & chats)
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no Gemini key is provided, the platform will gracefully operate in fallback mock mode to avoid crashes, but active LLM copywriting and chats require a key).*

### 2. Auto-Install Dependencies
In the root directory, run the automated installation command:
```bash
npm run install-all
```
This script will automatically trigger `npm install` across root directories, backend servers, and frontend packages.

### 3. Database Schema Sync & Data Seeding
Ensure your local MySQL server is currently running. Run the following database seeder command:
```bash
npm run db-init
```
This utility will automatically:
1. Connect to your MySQL server.
2. Build the database `smart_ecommerce` if missing.
3. Parse and run `schema.sql` to construct all 8 tables and performance indexes.
4. Populate initial store categories.
5. Populate gorgeous pre-filled store products (keyboards, headsets, coats, chairs) with live Unsplash assets.
6. Create default User and Administrator login profiles.

### 4. Running the Applications
Start both backend API servers and frontend clients concurrently with one single command:
```bash
npm run dev
```
* **Frontend client**: Launches on [http://localhost:3000](http://localhost:3000)
* **Backend API server**: Launches on [http://localhost:5000](http://localhost:5000)

---

## 🔑 Default Login Credentials

Use these seeded logins to test the platform instantly:

### 👤 Test Consumer User
* **Email**: `user@ecommerce.com`
* **Password**: `user123`
*(Can browse items, add quantities to cart, place orders, and chat with Aura AI support).*

### 👑 Store Administrator
* **Email**: `admin@ecommerce.com`
* **Password**: `admin123`
*(Can view dashboards, use Gemini description copywriting in products manager, edit order ship details, and request Sales BI reports).*
