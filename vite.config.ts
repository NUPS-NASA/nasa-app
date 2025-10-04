import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    clearScreen: false,
    server: {
      host: true,
      port: 5173,
      hmr: {
        port: 5173,
        protocol: 'ws',
        host: 'localhost',
        clientPort: 5173,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
      allowedHosts: ['unperceptional-ruben-snubbingly.ngrok-free.dev'],
      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  };
});
