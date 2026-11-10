// Browser side of the ticketing API: one function, one endpoint.
const SESSION_KEY = 'harmonia.panel.session'
const ORDER_KEY = 'harmonia.order.token'

// Difference between the server clock and this device's clock, so a
// countdown is right even when the phone's time is wrong.
let clockOffset = 0
export const serverNow = () => Date.now() + clockOffset

function read(store, key) {
  try {
    return store.getItem(key)
  } catch {
    return null
  }
}

function write(store, key, value) {
  try {
    if (value == null) store.removeItem(key)
    else store.setItem(key, value)
  } catch {
    // Private windows can refuse storage. The current page still works.
  }
}

export const session = {
  get: () => {
    try {
      return JSON.parse(read(sessionStorage, SESSION_KEY) || 'null')
    } catch {
      return null
    }
  },
  set: (value) => write(sessionStorage, SESSION_KEY, value ? JSON.stringify(value) : null),
}

export const draftToken = {
  get: () => read(localStorage, ORDER_KEY),
  set: (value) => write(localStorage, ORDER_KEY, value),
}

export async function call(action, input = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const current = session.get()
  if (current?.token) headers.Authorization = `Bearer ${current.token}`
  let res
  try {
    res = await fetch('/api/tix', { method: 'POST', headers, body: JSON.stringify({ action, ...input }) })
  } catch {
    return { ok: false, error: 'offline' }
  }
  let json
  try {
    json = await res.json()
  } catch {
    return { ok: false, error: 'server_error' }
  }
  if (typeof json.now === 'number') clockOffset = json.now - Date.now()
  if (json.error === 'login_required') session.set(null)
  return json
}

export function formatIDR(amount) {
  return `Rp${Number(amount || 0).toLocaleString('id-ID')}`
}

export function clock(ms) {
  const left = Math.max(0, ms)
  const h = Math.floor(left / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)
  const mm = String(m).padStart(h ? 2 : 1, '0')
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`
}

// Shrinks a photo in the browser before upload: a phone screenshot of a
// transfer is several megabytes, the committee needs a few hundred kilobytes.
export function shrinkImage(file, maxSide = 1100, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable image'))
    }
    img.src = url
  })
}
