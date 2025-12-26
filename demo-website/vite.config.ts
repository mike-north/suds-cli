import { defineConfig } from 'vite'

export default defineConfig({
  // Base path for GitHub Pages deployment
  // Will be set via environment variable during build
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Externalize Node.js-only modules that are dynamically imported
      // The machine package's detect.ts uses dynamic imports that are guarded
      // by runtime environment checks, so these will never actually load
      external: [/^@boba-cli\/machine\/node/, /^node:/],
    },
  },
  server: {
    port: 3000,
  },
})
