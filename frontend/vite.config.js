import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This is essential for Docker container port mapping
    port: 5173, // Match the EXPOSE port in Dockerfile.dev
    // The following allows the frontend container to proxy requests to the backend container
    proxy: {
      '/api': {
        target: 'http://backend:3001', // 'backend' is the service name in docker-compose.yml
        changeOrigin: true,
      },
    },
  },
})
