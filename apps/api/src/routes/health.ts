import { Router } from 'express';

/** Render health check target — docs/build/12-HOSTING-DEPLOYMENT.md §3. */
export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    // Temporary diagnostic (removed in the very next commit) — determining the correct
    // `trust proxy` hop count for Render/Cloudflare empirically rather than guessing a
    // second time. Echoes back headers the requester already sent themselves; no
    // information disclosure beyond what the caller already knows.
    _diag: { xff: req.headers['x-forwarded-for'] ?? null, reqIp: req.ip, reqIps: req.ips },
  });
});
