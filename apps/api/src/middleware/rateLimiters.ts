import rateLimit from 'express-rate-limit';
import { env } from '../lib/env.js';

/**
 * Rate limits per docs/build/07-SECURITY.md §3. In-memory store is acceptable for a
 * single Render instance at MVP scale; documented upgrade path to
 * rate-limiter-flexible + Redis if the app ever scales to multiple instances (an
 * in-memory limiter doesn't share state across instances).
 */

export const enquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions — please try again later.' },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts — please try again later.' },
});

export const generalApiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

export const adminApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
