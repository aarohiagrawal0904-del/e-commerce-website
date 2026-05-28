# REST API Reference - Aura Smart E-Commerce Platform

This document describes the available API endpoints in the Node.js / Express backend.

---

## 🔐 1. Authentication APIs (`/api/auth`)

### Register User
* **URL**: `/api/auth/signup`
* **Method**: `POST`
* **Access**: Public
* **Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
* **Success Response (201)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": 3,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

### Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Access**: Public
* **Body**:
```json
{
  "email": "user@ecommerce.com",
  "password": "user123"
}
```
* **Success Response (200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": 2,
    "name": "Test Consumer",
    "email": "user@ecommerce.com",
    "role": "user"
  }
}
```

### Current User Profile
* **URL**: `/api/auth/profile`
* **Method**: `GET`
* **Access**: Protected (Requires Bearer JWT)
* **Headers**: `Authorization: Bearer <JWT>`
* **Success Response (200)**:
```json
{
  "success": true,
  "user": {
    "id": 2,
    "name": "Test Consumer",
    "email": "user@ecommerce.com",
    "role": "user",
    "created_at": "2026-05-28T11:08:29.000Z"
  }
}
```

---

## 🛍️ 2. Product Catalog APIs (`/api/products`)

### Fetch All Products
* **URL**: `/api/products`
* **Method**: `GET`
* **Access**: Public
* **Query Parameters**:
  - `category`: Category name string (e.g. `Electronics`)
  - `search`: Keyword string
  - `sort`: Ordering string (`price-low`, `price-high`, `newest`)
* **Success Response (200)**:
```json
{
  "success": true,
  "count": 1,
  "products": [
    {
      "id": 1,
      "category_id": 1,
      "name": "Vortex X1 Mechanical Keyboard",
      "description": "Premium aluminum chassis...",
      "price": "189.99",
      "stock": 45,
      "image_url": "https://...",
      "category_name": "Electronics"
    }
  ]
}
```

### Fetch All Categories
* **URL**: `/api/products/categories/all`
* **Method**: `GET`
* **Access**: Public
* **Success Response (200)**:
```json
{
  "success": true,
  "categories": [
    { "id": 1, "name": "Electronics", "description": "..." },
    { "id": 2, "name": "Fashion", "description": "..." }
  ]
}
```

### Fetch Product Details
* **URL**: `/api/products/:id`
* **Method**: `GET`
* **Access**: Public
* **Success Response (200)**:
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Vortex X1 Mechanical Keyboard",
    "price": "189.99",
    "stock": 45,
    "description": "...",
    "category_name": "Electronics"
  }
}
```

---

## 🛒 3. Cart Management APIs (`/api/cart`)

*All cart APIs require authorization Bearer token.*

### Fetch Cart
* **URL**: `/api/cart`
* **Method**: `GET`
* **Success Response (200)**:
```json
{
  "success": true,
  "cart": [
    {
      "id": 1,
      "user_id": 2,
      "product_id": 1,
      "quantity": 2,
      "name": "Vortex X1 Mechanical Keyboard",
      "price": "189.99",
      "image_url": "https://...",
      "stock": 45
    }
  ]
}
```

### Add Item to Cart
* **URL**: `/api/cart`
* **Method**: `POST`
* **Body**:
```json
{
  "productId": 1,
  "quantity": 1
}
```
* **Success Response (200)**: returns updated cart array.

### Update Cart Quantity
* **URL**: `/api/cart/:productId`
* **Method**: `PUT`
* **Body**:
```json
{
  "quantity": 5
}
```

---

## 📦 4. Order Management APIs (`/api/orders`)

*All order APIs require authorization Bearer token.*

### Place Order
* **URL**: `/api/orders`
* **Method**: `POST`
* **Body**:
```json
{
  "shippingAddress": "123 Developer Lane, Silicon Valley, CA 94025",
  "paymentMethod": "Credit Card"
}
```
* **Success Response (201)**:
```json
{
  "success": true,
  "message": "Order placed successfully!",
  "orderId": 5,
  "totalAmount": 189.99,
  "trackingNumber": "TRK-1716912345-982"
}
```

### Get Order Timeline Details
* **URL**: `/api/orders/:id`
* **Method**: `GET`
* **Success Response (200)**: Returns complete items purchased, tracking delivery carrier timeline, and billing receipt metadata.

---

## 👑 5. Administration APIs (`/api/admin`)

*All administrative APIs require authorization Bearer token AND the user role to be 'admin'.*

### Fetch Dashboard Stats
* **URL**: `/api/admin/stats`
* **Method**: `GET`
* **Success Response (200)**:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 12,
    "totalOrders": 24,
    "totalRevenue": 4820.50,
    "recentOrders": []
  }
}
```

### Add Product
* **URL**: `/api/admin/products`
* **Method**: `POST`
* **Body**:
```json
{
  "name": "Titan Headphones",
  "description": "AI noise isolation.",
  "price": 199.99,
  "stock": 25,
  "categoryId": 1,
  "imageUrl": "https://..."
}
```

### Update Order Status
* **URL**: `/api/admin/orders/:id/status`
* **Method**: `PUT`
* **Body**:
```json
{
  "status": "shipped"
}
```
* **Notes**: Automatically sets delivery status to `in_transit` and creates carrier details. If cancelled, it increments product inventories back to stock.

---

## 🧠 6. Artificial Intelligence APIs (`/api/ai`)

### AI Description Copywriter
* **URL**: `/api/ai/generate-description`
* **Method**: `POST`
* **Access**: Private/Admin
* **Body**:
```json
{
  "productName": "Sleek Desk Lamp",
  "categoryName": "Home & Living"
}
```
* **Response**: Returns a professionally written SEO copywriting block from Gemini.

### AI Sales BI Consultant
* **URL**: `/api/ai/sales-insights`
* **Method**: `POST`
* **Access**: Private/Admin
* **Response**: Returns comprehensive markdown marketing recommendations analyzing database statistics.

### AI Support Conversational Chat
* **URL**: `/api/ai/chat`
* **Method**: `POST`
* **Access**: Private (Authenticated User)
* **Body**:
```json
{
  "message": "Where is my order #5?",
  "history": []
}
```
* **Response**: Checks active customer's orders history, resolves details, and returns natural conversational support replies.
