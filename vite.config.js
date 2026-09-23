import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        // Use rollupOptions instead of rolldownOptions to avoid Vite 8/Rolldown
        // Windows bug where underscore-prefixed chunk files are not written to disk
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/@inertiajs')) {
                        return 'vendor-inertia';
                    }
                    if (id.includes('node_modules/framer-motion')) {
                        return 'vendor-framer';
                    }
                    if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
                        return 'vendor-three';
                    }
                    if (id.includes('node_modules/chart.js') || id.includes('node_modules/react-chartjs')) {
                        return 'vendor-charts';
                    }
                    if (id.includes('node_modules/html2pdf') || id.includes('node_modules/html2canvas')) {
                        return 'vendor-pdf';
                    }
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
            },
        },
    },
});
