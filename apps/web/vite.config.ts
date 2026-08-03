import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port fixed at 9000 per docs/build/05-ARCHITECTURE-AND-STACK.md §3 (checked free on
// the dev machine before being reserved for the life of this project).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000,
    strictPort: true,
    // Every fetch() in the app calls a relative /api/... path (see QuoteForm, admin
    // pages, analytics) so it resolves the same way in dev and in production, where
    // the two are served behind the same origin — proxy it to the Express API here so
    // "relative path" holds true in the Vite dev server too, instead of 404-ing against
    // Vite itself.
    proxy: {
      '/api': {
        target: 'http://localhost:9001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 9000,
    strictPort: true,
  },
});
