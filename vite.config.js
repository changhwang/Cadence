import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    // 정적 호스팅(GitHub Pages 하위 경로 포함) 어디에 올려도 동작하도록 상대 경로로 빌드한다.
    base: './',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg', 'apple-touch-icon.png'],
            manifest: {
                name: 'Cadence',
                short_name: 'Cadence',
                description: '운동 · 식단 · 신체 기록 트래커',
                lang: 'ko',
                start_url: './',
                scope: './',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#007AFF',
                icons: [
                    { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
                    { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
                ]
            },
            workbox: {
                // foods 청크(265KB)까지 미리 캐시해 오프라인에서도 음식 검색이 되게 한다.
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
                globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
            },
            devOptions: {
                // 개발 중에는 서비스워커를 끈다(캐시 때문에 수정이 반영 안 되는 혼란 방지).
                enabled: false
            }
        })
    ],
    build: {
        outDir: 'dist',
        target: 'es2020',
        // data/foods.js는 동적 import라 자동으로 별도 청크가 된다.
        chunkSizeWarningLimit: 700
    },
    server: {
        port: 8734
    },
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js']
    }
});
