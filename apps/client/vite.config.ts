import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@nups-nasa/ui': path.resolve(__dirname, '../../packages/ui/src'),
        '@nups-nasa/hooks': path.resolve(__dirname, '../../packages/hooks/src'),
        '@nups-nasa/utils': path.resolve(__dirname, '../../packages/utils/src'),
        '@nups-nasa/stores': path.resolve(__dirname, '../../packages/stores/src'),
        '@nups-nasa/types': path.resolve(__dirname, '../../packages/types/src'),
      },
    },
  };
});
