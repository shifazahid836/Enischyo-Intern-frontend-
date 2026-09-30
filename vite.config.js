import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The backend (Express) listens here. See backend/.env → PORT.
const API_TARGET = 'http://localhost:5000';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,

    /**
     * Dev proxy — the reason the frontend can call "/api/jobs" and still talk
     * to a server running on another port.
     *
     * The browser sends the request to http://localhost:5173/api/jobs, Vite
     * forwards it to http://localhost:5000/api/jobs and pipes the answer back.
     * Two benefits:
     *
     *   1. Same origin in the browser → no CORS pre-flight at all.
     *   2. The backend port is configured in ONE place, and the API base URL
     *      in the source stays a clean, environment-independent "/api".
     *
     * (`app.js` mounts every resource under both "/" and "/api", so the
     * "/api" prefix below matches the real backend routes.)
     */
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
});
