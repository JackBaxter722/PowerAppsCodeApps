import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import { powerApps } from '@microsoft/power-apps-vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    host: '::',
    port: 3000,
  },
  plugins: [react(), powerApps()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'router-vendor': ['react-router-dom'],
          'fluent-ui': ['@fluentui/react-components', '@fluentui/react-icons'],
          charts: ['@fluentui/react-charts'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          tanstack: ['@tanstack/react-query', '@tanstack/react-table'],
        },
      },
    },
  },
})
