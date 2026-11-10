import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { call } from '../ticketing/client.js'
import { message, time } from './util.js'

// Door check-in. Reads QR codes with the phone camera; typing the code works
// too, for a cracked screen or a dead camera.
export default function Scanner() {
  const videoRef = useRef(null)
  const lastRef = useRef({ code: '', at: 0 })
  const [camera, setCamera] = useState('off') // off | on | blocked
  const [result, setResult] = useState(null)
  const [manual, setManual] = useState('')
  const [stats, setStats] = useState(null)

  async function loadStats() {
    const res = await call('panel.report')
    if (res.ok) setStats(res.totals)
  }

  async function check(code) {
    const res = await call('panel.checkin', { code })
    if (res.ok) setResult({ kind: 'ok', ...res })
    else if (res.error === 'ticket_used') setResult({ kind: 'used', ...res })
    else if (res.error === 'ticket_not_valid') setResult({ kind: 'bad', ...res, text: 'Pesanan tiket ini belum lunas atau sudah dibatalkan.' })
    else if (res.error === 'ticket_unknown') setResult({ kind: 'bad', text: 'Kode ini bukan tiket Harmonia.' })
    else setResult({ kind: 'bad', text: message(res) })
    loadStats()
  }

  useEffect(() => {
    let alive = true
    call('panel.report').then((res) => {
      if (alive && res.ok) setStats(res.totals)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (camera !== 'on') return undefined
    let stream
    let frame
    let stopped = false
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    function scan() {
      if (stopped) return
      const video = videoRef.current
      if (video && video.readyState >= 2 && video.videoWidth) {
        // A small frame is enough for a QR code and keeps old phones smooth.
        const scale = Math.min(1, 480 / video.videoWidth)
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const found = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)
        const now = Date.now()
        // The same ticket held in front of the camera is read many times a
        // second. Send it once, then ignore it for a few seconds.
        if (found?.data && (found.data !== lastRef.current.code || now - lastRef.current.at > 4000)) {
          lastRef.current = { code: found.data, at: now }
          check(found.data)
        }
      }
      frame = requestAnimationFrame(scan)
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        videoRef.current.srcObject = s
        videoRef.current.play().catch(() => {})
        scan()
      })
      .catch(() => setCamera('blocked'))
    if (!navigator.mediaDevices) setCamera('blocked')

    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((t) => t.stop())
    }
    // check() only uses setters and the network, so it is safe to leave out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera])

  return (
    <div className="panel-stack panel-scan">
      {stats && (
        <dl className="panel-stats">
          <div><dt>Sudah masuk</dt><dd>{stats.checkedIn}</dd></div>
          <div><dt>Belum masuk</dt><dd>{stats.issued - stats.checkedIn}</dd></div>
          <div><dt>Tiket terbit</dt><dd>{stats.issued}</dd></div>
        </dl>
      )}

      <div className={`scan-result scan-result--${result?.kind ?? 'idle'}`} role="status" aria-live="assertive">
        {!result && <p>Arahkan kamera ke kode QR di tiket.</p>}
        {result?.kind === 'ok' && (
          <>
            <p className="scan-result__head">Boleh masuk</p>
            <p className="scan-result__seat">{result.seat}</p>
            <p>{result.category}</p>
            <p>{result.holderName}</p>
          </>
        )}
        {result?.kind === 'used' && (
          <>
            <p className="scan-result__head">Tiket sudah dipakai</p>
            <p className="scan-result__seat">{result.seat}</p>
            <p>{result.category}, {result.holderName}</p>
            <p>Dipindai {time(result.at)} oleh {result.by}.</p>
          </>
        )}
        {result?.kind === 'bad' && (
          <>
            <p className="scan-result__head">Tolak</p>
            <p>{result.text}</p>
            {result.seat && <p>{result.category}, kursi {result.seat}, {result.holderName}</p>}
          </>
        )}
      </div>

      {camera === 'on' && <video ref={videoRef} className="scan-video" muted playsInline aria-label="Tampilan kamera" />}
      {camera === 'blocked' && <p className="tix-error">Kamera tidak bisa dibuka. Izinkan akses kamera di browser, atau ketik kode tiket di bawah.</p>}
      <div className="tix-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={() => setCamera(camera === 'on' ? 'off' : 'on')}>
          {camera === 'on' ? 'Matikan kamera' : 'Nyalakan kamera'}
        </button>
      </div>

      <form
        className="tix-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (manual.trim()) check(manual.trim())
          setManual('')
        }}
      >
        <label htmlFor="scan-code">
          <span>Atau ketik kode tiket</span>
          <div className="tix-inline">
            <input id="scan-code" autoCapitalize="characters" autoComplete="off" value={manual} onChange={(e) => setManual(e.target.value)} />
            <button type="submit" className="tix-btn-quiet">Periksa</button>
          </div>
        </label>
      </form>
    </div>
  )
}
