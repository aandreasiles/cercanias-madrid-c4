import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/cercanias-madrid-c4/',
  server: {
    proxy: {
      '/api-renfe': {
        target: 'https://tiempo-real.renfe.com/renfe-json-cutter',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-renfe/, ''),
        headers: {
          'Referer': 'https://tiempo-real.renfe.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
      '/api-renfe-visor': {
        target: 'https://tiempo-real.renfe.com/renfe-visor',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-renfe-visor/, ''),
        headers: {
          'Referer': 'https://tiempo-real.renfe.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    }
  }
});

