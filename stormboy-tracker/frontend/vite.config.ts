import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Vite config for Stormboy Tracker frontend.
//
// Dev mode: serves on :5173 with /api/* proxied to the Node/Express
// backend on :3401. Lets us run `npm run dev` (frontend) alongside
// `npm start` (server.js in parent dir).
//
// Build output: ../public-react/  (served by the Express server in
// production via app.use('/v3', express.static(...))).
export default defineConfig({
  // Served from /v3 in production by the Express server. All asset
  // URLs get prefixed accordingly so static-mounted JS/CSS resolves.
  base: '/v3/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3401',
        changeOrigin: false,
      },
    },
  },
  build: {
    outDir: '../public-react',
    emptyOutDir: true,
    sourcemap: true,
  },
});
