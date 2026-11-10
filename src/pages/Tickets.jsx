import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { ticketing } from '../data/ticketing.js'
import { latestPastEdition } from '../data/editions.js'
import { photographer } from '../data/gallery.js'
import Figure from '../components/Figure.jsx'
import * as api from '../ticketing/api.js'
import './Tickets.css'

const COPY = {
  id: {
    title: 'Harmonia 2027',
    lede: 'Konser musik amal untuk anak-anak Indonesia. Pilih kursimu, bayar, dan tiketmu langsung jadi.',
    proof: (n) => `Edisi 2025 terjual ${n} tiket.`,
    cause: "Sebagian hasil penjualan tiket disalurkan ke SOS Children's Villages Indonesia.",
    when: 'Tanggal dan tempat diumumkan menyusul.',
    from: (p) => `Mulai ${p}`,
    photoAlt: 'Seluruh penampil Harmonia 2025 di atas panggung.',
    photoBy: 'Foto oleh',
    steps: ['Pilih kursi', 'Data pemesan', 'Pembayaran', 'Tiket'],
    stepOf: (i, n, label) => `Langkah ${i} dari ${n}: ${label}`,
    qtyTitle: 'Berapa orang?',
    tierTitle: 'Pilih kategori',
    tierHelp: 'Kami pilihkan kursi terbaik yang masih bersebelahan. Kamu bisa menggantinya di denah.',
    rows: (a, b) => (a === b ? `Baris ${a}` : `Baris ${a} sampai ${b}`),
    left: (n) => (n === 0 ? 'Habis' : `Sisa ${n} kursi`),
    choose: 'Pilih',
    mapTitle: 'Denah kursi',
    mapHelp: 'Gunakan tombol panah untuk berpindah kursi, lalu Enter atau Spasi untuk memilih.',
    stage: 'Panggung',
    row: 'Baris',
    seat: 'kursi',
    seatWord: 'Kursi',
    available: 'Tersedia',
    selected: 'Dipilih',
    sold: 'Terjual',
    noBlock: 'Tidak ada kursi bersebelahan sebanyak itu di kategori ini. Coba jumlah lebih sedikit atau kategori lain.',
    summary: 'Pesananmu',
    none: 'Belum ada kursi dipilih.',
    total: 'Total',
    noFees: 'Tanpa biaya tambahan.',
    holdNote: (m) => `Kursi ditahan ${m} menit setelah kamu lanjut.`,
    next: (t) => `Lanjut, ${t}`,
    nextNone: 'Pilih kursi dulu',
    count: (n) => `${n} kursi`,
    limit: (n) => `Maksimal ${n} kursi per pesanan.`,
    taken: 'Sebagian kursi baru saja terjual. Denah sudah diperbarui, silakan pilih lagi.',
    expired: 'Waktu habis dan kursi dilepas kembali. Silakan pilih lagi.',
    timer: (clock) => `Kursimu ditahan ${clock} lagi.`,
    detailsTitle: 'Data pemesan',
    detailsHelp: 'Nama ini tercetak di tiket.',
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
    payBody: 'Pembayaran online belum diaktifkan. Untuk uji coba, tombol di bawah menandai pesanan ini lunas. Tidak ada uang yang berpindah.',
    payGo: (t) => `Tandai lunas, ${t}`,
    back: 'Ubah data',
    doneTitle: 'Tiketmu sudah jadi',
    doneLede: 'Tunjukkan kode QR di pintu masuk. Satu tiket untuk satu kursi.',
    order: (code) => `Kode pesanan ${code}`,
    noEmail: 'Simpan halaman ini sebagai PDF. Pengiriman tiket lewat email belum aktif.',
    print: 'Simpan sebagai PDF',
    another: 'Pesan lagi',
    dialogTitle: 'Batalkan pesanan ini?',
    dialogBody: 'Kursi yang kamu pilih akan dilepas dan bisa dibeli orang lain.',
    dialogYes: 'Lepas kursi',
    dialogNo: 'Lanjutkan pesanan',
    tools: 'Alat uji',
    seed: 'Tandai 40 kursi acak sebagai terjual',
    reset: 'Hapus semua data uji',
  },
  en: {
    title: 'Harmonia 2027',
    lede: 'A charity concert for the children of Indonesia. Pick your seats, pay, and your tickets are ready straight away.',
    proof: (n) => `The 2025 edition sold ${n} tickets.`,
    cause: "Part of every ticket sale goes to SOS Children's Villages Indonesia.",
    when: 'Date and venue to be announced.',
    from: (p) => `From ${p}`,
    photoAlt: 'The full Harmonia 2025 cast on stage.',
    photoBy: 'Photo by',
    steps: ['Choose seats', 'Your details', 'Payment', 'Tickets'],
    stepOf: (i, n, label) => `Step ${i} of ${n}: ${label}`,
    qtyTitle: 'How many people?',
    tierTitle: 'Choose a category',
    tierHelp: 'We pick the best seats still side by side. You can change them on the plan.',
    rows: (a, b) => (a === b ? `Row ${a}` : `Rows ${a} to ${b}`),
    left: (n) => (n === 0 ? 'Sold out' : `${n} seats left`),
    choose: 'Choose',
    mapTitle: 'Seat plan',
    mapHelp: 'Use the arrow keys to move between seats, then Enter or Space to select.',
    stage: 'Stage',
    row: 'Row',
    seat: 'seat',
    seatWord: 'Seat',
    available: 'Available',
    selected: 'Selected',
    sold: 'Sold',
    noBlock: 'There are not that many seats side by side in this category. Try fewer seats or another category.',
    summary: 'Your order',
    none: 'No seats chosen yet.',
    total: 'Total',
    noFees: 'No extra fees.',
    holdNote: (m) => `Seats are held for ${m} minutes once you continue.`,
    next: (t) => `Continue, ${t}`,
    nextNone: 'Choose seats first',
    count: (n) => (n === 1 ? '1 seat' : `${n} seats`),
    limit: (n) => `At most ${n} seats per order.`,
    taken: 'Some of those seats were just sold. The plan is updated, please choose again.',
    expired: 'Time ran out and the seats were released. Please choose again.',
    timer: (clock) => `Your seats are held for another ${clock}.`,
    detailsTitle: 'Your details',
    detailsHelp: 'This name is printed on the tickets.',
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
    payBody: 'Online payment is not switched on yet. For testing, the button below marks this order as paid. No money moves.',
    payGo: (t) => `Mark as paid, ${t}`,
    back: 'Edit details',
    doneTitle: 'Your tickets are ready',
    doneLede: 'Show the QR code at the door. One ticket per seat.',
    order: (code) => `Order code ${code}`,
    noEmail: 'Save this page as a PDF. Sending tickets by email is not switched on yet.',
    print: 'Save as PDF',
    another: 'Order again',
    dialogTitle: 'Cancel this order?',
    dialogBody: 'The seats you chose will be released and other people can buy them.',
    dialogYes: 'Release seats',
    dialogNo: 'Keep my order',
    tools: 'Test tools',
    seed: 'Mark 40 random seats as sold',
    reset: 'Clear all test data',
  },
}

const STEPS = ['seats', 'details', 'pay', 'done']
const DEFAULT_TIER = 'middle'
const DEFAULT_QTY = 2

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
    // Read the seat from the event, not from state, so a fast key press
    // straight after focusing never acts on a stale seat.
    const match = (e.target.id || '').replace('seat-', '').match(/^([A-Z]+)(\d+)$/)
    if (!match) return
    e.preventDefault()
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
    <div className="seatmap">
      <ul className="seatmap__legend" aria-hidden="true">
        <li><span className="seat seat--sample" />{c.available}</li>
        <li><span className="seat seat--sample is-selected" />{c.selected}</li>
        <li><span className="seat seat--sample is-sold" />{c.sold}</li>
      </ul>
      <p className="tix-sr" id="seatmap-help">{c.mapHelp}</p>
      <div className="seatmap__scroll">
        <div
          className="seatmap__plan"
          role="group"
          aria-label={c.mapTitle}
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
                    <strong>{tierName(tier, lang)}</strong> {api.formatIDR(tier.price)}
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

  const allSeats = useMemo(() => api.buildSeats(ticketing), [])
  const seatById = useMemo(() => new Map(allSeats.map((s) => [s.id, s])), [allSeats])

  const [step, setStep] = useState('seats')
  const [sold, setSold] = useState(() => new Set())
  const [selected, setSelected] = useState([])
  const [tierId, setTierId] = useState(DEFAULT_TIER)
  const [qty, setQty] = useState(DEFAULT_QTY)
  const [hold, setHold] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const [notice, setNotice] = useState('')
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [order, setOrder] = useState(null)
  const [qr, setQr] = useState({})
  const dialogRef = useRef(null)

  async function refresh() {
    const availability = await api.getAvailability()
    setSold(new Set(availability.sold))
    return availability
  }

  // Resume an order in progress after a reload. Otherwise open with a
  // sensible pair of seats already chosen, so the page never starts blank.
  useEffect(() => {
    let alive = true
    api.getAvailability().then((availability) => {
      if (!alive) return
      setSold(new Set(availability.sold))
      if (availability.hold) {
        setSelected(availability.hold.seatIds)
        setHold(availability.hold)
        setStep('details')
      } else {
        setSelected(api.pickBest(ticketing, availability.sold, DEFAULT_TIER, DEFAULT_QTY))
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
  const totalText = api.formatIDR(total)
  const remaining = hold ? Math.max(0, hold.expiresAt - now) : 0
  const clock = `${Math.floor(remaining / 60000)}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`
  const stepIndex = STEPS.indexOf(step)

  // Real counts from the inventory, so "seats left" is never invented.
  const tiers = ticketing.tiers.map((tier) => {
    const rows = ticketing.rows.filter((r) => r.tier === tier.id)
    const left = allSeats.filter((s) => s.tier === tier.id && !sold.has(s.id)).length
    return { ...tier, first: rows[0].label, last: rows[rows.length - 1].label, left }
  })
  const lowestPrice = Math.min(...ticketing.tiers.map((t) => t.price))

  function choose(nextTier, nextQty) {
    setTierId(nextTier)
    setQty(nextQty)
    const block = api.pickBest(ticketing, [...sold], nextTier, nextQty)
    if (block.length === 0) {
      setNotice(c.noBlock)
      return
    }
    setNotice('')
    setSelected(block)
  }

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

  async function backToSeats() {
    const availability = await refresh()
    setHold(null)
    setErrors({})
    setOrder(null)
    setQr({})
    setTierId(DEFAULT_TIER)
    setQty(DEFAULT_QTY)
    setSelected(api.pickBest(ticketing, availability.sold, DEFAULT_TIER, DEFAULT_QTY))
    setStep('seats')
    window.scrollTo(0, 0)
  }

  async function cancelOrder() {
    dialogRef.current?.close()
    await api.releaseHold()
    backToSeats()
  }

  function startOver() {
    setBuyer({ name: '', email: '', phone: '' })
    backToSeats()
  }

  const lines = selected.map((id) => {
    const tier = api.tierOf(ticketing, seatById.get(id).tier)
    return { id, tier: tierName(tier, lang), price: api.formatIDR(tier.price) }
  })

  const summary = (
    <aside className="tix-summary">
      <h2>{c.summary}</h2>
      {selected.length === 0 ? (
        <p className="tix-quiet">{c.none}</p>
      ) : (
        <>
          <ul className="tix-lines">
            {lines.map((line) => (
              <li key={line.id}>
                <span>
                  {c.seatWord} <strong>{line.id}</strong>, {line.tier}
                </span>
                <span>{line.price}</span>
              </li>
            ))}
          </ul>
          <p className="tix-total">
            <span>{c.total}</span>
            <strong>{totalText}</strong>
          </p>
          <p className="tix-quiet">{c.noFees}</p>
        </>
      )}
      {step === 'seats' && (
        <>
          <button
            type="button"
            className="btn btn-primary btn-lg tix-cta"
            disabled={selected.length === 0}
            onClick={continueToDetails}
          >
            {selected.length === 0 ? c.nextNone : c.next(totalText)}
          </button>
          <p className="tix-quiet">{c.holdNote(ticketing.holdMinutes)}</p>
        </>
      )}
      <p className="tix-cause">{c.cause}</p>
    </aside>
  )

  const timer = hold && (
    <p className="tix-timer" role="timer">
      {c.timer(clock)}
    </p>
  )

  return (
    <section className={`tix${step === 'seats' ? ' tix--withbar' : ''}`}>
      <div className="container">
        {step === 'seats' && (
          <header className="tix-hero">
            <div className="tix-hero__text">
              <h1>{c.title}</h1>
              <p className="tix-hero__lede">{c.lede}</p>
              <p className="tix-hero__price">{c.from(api.formatIDR(lowestPrice))}</p>
              <p className="tix-hero__fact">{c.when}</p>
              <p className="tix-hero__fact">
                {c.proof(latestPastEdition.ticketsSold)} {c.cause}
              </p>
            </div>
            <Figure
              src="/photos/hero-band.jpg"
              alt={c.photoAlt}
              ratio="16 / 10"
              priority
              credit={`${c.photoBy} ${photographer}`}
              className="tix-hero__photo"
            />
          </header>
        )}

        {step !== 'seats' && <h1 className="tix-title">{c.title}</h1>}

        <div className="tix-progress">
          <p>{c.stepOf(stepIndex + 1, STEPS.length, c.steps[stepIndex])}</p>
          <div
            className="tix-progress__track"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={stepIndex + 1}
            aria-label={c.stepOf(stepIndex + 1, STEPS.length, c.steps[stepIndex])}
          >
            <span style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        <p className="tix-notice" role="status" aria-live="polite">
          {notice}
        </p>

        {step === 'seats' && (
          <div className="tix-grid">
            <div className="tix-main">
              <div className="tix-block">
                <h2>{c.qtyTitle}</h2>
                <div className="tix-qty">
                  {Array.from({ length: ticketing.maxSeatsPerOrder }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={qty === n}
                      aria-label={c.count(n)}
                      onClick={() => choose(tierId, n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tix-block">
                <h2>{c.tierTitle}</h2>
                <p className="tix-quiet">{c.tierHelp}</p>
                <ul className="tix-tiers">
                  {tiers.map((tier) => (
                    <li key={tier.id} className={tier.id === tierId ? 'is-current' : undefined}>
                      <div>
                        <p className="tix-tiers__name">{tierName(tier, lang)}</p>
                        <p className="tix-quiet">
                          {c.rows(tier.first, tier.last)}
                          {/* A count only when it is news: a full section
                              saying "100 seats left" is noise, not urgency. */}
                          {tier.left <= 20 && `, ${c.left(tier.left)}`}
                        </p>
                      </div>
                      <p className="tix-tiers__price">{api.formatIDR(tier.price)}</p>
                      <button
                        type="button"
                        className="tix-btn-quiet"
                        disabled={tier.left === 0}
                        aria-label={`${c.choose} ${tierName(tier, lang)}, ${api.formatIDR(tier.price)}`}
                        onClick={() => choose(tier.id, qty)}
                      >
                        {c.choose}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tix-block">
                <h2>{c.mapTitle}</h2>
                <SeatMap c={c} lang={lang} sold={sold} selected={selected} onToggle={toggle} />
              </div>
            </div>
            {summary}
          </div>
        )}

        {step === 'details' && (
          <div className="tix-grid">
            <form className="tix-main tix-form" noValidate onSubmit={submitDetails}>
              <div>
                <h2>{c.detailsTitle}</h2>
                <p className="tix-quiet">{c.detailsHelp}</p>
              </div>
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
                    <span className="tix-error" id={`tix-err-${field}`}>
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
                  className="tix-btn-quiet"
                  onClick={() => dialogRef.current?.showModal()}
                >
                  {c.cancel}
                </button>
              </div>
            </form>
            {summary}
          </div>
        )}

        {step === 'pay' && (
          <div className="tix-grid">
            <div className="tix-main tix-form">
              <h2>{c.payTitle}</h2>
              {timer}
              <p>{c.payBody}</p>
              <div className="tix-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={pay}>
                  {c.payGo(totalText)}
                </button>
                <button type="button" className="tix-btn-quiet" onClick={() => setStep('details')}>
                  {c.back}
                </button>
                <button
                  type="button"
                  className="tix-btn-quiet"
                  onClick={() => dialogRef.current?.showModal()}
                >
                  {c.cancel}
                </button>
              </div>
            </div>
            {summary}
          </div>
        )}

        {step === 'done' && order && (
          <div className="tix-done">
            <div>
              <h2>{c.doneTitle}</h2>
              <p>{c.doneLede}</p>
              <p className="tix-quiet">
                {c.order(order.code)}, {c.total.toLowerCase()} {api.formatIDR(order.total)}
              </p>
            </div>
            <div className="tix-tickets">
              {order.seats.map((s) => {
                const tier = api.tierOf(ticketing, seatById.get(s.id).tier)
                return (
                  <article className="tix-ticket" key={s.id}>
                    <div className="tix-ticket__body">
                      <p className="tix-ticket__event">{ticketing.eventName}</p>
                      <p className="tix-ticket__seat">
                        <span>{c.seatWord}</span> {s.id}
                      </p>
                      <p>
                        {tierName(tier, lang)}, {api.formatIDR(s.price)}
                      </p>
                      <p>{order.buyer.name}</p>
                    </div>
                    <div className="tix-ticket__stub">
                      {qr[s.id] && (
                        <img
                          src={qr[s.id]}
                          width="112"
                          height="112"
                          alt={`QR ${c.seat} ${s.id}, ${s.ticketCode}`}
                        />
                      )}
                      <p className="tix-ticket__code">{s.ticketCode}</p>
                    </div>
                  </article>
                )
              })}
            </div>
            <p className="tix-quiet tix-noprint">{c.noEmail}</p>
            <div className="tix-actions tix-noprint">
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                {c.print}
              </button>
              <button type="button" className="tix-btn-quiet" onClick={startOver}>
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
            <button type="button" className="tix-btn-quiet" onClick={() => dialogRef.current?.close()}>
              {c.dialogNo}
            </button>
          </div>
        </dialog>

        <details className="tix-tools tix-noprint">
          <summary>{c.tools}</summary>
          <div className="tix-actions">
            <button
              type="button"
              className="tix-btn-quiet"
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
              className="tix-btn-quiet"
              onClick={async () => {
                await api.resetAll()
                backToSeats()
              }}
            >
              {c.reset}
            </button>
          </div>
        </details>
      </div>

      {step === 'seats' && selected.length > 0 && (
        <div className="tix-bar tix-noprint">
          <p>
            <strong>{c.count(selected.length)}</strong>
            <span>{selected.join(', ')}</span>
          </p>
          <button type="button" className="btn btn-primary" onClick={continueToDetails}>
            {c.next(totalText)}
          </button>
        </div>
      )}
    </section>
  )
}
