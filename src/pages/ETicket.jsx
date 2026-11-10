import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { call, clock, formatIDR, serverNow, shrinkImage } from '../ticketing/client.js'
import './Tickets.css'

const BUY_PATH = '/tiket-2027-pratinjau'

const COPY = {
  id: {
    loading: 'Memuat pesanan',
    notFound: 'Pesanan tidak ditemukan. Periksa lagi link yang kamu buka.',
    offline: 'Tidak bisa terhubung ke server. Periksa koneksi lalu muat ulang.',
    order: (code) => `Pesanan ${code}`,
    total: 'Total',
    seatWord: 'Kursi',
    payTitle: 'Selesaikan pembayaran',
    payLede: (t) => `Transfer tepat ${t}, lalu unggah bukti pembayaran di bawah.`,
    timer: (c) => `Kursimu ditahan ${c} lagi.`,
    bank: 'Transfer bank',
    account: 'Nomor rekening',
    holder: 'Atas nama',
    qris: 'QRIS',
    qrisAlt: 'Kode QRIS untuk pembayaran',
    noPayment: 'Rekening tujuan belum diatur panitia. Hubungi panitia lewat Instagram @harmoniafest.id.',
    copy: 'Salin',
    copied: 'Tersalin',
    proofTitle: 'Bukti pembayaran',
    proofHelp: 'Foto atau tangkapan layar bukti transfer.',
    proofPick: 'Pilih gambar',
    proofNote: 'Catatan untuk panitia (opsional)',
    proofNotePh: 'Contoh: transfer dari BCA a.n. Budi',
    proofSend: 'Kirim bukti pembayaran',
    proofBad: 'Gambar ini tidak bisa dibaca. Coba gambar lain.',
    rejected: (note) => `Bukti sebelumnya belum bisa diterima: ${note}`,
    reviewTitle: 'Bukti diterima, sedang diperiksa',
    reviewLede: 'Panitia memeriksa pembayaranmu. Halaman ini berubah sendiri begitu tiket terbit. Simpan link halaman ini.',
    replace: 'Ganti bukti pembayaran',
    paidTitle: 'Tiketmu sudah jadi',
    paidLede: 'Tunjukkan kode QR di pintu masuk. Satu tiket untuk satu orang.',
    used: 'Sudah dipakai masuk',
    print: 'Simpan sebagai PDF',
    whatsapp: 'Kirim link ini ke WhatsApp',
    waText: (name, link) => `E-tiket ${name}: ${link}`,
    terms: 'Syarat dan ketentuan',
    goneTitle: { expired: 'Waktu pembayaran habis', cancelled: 'Pesanan dibatalkan' },
    goneLede: 'Kursi di pesanan ini sudah dilepas. Kamu bisa memesan lagi.',
    again: 'Pesan tiket lagi',
    draftTitle: 'Pesanan belum selesai',
    draftLede: 'Lengkapi data pemesan untuk melanjutkan.',
    cancel: 'Batalkan pesanan',
    dialogTitle: 'Batalkan pesanan ini?',
    dialogBody: 'Kursi yang kamu pilih akan dilepas dan bisa dibeli orang lain.',
    dialogYes: 'Batalkan pesanan',
    dialogNo: 'Kembali',
    saveLink: 'Simpan link halaman ini. Ini satu-satunya jalan kembali ke pesananmu.',
  },
  en: {
    loading: 'Loading order',
    notFound: 'Order not found. Check the link you opened.',
    offline: 'Cannot reach the server. Check your connection and reload.',
    order: (code) => `Order ${code}`,
    total: 'Total',
    seatWord: 'Seat',
    payTitle: 'Complete your payment',
    payLede: (t) => `Transfer exactly ${t}, then upload proof of payment below.`,
    timer: (c) => `Your seats are held for another ${c}.`,
    bank: 'Bank transfer',
    account: 'Account number',
    holder: 'Account name',
    qris: 'QRIS',
    qrisAlt: 'QRIS code for payment',
    noPayment: 'The committee has not set a payment account yet. Contact them on Instagram @harmoniafest.id.',
    copy: 'Copy',
    copied: 'Copied',
    proofTitle: 'Proof of payment',
    proofHelp: 'A photo or screenshot of the transfer.',
    proofPick: 'Choose image',
    proofNote: 'Note for the committee (optional)',
    proofNotePh: 'Example: transfer from BCA, account name Budi',
    proofSend: 'Send proof of payment',
    proofBad: 'This image could not be read. Try another one.',
    rejected: (note) => `The earlier proof could not be accepted: ${note}`,
    reviewTitle: 'Proof received, being checked',
    reviewLede: 'The committee is checking your payment. This page updates on its own once tickets are issued. Keep the link to this page.',
    replace: 'Replace proof of payment',
    paidTitle: 'Your tickets are ready',
    paidLede: 'Show the QR code at the door. One ticket per person.',
    used: 'Already used for entry',
    print: 'Save as PDF',
    whatsapp: 'Send this link to WhatsApp',
    waText: (name, link) => `E-ticket ${name}: ${link}`,
    terms: 'Terms and conditions',
    goneTitle: { expired: 'Payment time ran out', cancelled: 'Order cancelled' },
    goneLede: 'The seats in this order were released. You can order again.',
    again: 'Order tickets again',
    draftTitle: 'Order not finished',
    draftLede: 'Fill in your details to continue.',
    cancel: 'Cancel order',
    dialogTitle: 'Cancel this order?',
    dialogBody: 'The seats you chose will be released and other people can buy them.',
    dialogYes: 'Cancel order',
    dialogNo: 'Go back',
    saveLink: 'Keep the link to this page. It is the only way back to your order.',
  },
}

export default function ETicket() {
  const { token } = useParams()
  const { lang } = useLanguage()
  const c = COPY[lang]

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [qr, setQr] = useState({})
  const [proof, setProof] = useState('')
  const [note, setNote] = useState('')
  const [proofError, setProofError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [changing, setChanging] = useState(false)
  const [, setTick] = useState(0)
  const dialogRef = useRef(null)

  // Reload while the order can still change on its own: waiting for the
  // buyer's clock to run out, or for the committee to confirm.
  useEffect(() => {
    let alive = true
    let timer
    async function load() {
      const res = await call('order.get', { token })
      if (!alive) return
      if (res.ok) {
        setError('')
        setData(res)
        if (res.order.status === 'waiting' || res.order.status === 'review') timer = setTimeout(load, 15000)
      } else {
        setError(res.error === 'not_found' ? 'notFound' : 'offline')
      }
    }
    load()
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [token])

  const order = data?.order
  const status = order?.status

  useEffect(() => {
    if (status !== 'waiting') return undefined
    const timer = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [status])

  useEffect(() => {
    if (status !== 'paid') return undefined
    let alive = true
    Promise.all(order.tickets.map((t) => QRCode.toDataURL(t.code, { margin: 1, width: 240 }))).then((images) => {
      if (alive) setQr(Object.fromEntries(order.tickets.map((t, i) => [t.id, images[i]])))
    })
    return () => {
      alive = false
    }
  }, [status, order])

  async function pickProof(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setProof(await shrinkImage(file))
      setProofError('')
    } catch {
      setProof('')
      setProofError(c.proofBad)
    }
  }

  async function sendProof(e) {
    e.preventDefault()
    if (!proof) {
      setProofError(c.proofHelp)
      document.getElementById('proof-file')?.focus()
      return
    }
    setBusy(true)
    const res = await call('order.proof', { token, image: proof, note })
    setBusy(false)
    if (res.ok) {
      setData(res)
      setChanging(false)
      setProof('')
    } else {
      setProofError(res.error === 'bad_image' ? c.proofBad : c.offline)
    }
  }

  async function cancel() {
    dialogRef.current?.close()
    await call('order.cancel', { token })
    const res = await call('order.get', { token })
    if (res.ok) setData(res)
  }

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(order.payment.bankAccount)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked: the number is on screen to copy by hand.
    }
  }

  if (error) {
    return (
      <section className="tix">
        <div className="container">
          <h1 className="tix-title">Harmonia</h1>
          <p className="tix-notice">{c[error]}</p>
        </div>
      </section>
    )
  }
  if (!order) {
    return (
      <section className="tix" aria-busy="true">
        <div className="container">
          <p className="tix-quiet">{c.loading}</p>
          <div className="tix-skeleton" />
          <div className="tix-skeleton" />
        </div>
      </section>
    )
  }

  const event = data.event
  const whenWhere = [event.dateText, event.timeText, event.venue].filter(Boolean).join(', ')
  const pay = order.payment
  const hasBank = pay && pay.bankAccount
  const hasQris = pay && pay.qrisImage
  const link = typeof window !== 'undefined' ? window.location.href : ''
  const showUpload = status === 'waiting' || (status === 'review' && changing)

  const summary = (
    <aside className="tix-summary">
      <h2>{c.order(order.code)}</h2>
      <ul className="tix-lines">
        {order.tickets.map((t) => (
          <li key={t.id}>
            <span>
              {c.seatWord} <strong>{t.seat}</strong>, {order.category}
            </span>
            <span>{formatIDR(t.price)}</span>
          </li>
        ))}
        {order.discount > 0 && (
          <li>
            <span>{order.voucherCode}</span>
            <span>-{formatIDR(order.discount)}</span>
          </li>
        )}
      </ul>
      <p className="tix-total">
        <span>{c.total}</span>
        <strong>{formatIDR(order.total)}</strong>
      </p>
      <p className="tix-quiet">{c.saveLink}</p>
    </aside>
  )

  return (
    <section className="tix">
      <div className="container">
        <h1 className="tix-title">{event.name}</h1>

        {status === 'draft' && (
          <div className="tix-done">
            <h2>{c.draftTitle}</h2>
            <p>{c.draftLede}</p>
            <div className="tix-actions">
              <Link className="btn btn-primary" to={BUY_PATH}>
                {c.again}
              </Link>
            </div>
          </div>
        )}

        {(status === 'waiting' || status === 'review') && (
          <div className="tix-grid">
            <div className="tix-main tix-form">
              {status === 'waiting' ? (
                <div>
                  <h2>{c.payTitle}</h2>
                  <p>{c.payLede(formatIDR(order.total))}</p>
                  {order.expiresAt && (
                    <p className="tix-timer" role="timer">
                      {c.timer(clock(order.expiresAt - serverNow()))}
                    </p>
                  )}
                  {order.adminNote && <p className="tix-error">{c.rejected(order.adminNote)}</p>}
                </div>
              ) : (
                <div>
                  <h2>{c.reviewTitle}</h2>
                  <p>{c.reviewLede}</p>
                </div>
              )}

              {status === 'waiting' && !hasBank && !hasQris && <p className="tix-error">{c.noPayment}</p>}

              {status === 'waiting' && hasBank && (
                <dl className="tix-pay">
                  <dt>{c.bank}</dt>
                  <dd>{pay.bankName}</dd>
                  <dt>{c.account}</dt>
                  <dd>
                    <strong>{pay.bankAccount}</strong>
                    <button type="button" className="tix-btn-quiet tix-btn-small" onClick={copyAccount}>
                      {copied ? c.copied : c.copy}
                    </button>
                  </dd>
                  <dt>{c.holder}</dt>
                  <dd>{pay.bankHolder}</dd>
                  <dt>{c.total}</dt>
                  <dd>
                    <strong>{formatIDR(order.total)}</strong>
                  </dd>
                </dl>
              )}

              {status === 'waiting' && hasQris && (
                <div className="tix-qris">
                  <h3>{c.qris}</h3>
                  <img src={pay.qrisImage} alt={c.qrisAlt} />
                </div>
              )}

              {showUpload ? (
                <form className="tix-proof" noValidate onSubmit={sendProof}>
                  <h3>{c.proofTitle}</h3>
                  <label htmlFor="proof-file">
                    <span>{c.proofHelp}</span>
                    <input id="proof-file" type="file" accept="image/*" onChange={pickProof} aria-describedby="proof-err" />
                  </label>
                  {proof && <img className="tix-proof__preview" src={proof} alt={c.proofTitle} />}
                  <span className="tix-error" id="proof-err" role="status">
                    {proofError}
                  </span>
                  <label htmlFor="proof-note">
                    <span>{c.proofNote}</span>
                    <input id="proof-note" type="text" value={note} placeholder={c.proofNotePh} onChange={(e) => setNote(e.target.value)} />
                  </label>
                  <div className="tix-actions">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
                      {c.proofSend}
                    </button>
                    {status === 'waiting' && (
                      <button type="button" className="tix-btn-quiet" onClick={() => dialogRef.current?.showModal()}>
                        {c.cancel}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="tix-actions">
                  <button type="button" className="tix-btn-quiet" onClick={() => setChanging(true)}>
                    {c.replace}
                  </button>
                </div>
              )}
            </div>
            {summary}
          </div>
        )}

        {status === 'paid' && (
          <div className="tix-done">
            <div>
              <h2>{c.paidTitle}</h2>
              <p>{c.paidLede}</p>
              <p className="tix-quiet">
                {c.order(order.code)}
                {whenWhere && `, ${whenWhere}`}
              </p>
            </div>
            <div className="tix-tickets">
              {order.tickets.map((t) => (
                <article className="tix-ticket" key={t.id}>
                  <div className="tix-ticket__body">
                    <p className="tix-ticket__event">{event.name}</p>
                    <p className="tix-ticket__seat">
                      <span>{c.seatWord}</span> {t.seat}
                    </p>
                    <p>{order.category}</p>
                    <p>{t.holderName}</p>
                    {whenWhere && <p className="tix-quiet">{whenWhere}</p>}
                    {t.checkedInAt && <p className="tix-error">{c.used}</p>}
                  </div>
                  <div className="tix-ticket__stub">
                    {qr[t.id] && <img src={qr[t.id]} width="112" height="112" alt={`QR ${c.seatWord} ${t.seat}, ${t.code}`} />}
                    <p className="tix-ticket__code">{t.code}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="tix-actions tix-noprint">
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                {c.print}
              </button>
              <a
                className="tix-btn-quiet"
                href={`https://wa.me/?text=${encodeURIComponent(c.waText(event.name, link))}`}
                target="_blank"
                rel="noreferrer"
              >
                {c.whatsapp}
              </a>
            </div>
            <p className="tix-quiet tix-noprint">{c.saveLink}</p>
            {event.terms && (
              <details className="tix-terms">
                <summary>{c.terms}</summary>
                <p>{event.terms}</p>
              </details>
            )}
          </div>
        )}

        {(status === 'expired' || status === 'cancelled') && (
          <div className="tix-done">
            <h2>{c.goneTitle[status]}</h2>
            <p>{c.goneLede}</p>
            <div className="tix-actions">
              <Link className="btn btn-primary" to={BUY_PATH}>
                {c.again}
              </Link>
            </div>
          </div>
        )}

        <dialog ref={dialogRef} className="tix-dialog" aria-labelledby="et-dialog-title">
          <h2 id="et-dialog-title">{c.dialogTitle}</h2>
          <p>{c.dialogBody}</p>
          <div className="tix-actions">
            <button type="button" className="btn btn-primary" onClick={cancel}>
              {c.dialogYes}
            </button>
            <button type="button" className="tix-btn-quiet" onClick={() => dialogRef.current?.close()}>
              {c.dialogNo}
            </button>
          </div>
        </dialog>
      </div>
    </section>
  )
}
