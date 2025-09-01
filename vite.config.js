import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  server: {
    proxy: {
      '/': {
        target: process.env.VITE_API_TARGET || 'https://skyservice-api.onrender.com',
        changeOrigin: true,
        timeout: 30000,
        proxyTimeout: 30000,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}))
