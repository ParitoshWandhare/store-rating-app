# RateStore - Store Rating Platform

A full-stack role-based web application where users can browse stores, submit ratings, and manage store-related information.

Built using **React.js**, **Node.js**, **Express.js**, and **PostgreSQL**.

---

## Features

### System Administrator

* Dashboard with platform statistics
* Manage users and stores
* Create new users (Admin, Store Owner, Normal User)
* Create and assign stores to owners
* Search, sort, and filter users and stores

### Normal User

* Register and login
* Browse all stores
* Search stores by name or address
* Submit ratings (1–5)
* Update or delete ratings
* View personal ratings

### Store Owner

* Login to owner dashboard
* View assigned stores
* Check average ratings
* Monitor user feedback

---

## Tech Stack

| Layer          | Technology           |
| -------------- | -------------------- |
| Frontend       | React 18             |
| Routing        | React Router v6      |
| Backend        | Node.js + Express.js |
| Database       | PostgreSQL 14+       |
| Authentication | JWT + bcryptjs       |
| Styling        | Plain CSS            |

---

## Project Structure

```text
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   └── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── styles/
    │   ├── App.jsx
    │   └── index.js
    └── package.json
```

---

# Local Setup (Windows)

## Prerequisites

Install:

* Node.js 18+
* PostgreSQL 14+
* npm 9+

Verify installation:

```powershell
node -v
npm -v
psql --version
```

---

# 🗄 PostgreSQL Setup

Open PostgreSQL Shell:

```powershell
psql -U postgres -h localhost
```

Run:

```sql
CREATE DATABASE store_rating_db;

CREATE USER store_user
WITH ENCRYPTED PASSWORD 'yourpassword';

GRANT ALL PRIVILEGES
ON DATABASE store_rating_db
TO store_user;
```

Exit:

```sql
\q
```

---

# Backend Setup

Navigate to backend folder:

```powershell
cd backend
npm install
```

Create `.env` file:

```env
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

Run migrations:

```powershell
npm run db:migrate
```

Seed demo data:

```powershell
npm run db:seed
```

Start backend server:

```powershell
npm run dev
```

Server:

```text
http://localhost:5000
```

---

# Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
```

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start React app:

```powershell
npm start
```

Frontend:

```text
http://localhost:3000
```

---

# Demo Credentials

## Admin

```text
Email: admin@storerating.com
Password: Admin@123
```

## Store Owner

```text
Email: owner1@example.com
Password: Owner@123
```

```text
Email: owner2@example.com
Password: Owner@123
```

## Normal User

```text
Email: alice@example.com
Password: User@1234
```

```text
Email: bob@example.com
Password: User@1234
```

---

# API Endpoints

Base URL:

```text
http://localhost:5000/api
```

---

## Authentication

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /auth/register |
| POST   | /auth/login    |
| PATCH  | /auth/password |
| GET    | /auth/me       |

---

## Users (Admin Only)

| Method | Endpoint     |
| ------ | ------------ |
| GET    | /users/stats |
| GET    | /users       |
| GET    | /users/:id   |
| POST   | /users       |

---

## Stores

| Method | Endpoint                |
| ------ | ----------------------- |
| GET    | /stores                 |
| GET    | /stores/:id             |
| POST   | /stores                 |
| GET    | /stores/owner/dashboard |

---

## Ratings

| Method | Endpoint          |
| ------ | ----------------- |
| POST   | /ratings          |
| PUT    | /ratings/:storeId |
| DELETE | /ratings/:storeId |

---

# Validation Rules

| Field        | Rule                                         |
| ------------ | -------------------------------------------- |
| Name         | 20–60 characters                             |
| Email        | Valid email format                           |
| Password     | 8–16 chars, 1 uppercase, 1 special character |
| Address      | Optional, max 400 chars                      |
| Rating Score | Integer between 1 and 5                      |

---

# Security Features

* JWT Authentication
* Password Hashing (bcrypt)
* Role-Based Authorization
* Helmet Security Headers
* CORS Protection
* Express Rate Limiting
* PostgreSQL Parameterized Queries
* Input Validation using express-validator

---

# Database Schema

## Users

```sql
id
name
email
password_hash
address
role
created_at
updated_at
```

## Stores

```sql
id
name
email
address
owner_id
created_at
updated_at
```

## Ratings

```sql
id
user_id
store_id
score
created_at
updated_at
```

Constraint:

```sql
UNIQUE(user_id, store_id)
```

One user can rate a store only once.

---

# Author

### Paritosh Wandhare

Final Year Information Technology Student

**Portfolio:** https://paritosh-wandhare.vercel.app/

**LinkedIn:** https://www.linkedin.com/in/paritosh-wandhare-959615290/

**GitHub:** https://github.com/paritoshwandhare

