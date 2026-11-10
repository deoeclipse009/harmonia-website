import { formatIDR } from '../ticketing/client.js'

export const STATUS = {
  draft: 'Sedang mengisi data',
  waiting: 'Menunggu pembayaran',
  review: 'Perlu dicek',
  paid: 'Lunas',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
}

export const CHANNEL = { online: 'Online', direct: 'Jual langsung', invitation: 'Undangan' }

export const ERRORS = {
  offline: 'Tidak bisa terhubung ke server.',
  server_error: 'Server bermasalah. Coba lagi.',
  forbidden: 'Akun ini tidak punya akses ke bagian ini.',
  login_required: 'Sesi berakhir. Silakan masuk lagi.',
  taken: 'Sebagian kursi sudah diambil. Denah diperbarui.',
  seats_in_use: 'Ada kursi yang sudah dipesan di kategori ini, jadi tidak bisa dihapus atau dikecilkan.',
  bad_image: 'Gambar terlalu besar atau formatnya tidak didukung.',
  invalid: 'Ada isian yang belum benar.',
  cannot_confirm: 'Pesanan ini tidak bisa dikonfirmasi.',
  already_closed: 'Pesanan ini sudah ditutup.',
  not_paid: 'Pesanan ini belum lunas.',
}

export const message = (res) => ERRORS[res.error] ?? `Gagal: ${res.error}`

export function time(ms) {
  if (!ms) return ''
  return new Date(ms).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// <input type="datetime-local"> speaks local time without a zone.
export function toInput(ms) {
  if (!ms) return ''
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 16)
}
export const fromInput = (value) => (value ? new Date(value).getTime() : null)

export function downloadCsv(name, header, rows) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const text = [header, ...rows].map((r) => r.map(cell).join(',')).join('\n')
  // The BOM makes Excel read names with accents correctly.
  const url = URL.createObjectURL(new Blob(['﻿', text], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export { formatIDR }
