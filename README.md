# RateStore — Full-Stack Store Rating Platform

A role-based web application where users can sign up, browse stores, and submit ratings (1–5).  
Three roles: **System Administrator**, **Normal User**, and **Store Owner**.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Node.js + Express.js              |
| Database  | PostgreSQL 14+                    |
| Frontend  | React 18 + React Router v6        |
| Auth      | JWT (jsonwebtoken + bcryptjs)      |
| Styling   | Plain CSS with design tokens      |

---

## Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── controllers/      # authController, userController, storeController, ratingController
│   │   ├── db/               # index.js (pool), migrate.js, seed.js
│   │   ├── middleware/        # auth.js, errorHandler.js, validate.js
│   │   ├── routes/           # auth.js, users.js, stores.js, ratings.js
│   │   ├── validators/       # shared.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── common/       # index.jsx, Sidebar.jsx, Layout.jsx
    │   ├── context/          # AuthContext.jsx
    │   ├── pages/
    │   │   ├── admin/        # AdminDashboard, AdminUsers, AdminStores
    │   │   ├── user/         # UserStores, UserRatings
    │   │   └── owner/        # OwnerDashboard
    │   ├── services/         # api.js (axios instance)
    │   ├── styles/           # globals.css
    │   ├── App.jsx
    │   └── index.js
    └── package.json
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

---

## 1. PostgreSQL Setup

### macOS (Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
psql postgres
```

### Ubuntu / Debian
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres psql
```

### Inside psql
```sql
CREATE DATABASE store_rating_db;
CREATE USER store_user WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE store_rating_db TO store_user;
\q
```

---

## 2. Backend Setup

```bash
cd store-rating-app/backend

# Install dependencies
npm install

```

Edit `.env`:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
DB_USER=store_user
DB_PASSWORD=yourpassword
JWT_SECRET=change_this_to_a_long_random_string_min_32_chars
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
```

```bash
# Run migrations (creates all tables)
npm run db:migrate

# Seed demo data
npm run db:seed

# Start development server
npm run dev
# → Server running on http://localhost:5000
```

---

## 3. Frontend Setup

```bash
cd store-rating-app/frontend

npm install

```
Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

```bash

npm start
# → React app on http://localhost:3000
```

---

## 4. Demo Login Credentials

| Role         | Email                          | Password    |
|--------------|--------------------------------|-------------|
| Admin        | admin@storerating.com          | Admin@123   |
| Store Owner  | owner1@example.com             | Owner@123   |
| Store Owner  | owner2@example.com             | Owner@123   |
| Normal User  | alice@example.com              | User@1234   |
| Normal User  | bob@example.com                | User@1234   |

---

## 5. API Endpoints

### Base URL: `http://localhost:5000/api`

---

### Auth

| Method | Endpoint         | Auth     | Description                          |
|--------|------------------|----------|--------------------------------------|
| POST   | /auth/register   | No       | Register new normal user             |
| POST   | /auth/login      | No       | Login (all roles)                    |
| PATCH  | /auth/password   | Required | Update own password                  |
| GET    | /auth/me         | Required | Get current user info                |

---

### Users (Admin only)

| Method | Endpoint       | Description                          |
|--------|----------------|--------------------------------------|
| GET    | /users/stats   | Dashboard stats (counts)             |
| GET    | /users         | List users (filter, sort, paginate)  |
| GET    | /users/:id     | Get single user details              |
| POST   | /users         | Create user (any role)               |

**Query params for GET /users:**
- `search` — string, matches name/email/address
- `role` — `admin` | `user` | `owner`
- `sortBy` — `name` | `email` | `address` | `role` | `created_at`
- `sortDir` — `asc` | `desc`
- `page`, `limit`

---

### Stores

| Method | Endpoint                  | Auth              | Description                 |
|--------|---------------------------|-------------------|-----------------------------|
| GET    | /stores                   | admin, user       | List stores (search, sort)  |
| GET    | /stores/:id               | admin, user       | Get single store            |
| POST   | /stores                   | admin             | Create store                |
| GET    | /stores/owner/dashboard   | owner             | Owner dashboard             |

**Query params for GET /stores:**
- `search` — name or address
- `sortBy` — `name` | `email` | `address` | `avg_rating`
- `sortDir`, `page`, `limit`

---

### Ratings (Normal users only)

| Method | Endpoint             | Description                     |
|--------|----------------------|---------------------------------|
| POST   | /ratings             | Submit rating for a store       |
| PUT    | /ratings/:storeId    | Update existing rating          |
| DELETE | /ratings/:storeId    | Remove a rating                 |

---

## 6. Validation Rules Summary

| Field    | Rule                                                          |
|----------|---------------------------------------------------------------|
| name     | Min 20 chars, max 60 chars                                    |
| email    | Valid email format                                            |
| password | 8–16 chars, ≥1 uppercase, ≥1 special character               |
| address  | Optional, max 400 chars                                       |
| score    | Integer 1–5                                                   |

---

## 7. Security Features

- Passwords hashed with **bcrypt** (cost factor 12)
- JWT tokens with configurable expiry
- **Helmet.js** security headers
- **CORS** restricted to frontend origin
- **Rate limiting**: 30 req/15 min on auth routes, 200 req/15 min globally
- Role-based authorization middleware on every protected route
- SQL injection protected via parameterized queries (pg driver)
- Input validation via **express-validator** on all write endpoints

---

## 8. Database Schema Overview

```
users           — id, name, email, password_hash, address, role (enum), created_at, updated_at
stores          — id, name, email, address, owner_id (→ users), created_at, updated_at
ratings         — id, user_id (→ users), store_id (→ stores), score (1-5), created_at, updated_at
                  UNIQUE(user_id, store_id) — one rating per user per store
```

---

## 9. Author

**Paritosh Wandhare**  
Final Year IT Student | Full Stack Developer  
🔗 [LinkedIn](https://www.linkedin.com/in/paritosh-wandhare-959615290/)
🔗 [Portfolio](https://paritosh-wandhare.vercel.app/)
