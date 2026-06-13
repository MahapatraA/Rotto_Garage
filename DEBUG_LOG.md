# Debug Log

For each bug you find, fill in an entry below. Be specific about what was broken and how you found it.

For bugs discovered using browser DevTools, include a screenshot.

---

## Bug 1

**File:** `backend/src/middleware/auth.js`

**What was wrong:**
The `authenticate` middleware verified JWTs using `process.env.JWT_SECRET`, but `authController.js` signs all tokens using `process.env.ROTTO_JWT_SECRET`. Because the two values are different (and `JWT_SECRET` is undefined in `.env`), `jwt.verify()` always threw, causing every authenticated request to return `401 — Token is invalid or expired`, even with a freshly issued token.

**How you found it:**
After logging in successfully and receiving a token, all subsequent API calls (e.g. `GET /api/cars`) returned 401. Comparing the signing call in `authController.js` with the verify call in `auth.js` revealed the env key mismatch.

**What you changed:**
```js
// auth.js — before
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// auth.js — after
const decoded = jwt.verify(token, process.env.ROTTO_JWT_SECRET);
```

---

## Bug 2

**File:** `backend/src/controllers/bookingController.js`

**What was wrong:**
Pagination used `skip = page * limit`. With `limit = 10`, requesting page 1 skipped the first 10 records, page 2 skipped 20, and so on — meaning page 1 was always empty and every page returned results one page ahead of what was requested.

**How you found it:**
Seeding the database with 15 bookings and calling `GET /api/bookings/my?page=1&limit=10` returned bookings 11–15 instead of 1–10. Inspecting the controller revealed the formula was `page * limit` instead of `(page - 1) * limit`.

**What you changed:**
```js
// before
const skip = page * limit;

// after
const skip = (page - 1) * limit;
```

---

## Bug 3

**File:** `backend/src/models/Booking.js`

**What was wrong:**
`userId` was declared as `type: String` instead of `type: mongoose.Schema.Types.ObjectId`. This caused two silent failures: (1) `.populate('userId')` did nothing because Mongoose only performs population on ObjectId refs, and (2) queries like `Booking.find({ userId: req.user.id })` could fail to match documents depending on how Mongoose coerced the value on write. `Car.js` in the same project correctly uses `ObjectId`.

**How you found it:**
`getMyBookings` returned an empty array for a user who had created bookings. Adding a `console.log` on the raw `Booking.find()` result showed documents were present but their `userId` field was a plain string, not an ObjectId — confirming the schema type was wrong.

**What you changed:**
```js
// Booking.js — before
userId: {
  type: String,
  ref: 'User',
  required: true,
},

// Booking.js — after
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
},
```

---

## Bug 4

**File:** `backend/src/index.js`

**What was wrong:**
`app.use(errorHandler)` was registered _before_ all route definitions. Express error-handling middleware (the 4-argument `(err, req, res, next)` form) must be the last middleware registered. Because it was registered first, any `next(err)` call inside route handlers bypassed it entirely and fell through to Express's built-in handler, which returned an HTML 500 page instead of the project's JSON error shape.

**How you found it:**
Triggering a deliberate error (passing a malformed MongoDB ID to a route) returned an HTML response with a stack trace instead of the expected `{ success: false, error: { ... } }` JSON. Checking `index.js` showed `app.use(errorHandler)` placed above the route registrations.

**What you changed:**
Moved `app.use(errorHandler)` to after all `app.use('/api/...')` route registrations and after the 404 catch-all:

```js
// after
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => { ... });

app.use((req, res) => { /* 404 */ });

app.use(errorHandler); // ← last
```

---

## Bug 5

**File:** `frontend/src/app/login/page.tsx`

**What was wrong:**
`handleSubmit` did not call `e.preventDefault()`. Clicking the login button triggered the browser's native form submission, which caused a full page reload. The async `api.post('/auth/login', ...)` call was abandoned immediately, so login never completed regardless of credentials.

**How you found it:**
Opened the Network tab in DevTools, clicked Login, and observed the tab reload instantly — the fetch to `/api/auth/login` never appeared in the network requests. Comparing with `register/page.tsx` (which correctly calls `e.preventDefault()` and even has a comment marking it `✅ Correctly prevents page refresh`) confirmed what was missing.

**What you changed:**
```ts
// before
const handleSubmit = async (e: React.FormEvent) => {
  setError('');

// after
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
```

**Screenshot:** *(Network tab showing no fetch request, only a document reload on form submit — captured before fix)*

---

## Bug 6

**File:** `frontend/src/hooks/useAuth.ts`

**What was wrong:**
The `useEffect` that reads the token on mount used `localStorage.getItem('auth_token')`, but the canonical key defined in `api.ts` and used everywhere else — including in the `login` and `logout` callbacks _in the same file_ — is `TOKEN_KEY = 'rotto_token'`. On every page load the hook read `null`, treated the user as unauthenticated, and redirected to `/login`, even for a user who had just logged in.

**How you found it:**
Logged in successfully (token written as `rotto_token` was visible in the Application → Local Storage tab), but immediately got redirected back to `/login`. Setting a breakpoint in `useAuth`'s `useEffect` showed `localStorage.getItem('auth_token')` returning `null` while `rotto_token` held a valid JWT.

**What you changed:**
```ts
// before
const token = localStorage.getItem('auth_token');

// after
const token = localStorage.getItem(TOKEN_KEY);
```

**Screenshot:** *(Application tab showing `rotto_token` present in Local Storage while the app treated the user as unauthenticated — captured before fix)*

---

## Bug 7

**File:** `frontend/src/lib/api.ts`

**What was wrong:**
`buildHeaders()` set `headers['Authorization'] = token` — the raw JWT string with no prefix. The backend's `authenticate` middleware checks `authHeader.startsWith('Bearer ')` and extracts the token with `authHeader.split(' ')[1]`. Without the `Bearer ` prefix the starts-with check failed and every authenticated request returned `401 — No token provided`.

**How you found it:**
After fixing Bug 6, authenticated pages still returned 401. Inspecting the failing request in the Network tab → Headers showed `Authorization: eyJhbGc...` (no `Bearer`). The backend middleware source confirmed it expected the prefix.

**What you changed:**
```ts
// before
if (token) {
  headers['Authorization'] = token;
}

// after
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

**Screenshot:** *(Network tab → Request Headers showing `Authorization: eyJhbGc...` without Bearer prefix, alongside the 401 response — captured before fix)*

---

## Bug 8

**File:** `frontend/src/components/Modal.tsx`

**What was wrong:**
The modal backdrop `<div>` had `position: 'static'` — the browser default. A statically positioned element sits inline in the document flow; it does not cover the viewport, does not dim the background content, and the `onClick` dismiss handler (which checks `e.target === e.currentTarget`) had no practical effect since the element didn't span the screen.

**How you found it:**
Opening any modal showed the modal content appearing inline below the page content rather than as a centred overlay. Inspecting the element in DevTools → Computed Styles showed `position: static` and no `inset` values, confirming the backdrop was not fixed to the viewport.

**What you changed:**
```tsx
// before
style={{
  position: 'static',
  zIndex: 50,
  ...
}}

// after
style={{
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  ...
}}
```

**Screenshot:** *(Elements panel showing `position: static` on the backdrop div, with the modal rendering inline in the page flow — captured before fix)*

---

## Hard Feature

**Option chosen:** All four (A, B, C, D)

**Approach:**

**A — Aggregation Stats Endpoint (`GET /api/admin/stats`)**
Implemented in `backend/src/controllers/adminController.js` using a single `$facet` aggregation pipeline on the `Booking` collection. The four facets run in parallel: `bookingsByStatus` and `bookingsByServiceType` both use `$group`, `last5Bookings` uses `$sort + $limit + $lookup` to populate car and user documents (stripping the password field via `$project`), and `totalRevenue` sums `estimatedCost` across all bookings. Wired up at `GET /api/admin/stats` behind `authenticate + requireAdmin`.

**B — Debounce Hook from Scratch (`useDebounce<T>`)**
Written in `frontend/src/hooks/useDebounce.ts` without any external library. Uses a single `useEffect` that sets a `setTimeout` for `delayMs` and returns a cleanup that calls `clearTimeout` — so the debounced value only updates if the input is stable for the full delay. Wired into the Cars page: a search input drives a `search` state variable, `useDebounce(search, 400)` produces `debouncedSearch`, and `fetchCars` uses it to call `GET /api/cars?search=...`. The backend `getMyCars` was updated to support a `?search` query param via a case-insensitive regex on `make`, `model`, and `registrationNumber`.

**C — Sliding Window Rate Limiter**
Written in `backend/src/middleware/rateLimiter.js` with no external packages. Uses a `Map<ip, number[]>` where each entry is an array of request timestamps. On every request, timestamps older than `windowMs` are evicted from the array first (true sliding window, not fixed-interval reset). If the remaining count is ≥ `maxRequests`, a `429` is returned with a `Retry-After` header calculated as `windowMs - (now - oldestTimestamp)`. A `setInterval` with `.unref()` runs periodically to prune entries for IPs that have gone quiet. Applied at 100 req/60s for all `/api/` routes and 10 req/60s on `/api/auth/` to prevent brute-force.

**D — Optimistic UI for booking status updates**
`handleStatusChange` in `frontend/src/app/bookings/page.tsx` snapshots `bookings` state before the API call, immediately applies the new status via `setBookings(prev => prev.map(...))`, then on API failure restores from the snapshot with another `setBookings(previous)`. No loading spinners — the transition is instant. `BookingCard` receives `onStatusChange` only when `user?.role === 'admin'`, so action buttons are admin-only.
