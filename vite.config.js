import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves POST /api/tix from the same handler the Vercel function uses, so
// the ticketing backend runs under `npm run dev` with no extra process.
function tixApi(env) {
  return {
    name: 'tix-api',
    configureServer(server) {
      for (const [key, value] of Object.entries(env)) process.env[key] ??= value
      server.middlewares.use('/api/tix', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ ok: false, error: 'post_only' }))
          return
        }
        let raw = ''
        for await (const chunk of req) {
          raw += chunk
          if (raw.length > 2_000_000) {
            res.statusCode = 413
            res.end(JSON.stringify({ ok: false, error: 'too_large' }))
            return
          }
        }
        let body = null
        try {
          body = JSON.parse(raw || '{}')
        } catch {
          // handled below as an unknown action
        }
        const { handle } = await server.ssrLoadModule('/server/handler.js')
        const out = await handle({ body, authorization: req.headers.authorization })
        res.statusCode = out.status
        res.end(JSON.stringify(out.json))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tixApi(loadEnv(mode, process.cwd(), ''))],
  server: {
    // Listen on every interface so phones and tablets on the same Wi-Fi
    // can reach the dev server at http://<your-mac-ip>:5173
    host: true,
  },
}))
