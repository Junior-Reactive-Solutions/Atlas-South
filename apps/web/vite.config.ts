import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port fixed at 9000 per docs/build/05-ARCHITECTURE-AND-STACK.md §3 (checked free on
// the dev machine before being reserved for the life of this project).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000,
    strictPort: true,
  },
  preview: {
    port: 9000,
    strictPort: true,
  },
});
