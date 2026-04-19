import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes', generatedRouteTree: './src/routeTree.gen.ts' }),
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Toute requête commençant par /api/ est redirigée vers Django.
      // En dev Docker : le service s'appelle "back" sur le réseau interne.
      // En dev local sans Docker : changer la cible en http://localhost:8000
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://back:8000',
        changeOrigin: true,
      },
    },
  },
})
