import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'InFocus CineLog',
          short_name: 'InFocus',
          description: 'Deine moderne Watchlist für Filme und Serien.',
          theme_color: '#0B0E14',
          background_color: '#0B0E14',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: 'https://cdn-icons-png.flaticon.com/512/2503/2503508.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://cdn-icons-png.flaticon.com/512/2503/2503508.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        devOptions: {
           enabled: false
        }
      })
    ],
    base: './', 
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Manual chunks disabled - caused React 19 circular dependency issues
          // React 19 + Vite bundling works better with default chunking
        }
      },
      chunkSizeWarningLimit: 1000 
    },
    server: {
      host: '0.0.0.0',
      port: 3000
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.VITE_TMDB_API_KEY': JSON.stringify(env.VITE_TMDB_API_KEY || ''),
      'process.env.VITE_OMDB_API_KEY': JSON.stringify(env.VITE_OMDB_API_KEY || ''),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || '')
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './test_setup.ts', // Erstellen wir gleich
      include: ['**/*.test.ts', '**/*.test.tsx'],
    },
  };
});