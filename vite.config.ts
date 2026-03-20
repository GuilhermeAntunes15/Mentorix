import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'mentorix-icon.svg', 'mentorix-maskable-icon.svg', 'apple-touch-icon.svg'],
      manifest: {
        name: 'Mentorix',
        short_name: 'Mentorix',
        description: 'Gestao academica para professores com identidade visual exclusiva no modo WPA.',
        theme_color: '#04070d',
        background_color: '#04070d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'mentorix-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'mentorix-maskable-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
