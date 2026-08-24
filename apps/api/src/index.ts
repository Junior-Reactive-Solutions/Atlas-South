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
