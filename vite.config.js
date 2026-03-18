import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'mentorix-icon.svg', 'apple-touch-icon.svg'],
            manifest: {
                name: 'Mentorix',
                short_name: 'Mentorix',
                description: 'Gestao academica para professores com calendario, chamadas e desempenho.',
                theme_color: '#0b1020',
                background_color: '#07111f',
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
                        src: 'apple-touch-icon.svg',
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
