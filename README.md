# 🍽️ Zoop Cafe

> A full-stack digital restaurant menu and ordering system built with the **PERN stack**, designed to make restaurant menu management flexible, reduce dependence on printed menus, and provide a foundation for digital ordering and dine-in billing.

**Live Demo:** https://zoop-cafe-website.vercel.app

**Backend API:** https://zoopcafe-backend.onrender.com

---

## 📖 Overview

Zoop Cafe started as a simple digital menu and evolved into a complete full-stack restaurant management application.

The initial goal was straightforward: **make restaurant menus easy to update without repeatedly reprinting physical menus.**

Restaurant menu prices and item availability can change frequently. With a traditional printed menu, even a small price change can mean replacing multiple physical menus.

The first version of Zoop Cafe solved this by replacing static printed menus with a **QR-accessible digital menu**.

As requirements grew, the project evolved into a full-stack application where restaurant administrators can dynamically manage menu items, prices, quantities, availability, combos, orders, tables, and billing-related information.

The result is a production-deployed restaurant application demonstrating a complete flow from:

```text
Menu Management
      ↓
Customer Browsing
      ↓
Cart & Ordering
      ↓
Order Management
      ↓
Dine-In Tables
      ↓
Billing
```

---

## ✨ Features

### 👤 Customer Experience

* 🔐 Customer registration and login
* 📋 Browse the digital menu
* 🗂️ Browse menu categories
* 🍔 View individual menu items and variants
* 💰 View dynamically managed prices
* 📦 View item availability
* 🛒 Add items to cart
* ➕ Adjust quantities
* ➖ Remove items from cart
* 🍱 Order combo meals
* 🎛️ Select available combo choices
* 🧾 Place orders
* 📋 View order details
* 🔄 Track previously placed orders
* ❌ Cancel eligible orders
* ⭐ Submit reviews/ratings

### 🧑‍💼 Admin Dashboard

Administrators can manage the restaurant's digital menu without modifying the frontend code.

Features include:

* 🔐 Secure admin authentication
* 👥 Role-based authorization
* 🍔 Menu item management
* 💵 Update item prices
* 📦 Manage quantities
* 🟢 Manage item availability
* 🏷️ Manage menu variants
* 🍱 Create and manage combos
* 🎯 Configure combo choices
* 🧾 View and manage orders
* 🪑 Manage dine-in tables
* 💳 Manage dine-in billing information
* ⭐ Manage restaurant-related data

This allows menu changes to be made through the application rather than requiring code changes or rebuilding the frontend.

---

# 🪑 Dine-In & Billing System

Zoop Cafe also includes a dine-in management system designed to provide a foundation for replacing manual table/order/billing workflows.

The system supports:

```text
Table
  ↓
Customer Order
  ↓
Items Added
  ↓
Order Associated With Table
  ↓
Bill Generated / Displayed
```

The system is designed around the idea of eventually replacing a manual workflow where orders are written down, passed to the kitchen, and calculated separately during billing.

Currently, the dine-in system primarily demonstrates the **digital ordering and billing workflow** rather than functioning as a complete restaurant POS system.

---

# 🍱 Combo System

Combos are treated separately from ordinary menu items.

The application supports configurable combinations where a customer can select from available choices.

For example:

```text
Combo
 ├── Main Item
 ├── Choice A
 ├── Choice B
 └── Optional Add-ons
```

This allows the restaurant to change combo configurations without hardcoding every combination into the frontend.

---

# 🧠 Problem → Solution

## The Problem

Traditional printed menus create friction when:

* Food prices change
* Ingredient costs fluctuate
* Certain items become unavailable
* New items are introduced
* Existing items are removed
* Combo offerings change

Even a small change requires updating physical menus.

## The Solution

Zoop Cafe moves menu management into a centralized web application.

Instead of:

```text
Change price
     ↓
Reprint menus
     ↓
Replace physical copies
```

the workflow becomes:

```text
Admin changes price
       ↓
Database updated
       ↓
Digital menu reflects the change
```

This makes the menu significantly easier to maintain.

---

# 📱 From QR Menu to Full-Stack Application

The project originally started as a much simpler solution.

### Phase 1 — Digital Menu

The physical menu was converted into digital images and displayed through a basic HTML page.

QR codes placed around the restaurant allowed customers to scan and view the menu.

```text
QR Code
   ↓
Digital Menu
   ↓
Customer
```

### Phase 2 — Dynamic Menu

The limitations of a static menu became apparent.

The application was expanded so administrators could change:

* Prices
* Availability
* Quantities
* Menu items
* Variants
* Combos

without modifying the frontend manually.

### Phase 3 — Full-Stack Ordering

The application then evolved into a complete customer ordering system:

```text
Customer
   ↓
Browse Menu
   ↓
Add to Cart
   ↓
Customize / Select Combos
   ↓
Place Order
   ↓
View Order
```

### Phase 4 — Dine-In & Billing

A dine-in system was introduced to provide a foundation for digitally managing tables, customer orders, and billing.

---

# 🖼️ Screenshots



## Customer Menu

<!-- Add screenshot here -->



`<img width="953" height="481" alt="image" src="https://github.com/user-attachments/assets/b49585de-580d-4086-b1bc-5a35f27dc770" />`

---

## Menu & Item Details

<!-- Add screenshot here -->


<img width="944" height="476" alt="image" src="https://github.com/user-attachments/assets/9b609584-d38e-448d-99aa-79c6243b1112" />

---

## Shopping Cart

<!-- Add screenshot here -->

<img width="701" height="431" alt="image" src="https://github.com/user-attachments/assets/c86ce5c1-d839-42d6-adbb-0652c04dab1f" />


---


## Admin Dashboard

<!-- Add screenshot here -->

<img width="943" height="492" alt="image" src="https://github.com/user-attachments/assets/46e14d58-5dc8-49bd-ae5d-5f84841f543e" />


---

## Menu Management

<!-- Add screenshot here -->

<img width="952" height="491" alt="image" src="https://github.com/user-attachments/assets/836db634-803a-454c-b78f-fc86a45dc8c9" />


---

## Combo Management

<!-- Add screenshot here -->

<img width="948" height="486" alt="image" src="https://github.com/user-attachments/assets/20bb8737-ff8f-46b2-8cd8-2a66451266cf" />


---


# 🏗️ System Architecture

Zoop Cafe follows a **PERN-style full-stack architecture**.

```text
                    ┌──────────────────────┐
                    │      Customer        │
                    │      Browser         │
                    └──────────┬───────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │    React + Vite      │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                     ▼                   ▼
              ┌─────────────┐     ┌──────────────┐
              │     JWT     │     │   Services   │
              │    Auth     │     │ & Controllers│
              └─────────────┘     └──────┬───────┘
                                          │
                                          ▼
                                 ┌────────────────┐
                                 │ Prisma ORM     │
                                 │ + PostgreSQL   │
                                 └────────────────┘
```

---

# 🔐 Authentication & Authorization

The application uses **JWT-based authentication**.

### Authentication flow

```text
User Login
    ↓
Credentials validated
    ↓
JWT generated
    ↓
Token stored by client
    ↓
Authorization header
    ↓
Backend verifies JWT
    ↓
Authenticated request
```

Protected routes use middleware to verify authentication.

Admin-only routes additionally verify the user's role.

```text
Request
   ↓
authenticate()
   ↓
Valid JWT?
   ├── No → 401 Unauthorized
   │
   └── Yes
        ↓
   requireAdmin()
        ↓
   ADMIN?
   ├── No → 403 Forbidden
   │
   └── Yes
        ↓
      Route
```

Passwords are securely hashed before being stored using bcrypt-based password hashing.

---

# 🗄️ Database

The application uses **PostgreSQL** as its relational database and **Prisma** as the ORM/database access layer.

The database contains entities supporting areas such as:

* Users
* Menu items
* Menu variants
* Combos
* Combo choices
* Orders
* Order items
* Reviews
* Dine-in tables
* Billing-related data

Prisma migrations are used to manage database schema changes.

---

# 🛠️ Tech Stack

## Frontend

| Technology    | Purpose                           |
| ------------- | --------------------------------- |
| React         | UI development                    |
| Vite          | Frontend tooling and build system |
| React Router  | Client-side routing               |
| Tailwind CSS  | Styling                           |
| Framer Motion | Animations                        |
| Lucide React  | Icons                             |

## Backend

| Technology           | Purpose                       |
| -------------------- | ----------------------------- |
| Node.js              | Backend runtime               |
| Express              | REST API framework            |
| Prisma               | ORM/database access           |
| PostgreSQL           | Relational database           |
| `pg`                 | PostgreSQL driver             |
| `@prisma/adapter-pg` | Prisma PostgreSQL adapter     |
| JWT                  | Authentication                |
| bcrypt / bcryptjs    | Password hashing              |
| CORS                 | Cross-origin request handling |
| dotenv               | Environment configuration     |

## Deployment

| Service           | Purpose                        |
| ----------------- | ------------------------------ |
| Vercel            | Frontend deployment            |
| Render            | Backend deployment             |
| Render PostgreSQL | Production database            |
| GitHub            | Source control & CI/CD trigger |

---

# 📁 Project Structure

```text
ZoopCafeWebsite/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── customer/
│   │   ├── ...
│   │   └── ...
│   │
│   ├── public/
│   ├── .env
│   ├── .env.production
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── ...
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   │
│   ├── prisma.config.ts
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 🚀 Running Locally

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* PostgreSQL
* Git

---

## 1. Clone the repository

```bash
git clone https://github.com/BhairavK/ZoopCafeWebsite.git

cd ZoopCafeWebsite
```

---

# 🎨 Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# ⚙️ Backend Setup

Open another terminal:

```bash
cd server
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"
JWT_SECRET="your-development-secret"
NODE_ENV="development"
```

---

# 🗃️ Database Setup

Make sure PostgreSQL is running.

Apply Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

If the project seed is configured for your environment, seed the database with:

```bash
npm run seed
```

> Do not use production database credentials in a local development environment unless you intentionally understand the consequences.

---

# ▶️ Start the Backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

The API base URL is:

```text
http://localhost:5000/api
```

---

# 🌍 Production Environment

The deployed application uses:

```text
Frontend
Vercel
   │
   ▼
https://zoop-cafe-website.vercel.app

Backend
Render
   │
   ▼
https://zoopcafe-backend.onrender.com

Database
Render PostgreSQL
```

The frontend uses a production API URL during production builds:

```env
VITE_API_BASE_URL=https://zoopcafe-backend.onrender.com/api
```

while local development uses:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

This allows the same codebase to switch between development and production environments through environment configuration.

---

# 🔑 Environment Variables

## Frontend

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For production:

```env
VITE_API_BASE_URL=https://zoopcafe-backend.onrender.com/api
```

## Backend

```env
DATABASE_URL="..."
JWT_SECRET="..."
NODE_ENV="development"
```

For production:

```env
DATABASE_URL="..."
JWT_SECRET="..."
NODE_ENV="production"
```

### ⚠️ Security

Never commit secrets such as:

```text
DATABASE_URL
JWT_SECRET
database passwords
API keys
```

to GitHub.

Use environment variables provided by the deployment platform for production secrets.

---

# 🧪 Development & Production Database Handling

The backend database connection supports both local development and production PostgreSQL environments.

The Prisma PostgreSQL adapter conditionally enables SSL for production environments.

Conceptually:

```text
Development
     ↓
Local PostgreSQL
     ↓
SSL disabled

Production
     ↓
Hosted PostgreSQL
     ↓
SSL enabled
```

This allows the same backend codebase to operate in both environments without manually changing database connection logic.

---

# 📡 API Architecture

The backend follows a layered architecture built around:

```text
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Prisma
  ↓
PostgreSQL
```

### Routes

Define API endpoints and attach middleware.

### Middleware

Handles concerns such as:

* Authentication
* Authorization
* Request validation
* CORS

### Controllers

Handle HTTP requests and responses.

### Services

Contain reusable application/business logic.

### Prisma

Provides database access.

This separation allows database operations to be reused outside HTTP requests as well, such as through trusted server-side maintenance scripts.

---

# 🔒 Security Considerations

The application implements several application-level security mechanisms:

* JWT authentication
* Role-based authorization
* Password hashing
* Protected admin routes
* Environment-based secret configuration
* CORS configuration
* Server-side authorization checks

Administrative operations are not exposed directly to unauthenticated customers.

However, database credentials remain a highly privileged backend secret and must be protected accordingly.

---

# 📦 Current Scope

Zoop Cafe currently demonstrates the complete **digital menu → ordering → order management → dine-in/billing workflow**.

The ordering functionality is currently intended primarily as a working demonstration and application foundation. The physical cafe is not currently operating with the application as a fully staffed online ordering/POS system.

There is currently **no integrated online payment gateway**.

---

# 🔮 Future Improvements

Potential future development includes:

* 💳 Online payment integration
* 🧾 Printable / downloadable invoices
* 🖨️ Automated bill printing
* 👨‍🍳 Kitchen order management
* 📊 Sales and revenue analytics
* 📈 Inventory management
* 🔔 Real-time order status updates
* 📱 Progressive Web App / mobile experience
* 🔔 Real-time kitchen notifications
* 👥 Staff-specific roles and permissions
* 📦 Ingredient-level inventory tracking
* 📷 QR-based table identification
* 🪑 More advanced table management
* 📑 Detailed reporting

---

# 💡 What This Project Demonstrates

Zoop Cafe was built to solve a real-world problem, but the project also demonstrates several full-stack engineering concepts:

### Frontend Engineering

* Component-based React architecture
* Client-side routing
* API integration
* Authentication state
* Cart state management
* Responsive UI
* Dynamic rendering
* Form handling
* Admin interfaces

### Backend Engineering

* REST API development
* Express middleware
* Authentication
* Authorization
* Service/controller separation
* Error handling
* Database operations
* Environment-based configuration

### Database Engineering

* Relational data modeling
* Prisma ORM
* Database migrations
* Constraints
* Relationships
* PostgreSQL

### Deployment

* Git-based deployment
* Production frontend hosting
* Production backend hosting
* Managed PostgreSQL
* Development/production environment separation

---

# 📸 Project Showcase

Additional screenshots and demonstrations will be added here.

Suggested showcase order:

1. Customer landing/menu
2. Menu categories
3. Food item details
4. Combo selection
5. Cart
6. Checkout/order placement
7. Order details
8. Admin dashboard
9. Menu management
10. Combo management
11. Dine-in table management
12. Billing

---

# 📌 Project Status

**Status:** Active development

The core restaurant menu, ordering, authentication, administration, combo, and dine-in functionality is implemented.

Some features, particularly payment processing and full operational restaurant/POS workflows, remain future improvements.

---

# 👨‍💻 Author

**K.Bhairav Kumar**

Built as a real-world full-stack project using the PERN stack.

---

# 📄 License

No open-source license has currently been specified for this project.
