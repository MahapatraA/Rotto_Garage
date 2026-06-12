/**
 * Sliding window rate limiter — no external packages.
 *
 * Tracks each IP's request timestamps in a Map.
 * On every request it evicts timestamps older than `windowMs`,
 * then checks whether the remaining count exceeds `maxRequests`.
 *
 * This is a true sliding window: the window moves with each
 * request rather than resetting at fixed clock intervals.
 *
 * Usage:
 *   const rateLimiter = require('./middleware/rateLimiter');
 *   app.use('/api/', rateLimiter({ maxRequests: 10, windowMs: 60_000 }));
 */

/**
 * @param {{ maxRequests?: number, windowMs?: number }} options
 */
const rateLimiter = ({ maxRequests = 10, windowMs = 60_000 } = {}) => {
  // ip -> array of request timestamps (ms)
  const store = new Map();

  // Prune IPs that have been quiet for a full window (memory hygiene)
  const pruneInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of store.entries()) {
      const active = timestamps.filter((t) => now - t < windowMs);
      if (active.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, active);
      }
    }
  }, windowMs);

  // Don't keep the process alive just for cleanup
  pruneInterval.unref();

  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Get existing timestamps for this IP, evict those outside the window
    const timestamps = (store.get(ip) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      // Oldest timestamp in the current window tells us when a slot frees up
      const oldestInWindow = timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Try again in ${retryAfterSec}s.`,
        },
      });
    }

    // Record this request and update the store
    timestamps.push(now);
    store.set(ip, timestamps);

    next();
  };
};

module.exports = rateLimiter;