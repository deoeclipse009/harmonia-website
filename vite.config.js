import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on every interface so phones and tablets on the same Wi-Fi
    // can reach the dev server at http://<your-mac-ip>:5173
    host: true,
  },
})
