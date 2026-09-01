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

/**
 * Consent decisions. Generous relative to the enquiry form because a visitor legitimately
 * hits this more than once — answering the banner, then changing their mind in the
 * preferences panel — but still bounded, since it is an unauthenticated endpoint that
 * writes a row.
 */
export const consentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
});

/**
 * Client crash reports. Capped hard: a page stuck in a render loop can emit errors as fast
 * as the browser can run, and an uncapped reporting endpoint turns one visitor's broken
 * page into a flood of database writes. The limit is per-IP, so a genuine widespread outage
 * still gets reported by other visitors once this one is throttled.
 */
export const clientErrorLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reports — please try again later.' },
});
