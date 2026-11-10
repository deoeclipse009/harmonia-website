// Vercel serverless entry. All logic lives in server/.
import { handle } from '../server/handler.js'

export default async function tix(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'post_only' })
    return
  }
  const { status, json } = await handle({ body: req.body, authorization: req.headers.authorization })
  res.setHeader('Cache-Control', 'no-store')
  res.status(status).json(json)
}
