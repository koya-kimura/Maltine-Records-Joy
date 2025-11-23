import { defineConfig } from 'vite'

export default defineConfig({
    root: 'client',
    build: {
        outDir: '../dist/client',
        emptyOutDir: true
    },
    server: {
        port: 3000,
        proxy: {
            '/ws': {
                target: 'ws://localhost:8080',
                ws: true
            }
        }
    }
})