import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './lib/env.js';
import { generalApiLimiter } from './middleware/rateLimiters.js';
import { healthRouter } from './routes/health.js';
import { enquiriesRouter } from './routes/enquiries.js';
import { eventsRouter } from './routes/events.js';
import adminAuthRouter from './routes/admin/auth.js';
import adminEnquiriesRouter from './routes/admin/enquiries.js';
import adminStatsRouter from './routes/admin/stats.js';
import adminUsersRouter from './routes/admin/users.js';
import adminAnalyticsRouter from './routes/admin/analytics.js';

const app = express();

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

app.use(express.json({ limit: '100kb' })); // small cap — this API never needs large payloads
app.use(cookieParser()); // Parse httpOnly cookies for JWT refresh tokens
app.use(generalApiLimiter);

app.use('/api', healthRouter);
app.use('/api', enquiriesRouter);
app.use('/api', eventsRouter);

// Admin routes — secured with JWT authentication
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/enquiries', adminEnquiriesRouter);
app.use('/api/admin/stats', adminStatsRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/analytics', adminAnalyticsRouter);

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
