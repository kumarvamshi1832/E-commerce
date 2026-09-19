# mystore_SC2608D03

# 🛒 MyStore — Full Stack E-Commerce Platform

> A modern full-stack e-commerce web application built with **React.js, Django REST Framework, and MySQL**, featuring a complete customer shopping experience and a powerful admin management dashboard.

---

## 🌐 Project Overview

**MyStore** is a full-stack e-commerce platform designed to provide a complete online shopping experience while giving administrators centralized control over the entire application.

The platform includes customer authentication, product browsing, cart and wishlist management, checkout, order tracking, invoices, reviews, customer support, notifications, inventory management, coupon management, and a dedicated administration dashboard.

The project follows a client-server architecture where the **React.js frontend** communicates with the **Django REST API backend**, with **MySQL** used for persistent data storage.

---

## ✨ Key Highlights

- 🔐 Secure user authentication with email OTP verification
- 🛍️ Complete product browsing and shopping experience
- 🛒 Dynamic shopping cart with stock validation
- ❤️ Wishlist management
- 🎟️ Coupon and discount system
- 📦 Complete order management
- 🧾 Professional invoice generation
- ⭐ Product reviews and customer feedback
- 🎫 Customer support ticket system
- 🔔 Customer notification system
- 📊 Comprehensive admin dashboard
- 📦 Real-time inventory management
- 👥 Customer management
- 📝 Review and feedback management
- 📤 CSV, PDF and print export functionality
- 🤖 Integrated customer chatbot
- 📱 Responsive user interface

---

# 🚀 Features

## 👤 Customer Features

### Authentication

- User registration
- Email OTP verification
- Login and logout
- Forgot password
- Password reset
- Authentication validation
- Protected customer routes

### 🛍️ Product Shopping

- Product listing
- Product details
- Product categories
- Veg product section
- Non-Veg product section
- Product availability
- Stock validation
- Product search
- Product activation/deactivation support

### 🛒 Shopping Cart

- Add products to cart
- Increase/decrease product quantity
- Remove products
- Stock-limit validation
- Automatic cart total calculation
- Persistent cart functionality

### ❤️ Wishlist

- Add products to wishlist
- Remove products from wishlist
- View wishlist
- User-specific wishlist management

### 💳 Checkout

- Cart summary
- Coupon application
- Delivery pincode validation
- Address selection
- Delivery information
- Order creation
- Stock deduction

### 📦 Orders

- Place orders
- View order history
- View individual order details
- Track order status
- Cancel eligible orders
- View order items
- Order invoice

### ⭐ Reviews & Feedback

- Submit product feedback
- Submit product reviews
- View review information
- Admin response support

### 🎫 Customer Support

- Create support tickets
- View support tickets
- View ticket details
- Customer-admin communication
- Support status tracking

### 🔔 Notifications

- Customer notifications
- Read/unread notification status
- Admin-generated notifications

### 🤖 Chatbot

- Website-wide chatbot
- Customer assistance
- Keyword-based responses
- Conversation history
- Clear conversation functionality

---

# 🛠️ Admin Dashboard

The project includes a dedicated **Admin Dashboard** for centralized application management.

## 📊 Dashboard

Provides an overview of important store information and administrative operations.

## 📦 Product Management

Administrators can:

- Add products
- Update products
- Manage product information
- Manage product categories
- Manage product stock
- Activate/deactivate products

## 📋 Order Management

Administrators can:

- View customer orders
- View order details
- Update order status
- Manage order processing

Supported order statuses include:

```text
Pending
Confirmed
Shipped
Delivered
Cancelled

🏗️ Application Architecture

                    ┌─────────────────────┐
                    │       Customer      │
                    │      Web Browser    │
                    └──────────┬──────────┘
                               │
                               │ HTTP Requests
                               ▼
                    ┌─────────────────────┐
                    │      React.js       │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ Axios / REST API
                               ▼
                    ┌─────────────────────┐
                    │       Django        │
                    │   REST Framework    │
                    └──────────┬──────────┘
                               │
                               │ Django ORM
                               ▼
                    ┌─────────────────────┐
                    │        MySQL        │
                    │      Database       │
                    └─────────────────────┘

📂 Project Structure
ecommerce/
│
├── .gitignore
├── README.md
│
├── backend/
│   │
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── store/
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── auth_views.py
│   │   ├── models.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── frontend/
│   │   │
│   │   ├── public/
│   │   │
│   │   ├── src/
│   │   │   │
│   │   │   ├── assets/
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── AdminExportActions.jsx
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── BalloonEffect.jsx
│   │   │   │   ├── CategoryNav.jsx
│   │   │   │   ├── ChatBot.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── InvoiceActions.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   └── SupportRoute.jsx
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── CartContext.jsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── Addresses.jsx
│   │   │   │   ├── AdminCoupons.jsx
│   │   │   │   ├── AdminCustomers.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminInventory.jsx
│   │   │   │   ├── AdminNotifications.jsx
│   │   │   │   ├── AdminOrders.jsx
│   │   │   │   ├── AdminProducts.jsx
│   │   │   │   ├── AdminReviews.jsx
│   │   │   │   ├── AdminSupport.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   ├── Checkout.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── MyOrders.jsx
│   │   │   │   ├── NonVeg.jsx
│   │   │   │   ├── OrderDetails.jsx
│   │   │   │   ├── ProductDetails.jsx
│   │   │   │   ├── Products.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ResetPassword.jsx
│   │   │   │   ├── Support.jsx
│   │   │   │   ├── SupportDashboard.jsx
│   │   │   │   ├── Veg.jsx
│   │   │   │   └── Wishlist.jsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   │
│   │   │   ├── App.jsx
│   │   │   ├── App.css
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   │
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   └── vite.config.js
│   │
│   ├── manage.py
│   └── requirements.txt
│
└── .gitignore
