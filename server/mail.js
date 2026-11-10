// E-ticket email through Resend. Off until RESEND_API_KEY and MAIL_FROM are
// set; the e-ticket link works without it.
export async function sendTicketEmail(env, order, eventName) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) return 'off'
  if (!order.buyer.email) return 'no address'
  const link = `${env.PUBLIC_URL || ''}/e-tiket/${order.token}`
  const seats = order.tickets.map((t) => t.seat).join(', ')
  const text = [
    `Halo ${order.buyer.name},`,
    '',
    `Pembayaran untuk ${eventName} sudah kami terima.`,
    '',
    `Kode pesanan: ${order.code}`,
    `Kategori: ${order.category}`,
    `Kursi: ${seats}`,
    '',
    `Buka e-tiket kamu di sini: ${link}`,
    '',
    'Tunjukkan kode QR di pintu masuk. Satu tiket untuk satu orang.',
  ].join('\n')
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [order.buyer.email], subject: `E-tiket ${eventName}, pesanan ${order.code}`, text }),
    })
    return res.ok ? 'sent' : `failed ${res.status}`
  } catch {
    return 'failed network'
  }
}
