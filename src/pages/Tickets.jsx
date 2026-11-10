import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { ticketing } from '../data/ticketing.js'
import * as api from '../ticketing/api.js'
import './Contact.css'
import './Tickets.css'

const COPY = {
  id: {
    kicker: 'Pratinjau internal',
    title: 'Tiket Harmonia 2027',
    lede: 'Pilih kursi, isi data, bayar, lalu terima e-tiket.',
    draft:
      'Prototipe internal. Denah kursi dan harga masih draf, dan pembayaran hanya simulasi. Tidak ada uang yang berpindah.',
    steps: ['Kursi', 'Data', 'Bayar', 'Tiket'],
    stage: 'Panggung',
    mapLabel: 'Denah kursi',
    mapHelp: 'Gunakan tombol panah untuk berpindah kursi, lalu Enter atau Spasi untuk memilih.',
    row: 'Baris',
    seat: 'kursi',
    available: 'Tersedia',
    selected: 'Dipilih',
    sold: 'Terjual',
    bestTitle: 'Pilihkan kursi terbaik',
    bestTier: 'Kategori',
    bestQty: 'Jumlah',
    bestGo: 'Pilihkan',
    noBlock: 'Tidak ada kursi berdampingan sebanyak itu di kategori ini. Coba jumlah lebih sedikit atau kategori lain.',
    summary: 'Pesananmu',
    none: 'Belum ada kursi yang dipilih.',
    total: 'Total',
    next: 'Lanjut ke data pemesan',
    limit: (n) => `Maksimal ${n} kursi per pesanan.`,
    taken: 'Sebagian kursi baru saja terjual. Denah sudah diperbarui, silakan pilih lagi.',
    expired: 'Waktu habis, kursi dilepas kembali. Silakan pilih lagi.',
    timer: 'Kursi ditahan selama',
    name: 'Nama lengkap',
    email: 'Email',
    phone: 'Nomor WhatsApp',
    toPay: 'Lanjut ke pembayaran',
    cancel: 'Batalkan pesanan',
    errName: 'Tulis nama lengkap kamu.',
    errEmail: 'Tulis alamat email kamu.',
    errEmailBad: 'Alamat email ini belum lengkap, contoh: nama@email.com',
    errPhone: 'Tulis nomor WhatsApp, contoh: 081234567890',
    payTitle: 'Pembayaran',
    simulated: 'Simulasi. Belum ada gateway pembayaran yang terhubung, jadi tombol di bawah hanya menandai pesanan sebagai lunas.',
    payGo: 'Simulasikan pembayaran berhasil',
    back: 'Kembali',
    doneTitle: 'Pesanan tercatat',
    doneLede: 'Tunjukkan kode QR ini di pintu masuk. Satu tiket untuk satu kursi.',
    order: 'Kode pesanan',
    print: 'Cetak atau simpan PDF',
    another: 'Buat pesanan lain',
    noEmail: 'Prototipe ini belum mengirim email. Tiket hanya tampil di halaman ini.',
    dialogTitle: 'Batalkan pesanan ini?',
    dialogBody: 'Kursi yang kamu pilih akan dilepas dan bisa dibeli orang lain.',
    dialogYes: 'Lepas kursi',
    dialogNo: 'Lanjutkan pesanan',
    tools: 'Alat prototipe',
    seed: 'Tandai 40 kursi acak sebagai terjual',
    reset: 'Hapus semua data uji',
  },
  en: {
    kicker: 'Internal preview',
    title: 'Harmonia 2027 Tickets',
    lede: 'Pick seats, enter your details, pay, then receive your e-ticket.',
    draft:
      'Internal prototype. The seat plan and prices are drafts, and payment is simulated. No money moves.',
    steps: ['Seats', 'Details', 'Pay', 'Ticket'],
    stage: 'Stage',
    mapLabel: 'Seat plan',
    mapHelp: 'Use the arrow keys to move between seats, then Enter or Space to select.',
    row: 'Row',
    seat: 'seat',
    available: 'Available',
    selected: 'Selected',
    sold: 'Sold',
    bestTitle: 'Pick the best seats for me',
    bestTier: 'Category',
    bestQty: 'How many',
    bestGo: 'Pick seats',
    noBlock: 'There are not that many seats side by side in this category. Try fewer seats or another category.',
    summary: 'Your order',
    none: 'No seats selected yet.',
    total: 'Total',
    next: 'Continue to your details',
    limit: (n) => `At most ${n} seats per order.`,
    taken: 'Some of those seats were just sold. The plan is updated, please choose again.',
    expired: 'Time ran out and the seats were released. Please choose again.',
    timer: 'Seats held for',
    name: 'Full name',
    email: 'Email',
    phone: 'WhatsApp number',
    toPay: 'Continue to payment',
    cancel: 'Cancel order',
    errName: 'Enter your full name.',
    errEmail: 'Enter your email address.',
    errEmailBad: 'That address looks incomplete, for example: name@email.com',
    errPhone: 'Enter a WhatsApp number, for example: 081234567890',
    payTitle: 'Payment',
    simulated: 'Simulated. No payment gateway is connected yet, so the button below only marks the order as paid.',
    payGo: 'Simulate a successful payment',
    back: 'Back',
    doneTitle: 'Order recorded',
    doneLede: 'Show this QR code at the door. One ticket per seat.',
    order: 'Order code',
    print: 'Print or save as PDF',
    another: 'Place another order',
    noEmail: 'This prototype does not send email yet. Tickets appear on this page only.',
    dialogTitle: 'Cancel this order?',
    dialogBody: 'The seats you chose will be released and other people can buy them.',
    dialogYes: 'Release seats',
    dialogNo: 'Keep my order',
    tools: 'Prototype tools',
    seed: 'Mark 40 random seats as sold',
    reset: 'Clear all test data',
  },
}

const STEPS = ['seats', 'details', 'pay', 'done']

function tierName(tier, lang) {
  return lang === 'id' ? tier.nameId : tier.nameEn
}

function SeatMap({ c, lang, sold, selected, onToggle }) {
  const rows = ticketing.rows
  const [focusId, setFocusId] = useState(`${rows[0].label}1`)

  // One tab stop for the whole plan, arrows inside it. 220 separate tab
  // stops would make the page unusable from a keyboard.
  function onKeyDown(e) {
    const delta = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
    }[e.key]
    if (!delta) return
    e.preventDefault()
    // Read the seat from the event, not from state, so a fast key press
    // straight after focusing never acts on a stale seat.
    const match = (e.target.id || '').replace('seat-', '').match(/^([A-Z]+)(\d+)$/)
    if (!match) return
    const rowIndex = Math.min(
      rows.length - 1,
      Math.max(0, rows.findIndex((r) => r.label === match[1]) + delta[0]),
    )
    const perRow = rows[rowIndex].left + rows[rowIndex].right
    const number = Math.min(perRow, Math.max(1, Number(match[2]) + delta[1]))
    const id = `${rows[rowIndex].label}${number}`
    setFocusId(id)
    document.getElementById(`seat-${id}`)?.focus()
  }

  return (
    <div className="seatmap card">
      <ul className="seatmap__legend" aria-hidden="true">
        <li><span className="seat seat--sample" />{c.available}</li>
        <li><span className="seat seat--sample is-selected" />{c.selected}</li>
        <li><span className="seat seat--sample is-sold" />{c.sold}</li>
      </ul>
      <p className="seatmap__help" id="seatmap-help">{c.mapHelp}</p>
      <div className="seatmap__scroll">
        <div
          className="seatmap__plan"
          role="group"
          aria-label={c.mapLabel}
          aria-describedby="seatmap-help"
          onKeyDown={onKeyDown}
        >
          <div className="seatmap__stage">{c.stage}</div>
          {rows.map((row, i) => {
            const tier = api.tierOf(ticketing, row.tier)
            const startsTier = i === 0 || rows[i - 1].tier !== row.tier
            const perRow = row.left + row.right
            return (
              <Fragment key={row.label}>
                {startsTier && (
                  <p className="seatmap__tier">
                    {tierName(tier, lang)}, {api.formatIDR(tier.price)}
                  </p>
                )}
                <div className="seatmap__row">
                  <span className="seatmap__rowlabel" aria-hidden="true">{row.label}</span>
                  {Array.from({ length: perRow }, (_, k) => {
                    const n = k + 1
                    const id = `${row.label}${n}`
                    const isSold = sold.has(id)
                    const isSelected = selected.includes(id)
                    const state = isSold ? c.sold : isSelected ? c.selected : c.available
                    return (
                      <button
                        key={id}
                        id={`seat-${id}`}
                        type="button"
                        className={`seat${isSold ? ' is-sold' : ''}${isSelected ? ' is-selected' : ''}${n === row.left ? ' seat--aisle' : ''}`}
                        aria-pressed={isSold ? undefined : isSelected}
                        aria-disabled={isSold || undefined}
                        aria-label={`${c.row} ${row.label} ${c.seat} ${n}, ${tierName(tier, lang)}, ${api.formatIDR(tier.price)}, ${state}`}
                        tabIndex={id === focusId ? 0 : -1}
                        onFocus={() => setFocusId(id)}
                        onClick={() => {
                          if (!isSold) onToggle(id)
                        }}
                      >
                        <span aria-hidden="true">{isSold ? '' : n}</span>
                      </button>
                    )
                  })}
                  <span className="seatmap__rowlabel" aria-hidden="true">{row.label}</span>
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Tickets() {
  const { lang } = useLanguage()
  const c = COPY[lang]

  const seatById = useMemo(
    () => new Map(api.buildSeats(ticketing).map((s) => [s.id, s])),
    [],
  )

  const [step, setStep] = useState('seats')
  const [sold, setSold] = useState(() => new Set())
  const [selected, setSelected] = useState([])
  const [hold, setHold] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const [notice, setNotice] = useState('')
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [order, setOrder] = useState(null)
  const [qr, setQr] = useState({})
  const [bestTier, setBestTier] = useState(ticketing.tiers[0].id)
  const [bestQty, setBestQty] = useState(2)
  const dialogRef = useRef(null)

  async function refresh() {
    const availability = await api.getAvailability()
    setSold(new Set(availability.sold))
    return availability
  }

  // Pick up where the buyer left off if they reload mid-order.
  useEffect(() => {
    let alive = true
    api.getAvailability().then((availability) => {
      if (!alive) return
      setSold(new Set(availability.sold))
      if (availability.hold) {
        setSelected(availability.hold.seatIds)
        setHold(availability.hold)
        setStep('details')
      }
    })
    return () => {
      alive = false
    }
  }, [])

  // The countdown is derived from the expiry timestamp on every tick, so a
  // sleeping tab or a slow interval cannot make it drift.
  useEffect(() => {
    if (!hold) return undefined
    const expiredCopy = COPY[lang].expired
    const timer = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= hold.expiresAt) {
        clearInterval(timer)
        api.releaseHold().then(() => {
          dialogRef.current?.close()
          setHold(null)
          setSelected([])
          setStep('seats')
          setNotice(expiredCopy)
          api.getAvailability().then((a) => setSold(new Set(a.sold)))
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [hold, lang])

  useEffect(() => {
    if (!order) return undefined
    let alive = true
    Promise.all(
      order.seats.map((s) => QRCode.toDataURL(s.ticketCode, { margin: 1, width: 240 })),
    ).then((images) => {
      if (!alive) return
      setQr(Object.fromEntries(order.seats.map((s, i) => [s.id, images[i]])))
    })
    return () => {
      alive = false
    }
  }, [order])

  const total = api.orderTotal(ticketing, selected)
  const remaining = hold ? Math.max(0, hold.expiresAt - now) : 0
  const clock = `${Math.floor(remaining / 60000)}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`

  function toggle(id) {
    if (selected.includes(id)) {
      setNotice('')
      setSelected(selected.filter((s) => s !== id))
      return
    }
    if (selected.length >= ticketing.maxSeatsPerOrder) {
      setNotice(c.limit(ticketing.maxSeatsPerOrder))
      return
    }
    setNotice('')
    setSelected([...selected, id])
  }

  function pickBest() {
    const qty = Math.min(ticketing.maxSeatsPerOrder, Math.max(1, Number(bestQty) || 1))
    const block = api.pickBest(ticketing, [...sold], bestTier, qty)
    if (block.length === 0) {
      setNotice(c.noBlock)
      return
    }
    setNotice('')
    setSelected(block)
  }

  async function continueToDetails() {
    const result = await api.holdSeats(ticketing, selected)
    if (!result.ok) {
      const availability = await refresh()
      const gone = new Set(availability.sold)
      setSelected((current) => current.filter((id) => !gone.has(id)))
      setNotice(result.reason === 'limit' ? c.limit(ticketing.maxSeatsPerOrder) : c.taken)
      return
    }
    setNotice('')
    setHold(result.hold)
    setNow(Date.now())
    setStep('details')
    window.scrollTo(0, 0)
  }

  function updateBuyer(field) {
    return (e) => {
      setBuyer((b) => ({ ...b, [field]: e.target.value }))
      setErrors((prev) => {
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function submitDetails(e) {
    e.preventDefault()
    const found = {}
    if (!buyer.name.trim()) found.name = c.errName
    if (!buyer.email.trim()) found.email = c.errEmail
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email.trim())) found.email = c.errEmailBad
    const digits = buyer.phone.replace(/[\s+()-]/g, '')
    if (!/^\d{9,15}$/.test(digits)) found.phone = c.errPhone
    setErrors(found)

    const firstBad = ['name', 'email', 'phone'].find((f) => found[f])
    if (firstBad) {
      document.getElementById(`tix-${firstBad}`)?.focus()
      return
    }
    setStep('pay')
    window.scrollTo(0, 0)
  }

  async function pay() {
    const result = await api.payOrder(ticketing, buyer)
    if (!result.ok) {
      setHold(null)
      setSelected([])
      setStep('seats')
      setNotice(result.reason === 'taken' ? c.taken : c.expired)
      refresh()
      return
    }
    setHold(null)
    setOrder(result.order)
    setStep('done')
    refresh()
    window.scrollTo(0, 0)
  }

  async function cancelOrder() {
    dialogRef.current?.close()
    await api.releaseHold()
    setHold(null)
    setSelected([])
    setErrors({})
    setStep('seats')
    refresh()
  }

  function startOver() {
    setOrder(null)
    setQr({})
    setSelected([])
    setBuyer({ name: '', email: '', phone: '' })
    setStep('seats')
    window.scrollTo(0, 0)
  }

  const lines = selected.map((id) => {
    const tier = api.tierOf(ticketing, seatById.get(id).tier)
    return { id, tier: tierName(tier, lang), price: api.formatIDR(tier.price) }
  })

  const orderLines = (
    <>
      <ul className="tix-lines">
        {lines.map((line) => (
          <li key={line.id}>
            <span>
              <strong>{line.id}</strong> {line.tier}
            </span>
            <span>{line.price}</span>
          </li>
        ))}
      </ul>
      <p className="tix-total">
        <span>{c.total}</span>
        <strong>{api.formatIDR(total)}</strong>
      </p>
    </>
  )

  const timer = hold && (
    <p className="tix-timer" role="timer">
      {c.timer} <strong>{clock}</strong>
    </p>
  )

  return (
    <section className="section tix">
      <div className="container">
        <header className="tix-head">
          <p className="eyebrow">{c.kicker}</p>
          <h1>{c.title}</h1>
          <p className="tix-head__lede">{c.lede}</p>
          {ticketing.draft && <p className="tix-draft">{c.draft}</p>}
        </header>

        <ol className="tix-steps">
          {c.steps.map((label, i) => (
            <li key={label} aria-current={STEPS[i] === step ? 'step' : undefined}>
              <span>{i + 1}</span> {label}
            </li>
          ))}
        </ol>

        <p className="tix-notice" role="status" aria-live="polite">
          {notice}
        </p>

        {step === 'seats' && (
          <div className="tix-grid">
            <div className="tix-main">
              <div className="tix-best card">
                <h2>{c.bestTitle}</h2>
                <div className="tix-best__row">
                  <label htmlFor="tix-best-tier">
                    <span>{c.bestTier}</span>
                    <select
                      id="tix-best-tier"
                      value={bestTier}
                      onChange={(e) => setBestTier(e.target.value)}
                    >
                      {ticketing.tiers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {tierName(t, lang)}, {api.formatIDR(t.price)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label htmlFor="tix-best-qty">
                    <span>{c.bestQty}</span>
                    <input
                      id="tix-best-qty"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={ticketing.maxSeatsPerOrder}
                      value={bestQty}
                      onChange={(e) => setBestQty(e.target.value)}
                    />
                  </label>
                  <button type="button" className="btn btn-ink" onClick={pickBest}>
                    {c.bestGo}
                  </button>
                </div>
              </div>
              <SeatMap c={c} lang={lang} sold={sold} selected={selected} onToggle={toggle} />
            </div>

            <aside className="tix-summary card">
              <h2>{c.summary}</h2>
              {selected.length === 0 ? <p className="tix-empty">{c.none}</p> : orderLines}
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={selected.length === 0}
                onClick={continueToDetails}
              >
                {c.next}
              </button>
            </aside>
          </div>
        )}

        {step === 'details' && (
          <div className="tix-grid">
            <form className="contact-form card tix-main" noValidate onSubmit={submitDetails}>
              {timer}
              {[
                ['name', c.name, 'text', 'name'],
                ['email', c.email, 'email', 'email'],
                ['phone', c.phone, 'tel', 'tel'],
              ].map(([field, label, type, autoComplete]) => (
                <label key={field} htmlFor={`tix-${field}`}>
                  <span>{label}</span>
                  <input
                    id={`tix-${field}`}
                    type={type}
                    autoComplete={autoComplete}
                    value={buyer[field]}
                    onChange={updateBuyer(field)}
                    aria-invalid={errors[field] ? 'true' : undefined}
                    aria-describedby={errors[field] ? `tix-err-${field}` : undefined}
                  />
                  {errors[field] && (
                    <span className="field-error" id={`tix-err-${field}`}>
                      {errors[field]}
                    </span>
                  )}
                </label>
              ))}
              <div className="tix-actions">
                <button type="submit" className="btn btn-primary btn-lg">
                  {c.toPay}
                </button>
                <button
                  type="button"
                  className="btn btn-ink"
                  onClick={() => dialogRef.current?.showModal()}
                >
                  {c.cancel}
                </button>
              </div>
            </form>
            <aside className="tix-summary card">
              <h2>{c.summary}</h2>
              {orderLines}
            </aside>
          </div>
        )}

        {step === 'pay' && (
          <div className="tix-grid">
            <div className="tix-pay card tix-main">
              {timer}
              <h2>{c.payTitle}</h2>
              <p className="tix-draft">{c.simulated}</p>
              <div className="tix-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={pay}>
                  {c.payGo}
                </button>
                <button type="button" className="btn btn-ink" onClick={() => setStep('details')}>
                  {c.back}
                </button>
                <button
                  type="button"
                  className="btn btn-ink"
                  onClick={() => dialogRef.current?.showModal()}
                >
                  {c.cancel}
                </button>
              </div>
            </div>
            <aside className="tix-summary card">
              <h2>{c.summary}</h2>
              {orderLines}
            </aside>
          </div>
        )}

        {step === 'done' && order && (
          <div className="tix-done">
            <h2>{c.doneTitle}</h2>
            <p>{c.doneLede}</p>
            <p className="tix-ordercode">
              {c.order}: <strong>{order.code}</strong>, {c.total.toLowerCase()}{' '}
              {api.formatIDR(order.total)}
            </p>
            <div className="tix-tickets">
              {order.seats.map((s) => {
                const tier = api.tierOf(ticketing, seatById.get(s.id).tier)
                return (
                  <article className="tix-ticket card" key={s.id}>
                    <div>
                      <p className="eyebrow">{ticketing.eventName}</p>
                      <p className="tix-ticket__seat">{s.id}</p>
                      <p>
                        {tierName(tier, lang)}, {api.formatIDR(s.price)}
                      </p>
                      <p>{order.buyer.name}</p>
                      <p className="tix-ticket__code">{s.ticketCode}</p>
                    </div>
                    {qr[s.id] && (
                      <img
                        src={qr[s.id]}
                        width="120"
                        height="120"
                        alt={`QR ${c.seat} ${s.id}, ${s.ticketCode}`}
                      />
                    )}
                  </article>
                )
              })}
            </div>
            <p className="tix-draft">{c.noEmail}</p>
            <div className="tix-actions tix-noprint">
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                {c.print}
              </button>
              <button type="button" className="btn btn-ink" onClick={startOver}>
                {c.another}
              </button>
            </div>
          </div>
        )}

        <dialog ref={dialogRef} className="tix-dialog" aria-labelledby="tix-dialog-title">
          <h2 id="tix-dialog-title">{c.dialogTitle}</h2>
          <p>{c.dialogBody}</p>
          <div className="tix-actions">
            <button type="button" className="btn btn-primary" onClick={cancelOrder}>
              {c.dialogYes}
            </button>
            <button type="button" className="btn btn-ink" onClick={() => dialogRef.current?.close()}>
              {c.dialogNo}
            </button>
          </div>
        </dialog>

        <details className="tix-tools tix-noprint">
          <summary>{c.tools}</summary>
          <div className="tix-actions">
            <button
              type="button"
              className="btn btn-ink"
              onClick={async () => {
                await api.seedDemoSales(ticketing, 40)
                const availability = await refresh()
                const gone = new Set(availability.sold)
                setSelected((current) => current.filter((id) => !gone.has(id)))
              }}
            >
              {c.seed}
            </button>
            <button
              type="button"
              className="btn btn-ink"
              onClick={async () => {
                await api.resetAll()
                setHold(null)
                setSelected([])
                setOrder(null)
                setStep('seats')
                refresh()
              }}
            >
              {c.reset}
            </button>
          </div>
        </details>
      </div>
    </section>
  )
}
