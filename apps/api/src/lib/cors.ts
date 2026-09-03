import type { CorsOptions } from 'cors';
import { env } from './env.js';

/**
 * CORS_ALLOWED_ORIGIN is a single env var but can carry multiple origins, comma-separated —
 * needed since the 2026-09-03 DNS cutover, where both the live domain
 * (https://www.atlassouthes.com) and the original Vercel URL
 * (https://atlas-south-web.vercel.app) have to keep working: the Vercel URL still resolves
 * to the same deployment and is useful for admin access independent of DNS state.
 *
 * Trims whitespace and drops empty entries so a trailing comma or stray space in the Render
 * dashboard's env var editor (easy to introduce by hand) doesn't silently produce an origin
 * that matches nothing, or — worse — an empty string that some CORS configurations treat as
 * "allow no origin", which is unambiguous but easy to misread as "allow any origin".
 */
const allowedOrigins = env.CORS_ALLOWED_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

/**
 * cors' `origin` callback rather than a static string/array so a request from a
 * non-allowed origin fails closed with an explicit error the browser reports as a CORS
 * failure, instead of `cors` silently reflecting back whatever Origin header it received
 * (which is what an array target does NOT do here — this is deliberately not
 * `origin: allowedOrigins`, which is safe too, but a callback keeps the failure explicit
 * and makes the allow-list impossible to bypass by construction).
 */
export const corsOptions: CorsOptions = {
  origin(requestOrigin, callback) {
    // No Origin header at all — same-origin requests, curl, server-to-server health
    // checks. These were never subject to CORS in the first place.
    if (!requestOrigin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${requestOrigin} is not allowed by CORS`));
  },
  credentials: true,
};
