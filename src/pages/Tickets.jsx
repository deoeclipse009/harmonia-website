import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { latestPastEdition } from '../data/editions.js'
import { photographer } from '../data/gallery.js'
import Figure from '../components/Figure.jsx'
import SeatPicker from '../ticketing/SeatPicker.jsx'
import { call, clock, draftToken, formatIDR, serverNow } from '../ticketing/client.js'
import './Tickets.css'

const COPY = {
  id: {
    lede: 'Konser musik amal untuk anak-anak Indonesia. Pilih kategori, pilih kursi, lalu bayar lewat transfer atau QRIS.',
    proof: (n) => `Edisi 2025 terjual ${n} tiket.`,
    cause: "Sebagian hasil penjualan tiket disalurkan ke SOS Children's Villages Indonesia.",
    when: 'Tanggal dan tempat diumumkan menyusul.',
    from: (p) => `Mulai ${p}`,
    photoAlt: 'Seluruh penampil Harmonia 2025 di atas panggung.',
    photoBy: 'Foto oleh',
    steps: ['Pilih kategori', 'Pilih kursi', 'Data pemesan'],
    stepOf: (i, n, label) => `Langkah ${i} dari ${n}: ${label}`,
    catTitle: 'Kategori tiket',
    status: { not_started: 'Belum dibuka', sold_out: 'Habis', ended: 'Penjualan berakhir' },
    left: (n) => `Sisa ${n} kursi`,
    choose: 'Pilih kursi',
    back: 'Ganti kategori',
    seat: { title: 'Denah kursi', help: 'Gunakan tombol panah untuk berpindah kursi, lalu Enter atau Spasi untuk memilih.', stage: 'Arah panggung', row: 'Baris', seat: 'kursi', available: 'Tersedia', selected: 'Dipilih', sold: 'Tidak tersedia' },
    max: (n) => `Maksimal ${n} kursi per pesanan.`,
    summary: 'Pesananmu',
    none: 'Belum ada kursi dipilih.',
    seatWord: 'Kursi',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Potongan',
    noFees: 'Tanpa biaya tambahan.',
    holdNote: (m) => `Kursi ditahan ${m} menit setelah kamu lanjut.`,
    next: (t) => `Lanjut, ${t}`,
    nextNone: 'Pilih kursi dulu',
    count: (n) => `${n} kursi`,
    taken: 'Sebagian kursi baru saja diambil orang lain. Denah sudah diperbarui, silakan pilih lagi.',
    notOnSale: 'Kategori ini sedang tidak dijual.',
    expired: 'Waktu habis dan kursi dilepas kembali. Silakan pilih lagi.',
    timer: (c) => `Kursimu ditahan ${c} lagi.`,
    detailsTitle: 'Data pemesan',
    detailsHelp: 'E-tiket dikirim ke email ini.',
    name: 'Nama lengkap',
    email: 'Email',
    phone: 'Nomor WhatsApp',
    holdersTitle: 'Nama di setiap tiket',
    holdersHelp: 'Kosongkan jika sama dengan nama pemesan.',
    holder: (seat) => `Kursi ${seat}`,
    voucher: 'Kode voucher',
    voucherApply: 'Pakai',
    voucherOk: (d) => `Voucher dipakai, potongan ${d}.`,
    voucherBad: {
      unknown: 'Kode voucher tidak dikenali.',
      not_started: 'Voucher ini belum berlaku.',
      ended: 'Voucher ini sudah berakhir.',
      used_up: 'Voucher ini sudah habis dipakai.',
      wrong_category: 'Voucher ini tidak berlaku untuk kategori ini.',
      min_total: 'Total pesanan belum mencapai syarat voucher.',
    },
    toPay: (t) => `Buat pesanan, ${t}`,
    cancel: 'Batalkan pesanan',
    err: {
      name: 'Tulis nama lengkap kamu.',
      email: 'Tulis alamat email yang lengkap, contoh: nama@email.com',
      phone: 'Tulis nomor WhatsApp, contoh: 081234567890',
    },
    dialogTitle: 'Batalkan pesanan ini?',
    dialogBody: 'Kursi yang kamu pilih akan dilepas dan bisa dibeli orang lain.',
    dialogYes: 'Lepas kursi',
    dialogNo: 'Lanjutkan pesanan',
    offline: 'Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.',
    notReady: 'Sistem tiket belum disambungkan ke database.',
    loading: 'Memuat tiket',
  },
  en: {
    lede: 'A charity concert for the children of Indonesia. Choose a category, choose your seats, then pay by bank transfer or QRIS.',
    proof: (n) => `The 2025 edition sold ${n} tickets.`,
    cause: "Part of every ticket sale goes to SOS Children's Villages Indonesia.",
    when: 'Date and venue to be announced.',
    from: (p) => `From ${p}`,
    photoAlt: 'The full Harmonia 2025 cast on stage.',
    photoBy: 'Photo by',
    steps: ['Choose a category', 'Choose seats', 'Your details'],
    stepOf: (i, n, label) => `Step ${i} of ${n}: ${label}`,
    catTitle: 'Ticket categories',
    status: { not_started: 'Not open yet', sold_out: 'Sold out', ended: 'Sales ended' },
    left: (n) => `${n} seats left`,
    choose: 'Choose seats',
    back: 'Change category',
    seat: { title: 'Seat plan', help: 'Use the arrow keys to move between seats, then Enter or Space to select.', stage: 'Stage this way', row: 'Row', seat: 'seat', available: 'Available', selected: 'Selected', sold: 'Unavailable' },
    max: (n) => `At most ${n} seats per order.`,
    summary: 'Your order',
    none: 'No seats chosen yet.',
    seatWord: 'Seat',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',
    noFees: 'No extra fees.',
    holdNote: (m) => `Seats are held for ${m} minutes once you continue.`,
    next: (t) => `Continue, ${t}`,
    nextNone: 'Choose seats first',
    count: (n) => (n === 1 ? '1 seat' : `${n} seats`),
    taken: 'Some of those seats were just taken by someone else. The plan is updated, please choose again.',
    notOnSale: 'This category is not on sale right now.',
    expired: 'Time ran out and the seats were released. Please choose again.',
    timer: (c) => `Your seats are held for another ${c}.`,
    detailsTitle: 'Your details',
    detailsHelp: 'The e-ticket is sent to this email.',
    name: 'Full name',
    email: 'Email',
    phone: 'WhatsApp number',
    holdersTitle: 'Name on each ticket',
    holdersHelp: 'Leave blank to use the buyer name.',
    holder: (seat) => `Seat ${seat}`,
    voucher: 'Voucher code',
    voucherApply: 'Apply',
    voucherOk: (d) => `Voucher applied, ${d} off.`,
    voucherBad: {
      unknown: 'That voucher code is not recognised.',
      not_started: 'This voucher is not valid yet.',
      ended: 'This voucher has ended.',
      used_up: 'This voucher has been used up.',
      wrong_category: 'This voucher does not apply to this category.',
      min_total: 'The order total is below the voucher minimum.',
    },
    toPay: (t) => `Place order, ${t}`,
    cancel: 'Cancel order',
    err: {
      name: 'Enter your full name.',
      email: 'Enter a complete email address, for example: name@email.com',
      phone: 'Enter a WhatsApp number, for example: 081234567890',
    },
    dialogTitle: 'Cancel this order?',
    dialogBody: 'The seats you chose will be released and other people can buy them.',
    dialogYes: 'Release seats',
    dialogNo: 'Keep my order',
    offline: 'Cannot reach the server. Check your connection and try again.',
    notReady: 'The ticket system is not connected to a database yet.',
    loading: 'Loading tickets',
  },
}

export default function Tickets() {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [categories, setCategories] = useState([])
  const [draftMinutes, setDraftMinutes] = useState(10)
  const [loadError, setLoadError] = useState('')
  const [step, setStep] = useState('category')
  const [section, setSection] = useState(null) // seats.get payload
  const [selected, setSelected] = useState([])
  const [order, setOrder] = useState(null)
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '' })
  const [holders, setHolders] = useState([])
  const [voucher, setVoucher] = useState({ code: '', discount: 0, message: '', ok: false })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [tick, setTick] = useState(0)
  const dialogRef = useRef(null)

  async function loadEvent() {
    const res = await call('event.get')
    if (!res.ok) {
      setLoadError(res.error === 'not_configured' ? 'notReady' : 'offline')
      return null
    }
    setLoadError('')
    setEvent(res.event)
    setCategories(res.categories)
    setDraftMinutes(res.draftMinutes)
    return res
  }

  // Open the page, and pick an unfinished order back up after a reload.
  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await call('event.get')
      if (!alive) return
      if (!res.ok) {
        setLoadError(res.error === 'not_configured' ? 'notReady' : 'offline')
        return
      }
      setEvent(res.event)
      setCategories(res.categories)
      setDraftMinutes(res.draftMinutes)
      const token = draftToken.get()
      if (!token) return
      const saved = await call('order.get', { token })
      if (!alive) return
      if (saved.ok && saved.order.status === 'draft') {
        setOrder(saved.order)
        setHolders(saved.order.tickets.map(() => ''))
        setStep('details')
      } else {
        draftToken.set(null)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // Countdown for the held seats, measured against the server clock.
  useEffect(() => {
    if (step !== 'details' || !order?.expiresAt) return undefined
    const expiredCopy = COPY[lang].expired
    const timer = setInterval(() => {
      setTick((n) => n + 1)
      if (serverNow() >= order.expiresAt) {
        clearInterval(timer)
        dialogRef.current?.close()
        draftToken.set(null)
        setOrder(null)
        setSelected([])
        setSection(null)
        setStep('category')
        setNotice(expiredCopy)
        call('event.get').then((res) => res.ok && setCategories(res.categories))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [step, order, lang])

  async function openCategory(cat) {
    setBusy(true)
    const res = await call('seats.get', { categoryId: cat.id })
    setBusy(false)
    if (!res.ok) {
      setNotice(c.offline)
      return
    }
    setNotice('')
    setSection({ ...res, price: cat.price, maxPerOrder: cat.maxPerOrder })
    setSelected([])
    setStep('seats')
    window.scrollTo(0, 0)
  }

  function toggle(id) {
    if (selected.includes(id)) {
      setNotice('')
      setSelected(selected.filter((s) => s !== id))
      return
    }
    if (selected.length >= section.maxPerOrder) {
      setNotice(c.max(section.maxPerOrder))
      return
    }
    setNotice('')
    setSelected([...selected, id])
  }

  async function holdSeats() {
    setBusy(true)
    const res = await call('order.create', { categoryId: section.id, seats: selected })
    setBusy(false)
    if (!res.ok) {
      if (res.error === 'taken' || res.error === 'not_on_sale') {
        const fresh = await call('seats.get', { categoryId: section.id })
        if (fresh.ok) {
          setSection({ ...section, taken: fresh.taken })
          setSelected(selected.filter((s) => !fresh.taken.includes(s)))
        }
        setNotice(res.error === 'taken' ? c.taken : c.notOnSale)
      } else if (res.error === 'too_many') {
        setNotice(c.max(res.max))
      } else {
        setNotice(c.offline)
      }
      return
    }
    draftToken.set(res.order.token)
    setOrder(res.order)
    setHolders(res.order.tickets.map(() => ''))
    setVoucher({ code: '', discount: 0, message: '', ok: false })
    setNotice('')
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

  async function applyVoucher() {
    if (!voucher.code.trim()) return
    const res = await call('voucher.check', { token: order.token, code: voucher.code })
    if (res.ok) setVoucher({ code: res.code, discount: res.discount, message: c.voucherOk(formatIDR(res.discount)), ok: true })
    else setVoucher({ ...voucher, discount: 0, ok: false, message: c.voucherBad[res.reason] ?? c.voucherBad.unknown })
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await call('order.details', { token: order.token, buyer, holders, voucherCode: voucher.ok ? voucher.code : '' })
    setBusy(false)
    if (res.ok) {
      draftToken.set(null)
      navigate(`/e-tiket/${order.token}`)
      return
    }
    if (res.error === 'invalid') {
      const found = Object.fromEntries(Object.keys(res.fields).map((f) => [f, c.err[f]]))
      setErrors(found)
      const first = ['name', 'email', 'phone'].find((f) => found[f])
      document.getElementById(`tix-${first}`)?.focus()
    } else if (res.error === 'voucher_invalid') {
      setVoucher({ ...voucher, discount: 0, ok: false, message: c.voucherBad[res.reason] ?? c.voucherBad.unknown })
    } else if (res.error === 'expired' || res.error === 'not_draft') {
      draftToken.set(null)
      setOrder(null)
      setStep('category')
      setNotice(c.expired)
      loadEvent()
    } else {
      setNotice(c.offline)
    }
  }

  async function cancelOrder() {
    dialogRef.current?.close()
    await call('order.cancel', { token: order.token })
    draftToken.set(null)
    setOrder(null)
    setSelected([])
    setSection(null)
    setErrors({})
    setStep('category')
    loadEvent()
  }

  if (loadError) {
    return (
      <section className="tix">
        <div className="container">
          <h1 className="tix-title">Harmonia</h1>
          <p className="tix-notice">{c[loadError]}</p>
        </div>
      </section>
    )
  }
  if (!event) {
    return (
      <section className="tix" aria-busy="true">
        <div className="container">
          <p className="tix-quiet">{c.loading}</p>
          <div className="tix-skeleton" />
          <div className="tix-skeleton" />
          <div className="tix-skeleton" />
        </div>
      </section>
    )
  }

  const stepIndex = { category: 0, seats: 1, details: 2 }[step]
  const lowest = categories.length ? Math.min(...categories.map((x) => x.price)) : 0
  const seatTotal = section ? selected.length * section.price : 0
  const whenWhere = [event.dateText, event.timeText, event.venue].filter(Boolean).join(', ')
  void tick

  return (
    <section className={`tix${step === 'seats' ? ' tix--withbar' : ''}`}>
      <div className="container">
        {step === 'category' ? (
          <header className="tix-hero">
            <div className="tix-hero__text">
              <h1>{event.name}</h1>
              <p className="tix-hero__lede">{c.lede}</p>
              {lowest > 0 && <p className="tix-hero__price">{c.from(formatIDR(lowest))}</p>}
              <p className="tix-hero__fact">{whenWhere || c.when}</p>
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
        ) : (
          <h1 className="tix-title">{event.name}</h1>
        )}

        <div className="tix-progress">
          <p>{c.stepOf(stepIndex + 1, 3, c.steps[stepIndex])}</p>
          <div
            className="tix-progress__track"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={stepIndex + 1}
            aria-label={c.stepOf(stepIndex + 1, 3, c.steps[stepIndex])}
          >
            <span style={{ width: `${((stepIndex + 1) / 3) * 100}%` }} />
          </div>
        </div>

        <p className="tix-notice" role="status" aria-live="polite">
          {notice}
        </p>

        {step === 'category' && (
          <div className="tix-block">
            <h2>{c.catTitle}</h2>
            <ul className="tix-tiers">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <div>
                    <p className="tix-tiers__name">{cat.name}</p>
                    <p className="tix-quiet">
                      {cat.status !== 'on_sale'
                        ? c.status[cat.status]
                        : cat.left <= 20
                          ? c.left(cat.left)
                          : cat.description}
                    </p>
                  </div>
                  <p className="tix-tiers__price">{formatIDR(cat.price)}</p>
                  <button
                    type="button"
                    className="tix-btn-quiet"
                    disabled={cat.status !== 'on_sale' || busy}
                    aria-label={`${c.choose}, ${cat.name}, ${formatIDR(cat.price)}`}
                    onClick={() => openCategory(cat)}
                  >
                    {c.choose}
                  </button>
                </li>
              ))}
            </ul>
            <p className="tix-quiet">{c.noFees} {c.cause}</p>
          </div>
        )}

        {step === 'seats' && section && (
          <div className="tix-grid">
            <div className="tix-main">
              <div className="tix-block">
                <div className="tix-row">
                  <h2>
                    {section.name}, {formatIDR(section.price)}
                  </h2>
                  <button type="button" className="tix-btn-quiet" onClick={() => setStep('category')}>
                    {c.back}
                  </button>
                </div>
                <SeatPicker
                  rows={section.rows}
                  blocked={section.blocked}
                  taken={section.taken}
                  selected={selected}
                  onToggle={toggle}
                  labels={c.seat}
                />
              </div>
            </div>
            <aside className="tix-summary">
              <h2>{c.summary}</h2>
              {selected.length === 0 ? (
                <p className="tix-quiet">{c.none}</p>
              ) : (
                <>
                  <ul className="tix-lines">
                    {selected.map((id) => (
                      <li key={id}>
                        <span>
                          {c.seatWord} <strong>{id}</strong>, {section.name}
                        </span>
                        <span>{formatIDR(section.price)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="tix-total">
                    <span>{c.total}</span>
                    <strong>{formatIDR(seatTotal)}</strong>
                  </p>
                  <p className="tix-quiet">{c.noFees}</p>
                </>
              )}
              <button
                type="button"
                className="btn btn-primary btn-lg tix-cta"
                disabled={selected.length === 0 || busy}
                onClick={holdSeats}
              >
                {selected.length === 0 ? c.nextNone : c.next(formatIDR(seatTotal))}
              </button>
              <p className="tix-quiet">{c.holdNote(draftMinutes)}</p>
            </aside>
          </div>
        )}

        {step === 'details' && order && (
          <div className="tix-grid">
            <form className="tix-main tix-form" noValidate onSubmit={submit}>
              <div>
                <h2>{c.detailsTitle}</h2>
                <p className="tix-quiet">{c.detailsHelp}</p>
              </div>
              <p className="tix-timer" role="timer">
                {c.timer(clock(order.expiresAt - serverNow()))}
              </p>
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

              {order.tickets.length > 1 && (
                <fieldset className="tix-fieldset">
                  <legend>{c.holdersTitle}</legend>
                  <p className="tix-quiet">{c.holdersHelp}</p>
                  {order.tickets.map((t, i) => (
                    <label key={t.id} htmlFor={`tix-holder-${i}`}>
                      <span>{c.holder(t.seat)}</span>
                      <input
                        id={`tix-holder-${i}`}
                        type="text"
                        value={holders[i] ?? ''}
                        placeholder={buyer.name}
                        onChange={(e) => setHolders(holders.map((h, j) => (j === i ? e.target.value : h)))}
                      />
                    </label>
                  ))}
                </fieldset>
              )}

              <label htmlFor="tix-voucher">
                <span>{c.voucher}</span>
                <div className="tix-inline">
                  <input
                    id="tix-voucher"
                    type="text"
                    autoCapitalize="characters"
                    value={voucher.code}
                    onChange={(e) => setVoucher({ code: e.target.value, discount: 0, message: '', ok: false })}
                    aria-describedby="tix-voucher-msg"
                  />
                  <button type="button" className="tix-btn-quiet" onClick={applyVoucher}>
                    {c.voucherApply}
                  </button>
                </div>
                <span className={voucher.ok ? 'tix-good' : 'tix-error'} id="tix-voucher-msg" role="status">
                  {voucher.message}
                </span>
              </label>

              <div className="tix-actions">
                <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
                  {c.toPay(formatIDR(order.subtotal - voucher.discount))}
                </button>
                <button type="button" className="tix-btn-quiet" onClick={() => dialogRef.current?.showModal()}>
                  {c.cancel}
                </button>
              </div>
            </form>
            <aside className="tix-summary">
              <h2>{c.summary}</h2>
              <ul className="tix-lines">
                {order.tickets.map((t) => (
                  <li key={t.id}>
                    <span>
                      {c.seatWord} <strong>{t.seat}</strong>, {order.category}
                    </span>
                    <span>{formatIDR(t.price)}</span>
                  </li>
                ))}
                {voucher.discount > 0 && (
                  <li>
                    <span>{c.discount}</span>
                    <span>-{formatIDR(voucher.discount)}</span>
                  </li>
                )}
              </ul>
              <p className="tix-total">
                <span>{c.total}</span>
                <strong>{formatIDR(order.subtotal - voucher.discount)}</strong>
              </p>
              <p className="tix-quiet">{c.noFees}</p>
              <p className="tix-cause">{c.cause}</p>
            </aside>
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
      </div>

      {step === 'seats' && selected.length > 0 && (
        <div className="tix-bar tix-noprint">
          <p>
            <strong>{c.count(selected.length)}</strong>
            <span>{selected.join(', ')}</span>
          </p>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={holdSeats}>
            {c.next(formatIDR(seatTotal))}
          </button>
        </div>
      )}
    </section>
  )
}
