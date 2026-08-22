import rateLimit from "express-rate-limit";

// Auth endpoints are brute-force targets: cap attempts per IP.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

// View-count endpoint is easy to spam to inflate numbers.
export const viewRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
