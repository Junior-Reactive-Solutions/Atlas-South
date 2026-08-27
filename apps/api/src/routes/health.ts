import { Router } from 'express';

/** Render health check target — docs/build/12-HOSTING-DEPLOYMENT.md §3. */
export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
