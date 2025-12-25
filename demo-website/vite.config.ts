import { defineConfig } from 'vite'

export default defineConfig({
  // Base path for GitHub Pages deployment
  // Will be set via environment variable during build
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
})
