# Rotto Garage

A car service booking platform. Customers register vehicles, book service slots, and track their history. Admins manage and update booking statuses.

**Live demo:** https://rotto-garage.vercel.app

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js · Express · MongoDB (Mongoose) |
| Frontend | Next.js 14 · TypeScript · React 18 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Database | MongoDB Atlas (M0 free tier) |
| Deployment | Backend → Railway · Frontend → Vercel |

---

## Local Setup

### Prerequisites

- Node.js ≥ 18
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) M0 cluster
- Git

---

### 1 — Clone the repo

```bash
git clone https://github.com/<your-username>/rotto-garage.git
cd rotto-garage
```

---

### 2 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

# MongoDB Atlas connection string
ROTTO_MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rotto-garage

# Long random string — used to sign JWTs
ROTTO_JWT_SECRET=replace_this_with_something_long_and_random

NODE_ENV=development
```

Start the dev server:

```bash
npm run dev
# Runs on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health` should return `{ success: true }`.

---

### 3 — Frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Open `.env.local` and set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
# Runs on http://localhost:3000
```

---

### 4 — Create an admin account

Register normally through the UI, then open MongoDB Atlas → Browse Collections → `users` and change the `role` field of your user from `"user"` to `"admin"`. Admin users can update booking statuses and access `GET /api/admin/stats`.

---

## API Overview

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Protected |

### Cars
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/cars` | Protected |
| GET | `/api/cars` | Protected |
| GET | `/api/cars/:id` | Protected |
| PUT | `/api/cars/:id` | Protected |
| DELETE | `/api/cars/:id` | Protected |

### Bookings
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/bookings` | Protected |
| GET | `/api/bookings/my` | Protected |
| PUT | `/api/bookings/:id/status` | Admin |
| GET | `/api/bookings` | Admin |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/admin/stats` | Admin |

---

## Deployment

### Backend — Railway

1. Push the repo to GitHub
2. Create a new project on [Railway](https://railway.app) → Deploy from GitHub repo
3. Set root directory to `backend`
4. Add environment variables (same as `.env` above, with `NODE_ENV=production` and `FRONTEND_URL` set to your Vercel URL)
5. Railway auto-detects Node and runs `npm start`

### Frontend — Vercel

1. Go to [Vercel](https://vercel.com) → New Project → Import your GitHub repo
2. Set root directory to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://<your-railway-url>/api`
4. Deploy

> Never commit `.env` or `.env.local` to the repo.

---

## Part 3 — Hard Features Implemented

All four optional hard features were implemented:

**A — Aggregation Stats Endpoint**
`GET /api/admin/stats` — single `$facet` pipeline returning booking counts by status, counts by service type, last 5 bookings with populated car and user, and total estimated revenue.

**B — `useDebounce` Hook**
`frontend/src/hooks/useDebounce.ts` — generic `useDebounce<T>(value, delayMs)` written from scratch using `setTimeout`/`clearTimeout`. Wired to a search input on the Cars page that filters results via `?search=` on the API.

**C — Sliding Window Rate Limiter**
`backend/src/middleware/rateLimiter.js` — no external packages. Uses a `Map<ip, timestamp[]>`, evicts stale timestamps on each request (true sliding window), returns `429` with `Retry-After` header when the limit is exceeded. Applied at 100 req/60s globally and 10 req/60s on auth routes.

**D — Optimistic UI**
Booking status updates apply instantly to the UI before the API call resolves. On failure, the previous state is restored from a snapshot. No spinners.

---

## Project Structure

```
rotto-garage/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # authController, carController, bookingController, adminController
│   │   ├── middleware/     # auth, errorHandler, logger, rateLimiter
│   │   ├── models/         # User, Car, Booking
│   │   └── routes/         # auth, cars, bookings, admin
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # login, register, dashboard, cars, bookings pages
│   │   ├── components/     # CarCard, BookingCard, Modal, Navbar
│   │   ├── hooks/          # useAuth, useDebounce
│   │   ├── lib/            # api.ts
│   │   └── types/          # index.ts
│   ├── .env.example
│   └── package.json
├── DEBUG_LOG.md
└── README.md
```
