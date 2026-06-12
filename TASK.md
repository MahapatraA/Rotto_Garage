# Rotto Dev Challenge

**Time limit:** 72 hours  
**Stack:** Node.js + Express + MongoDB · Next.js + TypeScript  
**Submission:** GitHub repo (public) + live Vercel demo

---

## The App

**Rotto Garage** is a car service booking platform. Customers register vehicles, book service slots, and track their history. Admins manage and update booking statuses.

The codebase has bugs and incomplete features. Your job:

1. Find and fix the bugs
2. Build out the incomplete features
3. Deploy and submit

---

## Getting Started

**Backend**
```bash
cd backend
npm install
cp .env.example .env       # fill in MongoDB Atlas URI and JWT secret
npm run dev                # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local # set NEXT_PUBLIC_API_URL
npm run dev                # http://localhost:3000
```

Use a free MongoDB Atlas M0 cluster. No other infrastructure needed.

---

## Part 1 — Find and Fix the Bugs

There are **8 bugs** in the codebase — 4 in the backend, 4 in the frontend. They range from logic errors to misconfiguration to broken UI behaviour.

A good starting point: get the app running, try to use it end-to-end, and observe what doesn't work. Some bugs will be obvious from the behaviour. Others will require looking at the code carefully, comparing it against the project's own conventions.

For the frontend bugs specifically, your browser's developer tools are essential.

Document your findings in `DEBUG_LOG.md` — what broke, how you found it, and what you changed. For bugs you found using DevTools, include a screenshot.

---

## Part 2 — Build the Implementation

### Backend

**`src/routes/cars.js`** and **`src/routes/bookings.js`** — wire up the routes (currently empty)

**`src/controllers/carController.js`** — implement all 5 methods:
- `createCar`
- `getMyCars`
- `getCarById`
- `updateCar`
- `deleteCar`

**`src/controllers/bookingController.js`** — implement the remaining 2 methods:
- `updateBookingStatus`
- `getAllBookings`

Study `authController.js` — it's complete and shows the expected patterns and response shapes used throughout the project.

### Frontend

**`src/components/BookingCard.tsx`** — build the component

**`src/app/dashboard/page.tsx`** — implement `fetchStats`

**`src/app/cars/page.tsx`** — implement `fetchCars`, `handleAddCar`, `handleDeleteCar`

**`src/app/bookings/page.tsx`** — implement `fetchBookings`, `fetchCars`, `handleCreateBooking`

---

## Part 3 — Pick One Hard Feature

Implement **at least one** of the following. Both earns extra credit.

### A — Aggregation Stats Endpoint
Create `GET /api/admin/stats` using a single MongoDB `$facet` aggregation query. Return:
- Booking count grouped by status
- Booking count grouped by service type
- Last 5 bookings (with car and user populated)
- Total estimated revenue

### B — Debounce Hook from Scratch
Write a `useDebounce<T>(value: T, delayMs: number): T` hook without any external library. Wire it up to a search input on the Cars page that filters results via the API.

### C — Sliding Window Rate Limiter
Write Express middleware that limits requests to N per window (e.g. 10 per 60 seconds) per IP using a `Map`. Implement a true sliding window — not a fixed window. Return `429` with a `Retry-After` header when the limit is hit. No external packages.

### D — Optimistic UI
When updating a booking's status (admin view), update the UI immediately before the API call resolves. Roll back to the original state on failure. No spinners — the interaction should feel instant.

---

## Part 4 — Deploy and Submit

**Backend:** Railway or Render (both free tier)  
**Frontend:** Vercel — connect your GitHub repo directly  
Set `NEXT_PUBLIC_API_URL` in Vercel's environment variables to point at your deployed backend.

Never commit `.env` or `.env.local` files to the repo.

### GitHub expectations
- Repo must be **public**
- Use feature branches — don't push everything to `main` in one commit
- Commit messages should describe what changed (not "wip" or "fix stuff")
- `README.md` must include setup instructions and the live demo URL

---

## Submission Checklist

- [ ] All bugs fixed
- [ ] All backend TODOs implemented
- [ ] All frontend TODOs implemented
- [ ] `BookingCard.tsx` complete
- [ ] At least one hard feature
- [ ] `DEBUG_LOG.md` filled in with screenshots for DevTools-discovered bugs
- [ ] Backend deployed
- [ ] Frontend on Vercel with working live demo
- [ ] GitHub repo is public with a clean commit history
- [ ] `README.md` includes live URL and local setup instructions

---

## Scoring

| Area | Points |
|------|--------|
| All bugs found and fixed | 25 |
| Backend implementation (CRUD, routing, admin methods) | 25 |
| Frontend implementation (pages, BookingCard) | 20 |
| TypeScript quality (strict types, no `any`) | 10 |
| DEBUG_LOG with DevTools screenshots | 10 |
| Hard feature (10 pts each) | 10+ |
| Git hygiene and README | 5 |
| Live demo | 5 |

**Pass threshold: 60 / 100**
