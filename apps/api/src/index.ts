import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from './lib/swagger.js';
import { env } from './lib/env.js';
import { generalApiLimiter, loginLimiter, adminApiLimiter } from './middleware/rateLimiters.js';
import { healthRouter } from './routes/health.js';
import { enquiriesRouter } from './routes/enquiries.js';
import { eventsRouter } from './routes/events.js';
import { contentRouter } from './routes/content.js';
import { visibilityRouter } from './routes/visibility.js';
import { careersRouter } from './routes/careers.js';
import { leadsRouter } from './routes/leads.js';
import adminAuthRouter from './routes/admin/auth.js';
import adminEnquiriesRouter from './routes/admin/enquiries.js';
import { adminApplicationsRouter } from './routes/admin/applications.js';
import adminStatsRouter from './routes/admin/stats.js';
import adminUsersRouter from './routes/admin/users.js';
import adminTotpRouter from './routes/admin/totp.js';
import adminAnalyticsRouter from './routes/admin/analytics.js';
import adminContentRouter from './routes/admin/content.js';
import adminVisibilityRouter from './routes/admin/visibility.js';
import { adminLeadsRouter } from './routes/admin/leads.js';

const app = express();

// Trust the platform's reverse proxy chain so req.ip resolves to the real client IP
// instead of the proxy's own loopback address. Render sits this app behind Cloudflare
// and its own load balancer — without this, every request looks identical to Express
// (empirically confirmed: two requests with different X-Forwarded-For headers both
// logged as `::1`), which silently turns every per-IP rate limiter (login, enquiry,
// general API) into one budget shared by every visitor to the site combined, and
// destroys IP attribution in AdminAuditLog.
//
// `1` (the first attempt) was wrong: it moved the bug from "everyone is ::1" to
// "everyone is one of Render's private 10.x load-balancer addresses" — still not the
// real client, just a different wrong answer, confirmed by re-running the same
// spoofed-XFF test after deploying it. A temporary diagnostic on /api/health (echoing
// the raw XFF chain back for a request with a known spoofed prefix) then showed the
// *actual* chain for this deployment:
//   <attacker-supplied XFF...>, <true client IP>, <Cloudflare's own edge IP>, <Render's
//   private internal LB IP (which is also the raw socket peer, so it appears twice)>
// — three trusted entries after whatever the client sent, not one.
//
// A hardcoded hop-count (`3`) would "fix" this today but is fragile: it silently breaks
// again, in the same wrong-IP way, the moment Render adds or removes an internal hop —
// and a fixed count trusts N hops unconditionally, so anything that ever ends up that
// many hops out gets believed too. Trusting by what each hop actually *is* instead of
// how many there are survives both problems: 'uniquelocal' trusts Render's private
// (RFC 1918) internal address(es) regardless of how many times the request bounces
// through them, and the explicit ranges below trust only Cloudflare's own published
// edge IPs (https://www.cloudflare.com/ips/) — nothing else can inject an
// X-Forwarded-For entry this app will believe.
const CLOUDFLARE_IPV4_RANGES = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
];
const CLOUDFLARE_IPV6_RANGES = [
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
];
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal', ...CLOUDFLARE_IPV4_RANGES, ...CLOUDFLARE_IPV6_RANGES]);

// Swagger UI — registered BEFORE helmet so it can set its own relaxed CSP
// for the docs route only. All other routes still get the strict helmet policy.
// Accessible at GET /api/docs (or /api/docs/ for the redirect).
app.use(
  '/api/docs',
  (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Swagger UI requires inline scripts and styles that the strict CSP blocks.
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
      ].join('; '),
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions),
);

// Response headers — docs/build/07-SECURITY.md §1. Direct fix of the audit finding
// that the previous site set HSTS but nothing else.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'res.cloudinary.com', 'images.unsplash.com'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // docs/build/07-SECURITY.md §1 specifies DENY (helmet's default is SAMEORIGIN) —
    // this site has no legitimate reason to ever be framed by another origin.
    frameguard: { action: 'deny' },
  }),
);

app.use(
  cors({
    origin: env.CORS_ALLOWED_ORIGIN,
    credentials: true,
  }),
);

// Compression middleware — gzip responses for 20-50% bandwidth reduction
// Set threshold to 860 bytes (default is 1 kB) to compress most responses
app.use(compression({ threshold: 860 }));

app.use(express.json({ limit: '100kb' })); // small cap — this API never needs large payloads
app.use(cookieParser()); // Parse httpOnly cookies for JWT refresh tokens
app.use(generalApiLimiter);

app.use('/api', healthRouter);
app.use('/api', enquiriesRouter);
app.use('/api', eventsRouter);
app.use('/api', contentRouter);
app.use('/api', visibilityRouter);
app.use('/api', careersRouter);
app.use('/api', leadsRouter);

// Admin routes — secured with JWT authentication
// loginLimiter applies specifically to the auth endpoint (5 attempts / 15 min);
// adminApiLimiter applies to all other admin endpoints (300 req / 60 s per IP).
app.use('/api/admin/auth', loginLimiter, adminAuthRouter);
app.use('/api/admin/enquiries', adminApiLimiter, adminEnquiriesRouter);
app.use('/api/admin', adminApiLimiter, adminApplicationsRouter);
app.use('/api/admin/stats', adminApiLimiter, adminStatsRouter);
app.use('/api/admin/users', adminApiLimiter, adminUsersRouter);
app.use('/api/admin/totp', adminApiLimiter, adminTotpRouter);
app.use('/api/admin/analytics', adminApiLimiter, adminAnalyticsRouter);
app.use('/api/admin/content', adminApiLimiter, adminContentRouter);
app.use('/api/admin/visibility', adminApiLimiter, adminVisibilityRouter);
app.use('/api/admin', adminApiLimiter, adminLeadsRouter);

// Centralised error handler — never leak stack traces to the client.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Atlas South API listening on port ${env.PORT} (${env.NODE_ENV})`);
});
