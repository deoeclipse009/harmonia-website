import { useCallback, useEffect, useRef, useState } from 'react'
import { call, session } from '../ticketing/client.js'
import { CHANNEL, STATUS, downloadCsv, formatIDR, message, time } from '../panel/util.js'
import { Categories, Settings, Staff, StaffOrder, Vouchers } from '../panel/Tools.jsx'
import Scanner from '../panel/Scanner.jsx'
import './Tickets.css'
import '../panel/Panel.css'

// The organiser's side: orders, door sales, invitations, categories,
// vouchers, report, check-in. Staff tool, so Indonesian only.
const TABS = [
  ['orders', 'Pesanan', ['admin', 'seller']],
  ['direct', 'Jual langsung', ['admin', 'seller']],
  ['invitation', 'Undangan', ['admin']],
  ['checkin', 'Check-in', ['admin', 'checkin']],
  ['report', 'Laporan', ['admin', 'seller', 'checkin']],
  ['categories', 'Kategori', ['admin']],
  ['vouchers', 'Voucher', ['admin']],
  ['staff', 'Staf', ['admin']],
  ['settings', 'Pengaturan', ['admin']],
]

function Login({ onDone }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await call('auth.login', { username, password })
    setBusy(false)
    if (res.ok) {
      session.set({ token: res.token, user: res.user })
      onDone(res.user)
    } else {
      setError(
        res.error === 'bad_login'
          ? 'Nama pengguna atau kata sandi salah.'
          : res.error === 'not_configured'
            ? 'Panel belum diatur: SESSION_SECRET dan ADMIN_PASSWORD belum diisi di server.'
            : message(res),
      )
    }
  }

  return (
    <form className="tix-form panel-login" noValidate onSubmit={submit}>
      <h1 className="tix-title">Panel tiket</h1>
      <label htmlFor="panel-user">
        <span>Nama pengguna</span>
        <input id="panel-user" autoComplete="username" autoCapitalize="none" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label htmlFor="panel-pass">
        <span>Kata sandi</span>
        <div className="tix-inline">
          <input id="panel-pass" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="tix-btn-quiet" aria-pressed={show} onClick={() => setShow(!show)}>
            {show ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
      </label>
      <span className="tix-error" role="alert">{error}</span>
      <div className="tix-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
          Masuk
        </button>
      </div>
    </form>
  )
}

function Orders({ role }) {
  const [filter, setFilter] = useState({ status: 'waiting', q: '' })
  const [orders, setOrders] = useState(null)
  const [open, setOpen] = useState(null) // { order, proof }
  const [note, setNote] = useState('')
  const [notice, setNotice] = useState('')
  const dialogRef = useRef(null)
  const isAdmin = role === 'admin'

  const load = useCallback(async () => {
    const res = await call('panel.orders', filter)
    if (res.ok) setOrders(res.orders)
    else setNotice(message(res))
  }, [filter])

  useEffect(() => {
    let alive = true
    call('panel.orders', filter).then((res) => {
      if (!alive) return
      if (res.ok) setOrders(res.orders)
      else setNotice(message(res))
    })
    return () => {
      alive = false
    }
  }, [filter])

  async function show(id) {
    const res = await call('panel.order', { id })
    if (res.ok) {
      setOpen(res)
      setNote('')
      setNotice('')
    } else setNotice(message(res))
  }

  async function act(action, extra = {}) {
    const res = await call(action, { id: open.order.id, ...extra })
    if (res.ok) {
      setOpen(res.proof === undefined ? { ...open, order: res.order } : res)
      setNotice(action === 'panel.confirm' ? `Lunas. Email: ${res.order.emailStatus}.` : 'Tersimpan.')
      load()
    } else setNotice(message(res))
  }

  function exportCsv() {
    downloadCsv(
      'pesanan-harmonia.csv',
      ['Kode', 'Status', 'Jalur', 'Nama', 'Email', 'WhatsApp', 'Kategori', 'Kursi', 'Jumlah', 'Total', 'Voucher', 'Dibuat', 'Lunas'],
      (orders ?? []).map((o) => [o.code, STATUS[o.status], CHANNEL[o.channel], o.buyer_name, o.email, o.phone, o.category, o.seats, o.qty, o.total, o.voucher_code, time(o.created_at), time(o.paid_at)]),
    )
  }

  return (
    <div className="panel-stack">
      <div className="panel-bar">
        <label htmlFor="ord-status">
          <span>Status</span>
          <select id="ord-status" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <option value="waiting">Menunggu dan perlu dicek</option>
            <option value="paid">Lunas</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="expired">Kedaluwarsa</option>
            <option value="">Semua</option>
          </select>
        </label>
        <label htmlFor="ord-q">
          <span>Cari kode, nama, atau email</span>
          <input id="ord-q" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} />
        </label>
        <button type="button" className="tix-btn-quiet" onClick={exportCsv}>
          Unduh CSV
        </button>
      </div>
      <p className="tix-notice" role="status">{notice}</p>

      {orders === null ? (
        <div className="tix-skeleton" />
      ) : orders.length === 0 ? (
        <p className="tix-quiet">Tidak ada pesanan di filter ini.</p>
      ) : (
        <div className="panel-table">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Pemesan</th>
                <th>Kursi</th>
                <th>Total</th>
                <th>Status</th>
                <th>Dibuat</th>
                <th><span className="tix-sr">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.code}</td>
                  <td>
                    {o.buyer_name}
                    <small>{CHANNEL[o.channel]}</small>
                  </td>
                  <td>
                    {o.category}
                    <small>{o.seats}</small>
                  </td>
                  <td className="num">{formatIDR(o.total)}</td>
                  <td>
                    <strong>{STATUS[o.status]}</strong>
                  </td>
                  <td>{time(o.created_at)}</td>
                  <td>
                    <button type="button" className="tix-btn-quiet tix-btn-small" onClick={() => show(o.id)}>
                      Buka
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <section className="panel-detail" aria-label={`Pesanan ${open.order.code}`}>
          <div className="tix-row">
            <h2>
              {open.order.code}, {STATUS[open.order.status]}
            </h2>
            <button type="button" className="tix-btn-quiet" onClick={() => setOpen(null)}>
              Tutup
            </button>
          </div>
          <dl className="tix-pay">
            <dt>Pemesan</dt>
            <dd>{open.order.buyer.name}</dd>
            <dt>Email</dt>
            <dd>{open.order.buyer.email}</dd>
            <dt>WhatsApp</dt>
            <dd>{open.order.buyer.phone}</dd>
            <dt>Kategori</dt>
            <dd>{open.order.category}</dd>
            <dt>Tiket</dt>
            <dd>{open.order.tickets.map((t) => `${t.seat} (${t.holderName || 'tanpa nama'})`).join(', ')}</dd>
            <dt>Total</dt>
            <dd>
              <strong>{formatIDR(open.order.total)}</strong>
              {open.order.discount > 0 && ` , voucher ${open.order.voucherCode} -${formatIDR(open.order.discount)}`}
            </dd>
            <dt>Catatan pembeli</dt>
            <dd>{open.order.proofNote || 'Tidak ada'}</dd>
            <dt>Email e-tiket</dt>
            <dd>{open.order.emailStatus || 'Belum dikirim'}</dd>
          </dl>
          {open.proof ? (
            <a href={open.proof} target="_blank" rel="noreferrer">
              <img className="panel-proof" src={open.proof} alt={`Bukti pembayaran pesanan ${open.order.code}`} />
            </a>
          ) : (
            <p className="tix-quiet">Belum ada bukti pembayaran.</p>
          )}
          <div className="tix-actions">
            <a className="tix-btn-quiet" href={`/e-tiket/${open.order.token}`} target="_blank" rel="noreferrer">
              Lihat halaman pembeli
            </a>
            {isAdmin && (open.order.status === 'waiting' || open.order.status === 'review') && (
              <button type="button" className="btn btn-primary" onClick={() => act('panel.confirm')}>
                Konfirmasi pembayaran, {formatIDR(open.order.total)}
              </button>
            )}
            {isAdmin && open.order.status === 'paid' && (
              <button type="button" className="tix-btn-quiet" onClick={() => act('panel.resend')}>
                Kirim ulang email
              </button>
            )}
          </div>
          {isAdmin && open.order.status !== 'cancelled' && open.order.status !== 'expired' && (
            <div className="tix-form">
              <label htmlFor="ord-note">
                <span>Alasan (terlihat oleh pembeli saat bukti ditolak)</span>
                <input id="ord-note" value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              <div className="tix-actions">
                {open.order.status === 'review' && (
                  <button type="button" className="tix-btn-quiet" onClick={() => act('panel.reject', { note })}>
                    Tolak bukti, minta unggah ulang
                  </button>
                )}
                <button type="button" className="tix-btn-quiet" onClick={() => dialogRef.current?.showModal()}>
                  Batalkan pesanan
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <dialog ref={dialogRef} className="tix-dialog" aria-labelledby="ord-dialog">
        <h2 id="ord-dialog">Batalkan pesanan {open?.order.code}?</h2>
        <p>Kursi dilepas dan tiket di pesanan ini tidak berlaku lagi. Ini tidak bisa dikembalikan.</p>
        <div className="tix-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              dialogRef.current?.close()
              act('panel.cancel', { note })
            }}
          >
            Batalkan pesanan
          </button>
          <button type="button" className="tix-btn-quiet" onClick={() => dialogRef.current?.close()}>
            Kembali
          </button>
        </div>
      </dialog>
    </div>
  )
}

function Report() {
  const [data, setData] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true
    call('panel.report').then((res) => {
      if (!alive) return
      if (res.ok) setData(res)
      else setNotice(message(res))
    })
    return () => {
      alive = false
    }
  }, [])

  if (!data) return notice ? <p className="tix-notice">{notice}</p> : <div className="tix-skeleton" />
  const t = data.totals
  return (
    <div className="panel-stack">
      <dl className="panel-stats">
        <div><dt>Tiket terbit</dt><dd>{t.issued}</dd></div>
        <div><dt>Sudah check-in</dt><dd>{t.checkedIn}</dd></div>
        <div><dt>Belum lunas</dt><dd>{t.waiting}</dd></div>
        <div><dt>Pendapatan</dt><dd>{formatIDR(t.revenue)}</dd></div>
      </dl>
      <div className="tix-actions">
        <button
          type="button"
          className="tix-btn-quiet"
          onClick={() =>
            downloadCsv(
              'laporan-harmonia.csv',
              ['Kategori', 'Harga', 'Kursi', 'Online', 'Jual langsung', 'Undangan', 'Belum lunas', 'Check-in', 'Pendapatan online', 'Pendapatan langsung'],
              data.rows.map((r) => [r.name, r.price, r.seats, r.online, r.direct, r.invitation, r.waiting, r.checkedIn, r.revenueOnline, r.revenueDirect]),
            )
          }
        >
          Unduh CSV
        </button>
      </div>
      <div className="panel-table">
        <table>
          <thead>
            <tr>
              <th>Kategori</th>
              <th className="num">Kursi</th>
              <th className="num">Online</th>
              <th className="num">Langsung</th>
              <th className="num">Undangan</th>
              <th className="num">Belum lunas</th>
              <th className="num">Check-in</th>
              <th className="num">Pendapatan</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.name}
                  <small>{formatIDR(r.price)}</small>
                </td>
                <td className="num">{r.seats}</td>
                <td className="num">{r.online}</td>
                <td className="num">{r.direct}</td>
                <td className="num">{r.invitation}</td>
                <td className="num">{r.waiting}</td>
                <td className="num">{r.checkedIn}</td>
                <td className="num">{formatIDR(r.revenueOnline + r.revenueDirect)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Panel() {
  const [user, setUser] = useState(() => session.get()?.user ?? null)
  const tabs = user ? TABS.filter(([, , roles]) => roles.includes(user.role)) : []
  const [tab, setTab] = useState(null)
  const current = tabs.find(([id]) => id === tab)?.[0] ?? tabs[0]?.[0]

  if (!user) {
    return (
      <section className="tix">
        <div className="container">
          <Login onDone={setUser} />
        </div>
      </section>
    )
  }

  return (
    <section className="tix panel">
      <div className="container">
        <div className="tix-row">
          <h1 className="tix-title">Panel tiket</h1>
          <p className="tix-quiet">
            {user.name || user.username}{' '}
            <button
              type="button"
              className="tix-btn-quiet tix-btn-small"
              onClick={() => {
                session.set(null)
                setUser(null)
              }}
            >
              Keluar
            </button>
          </p>
        </div>
        <nav className="panel-tabs" aria-label="Bagian panel">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" aria-current={current === id ? 'page' : undefined} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        {current === 'orders' && <Orders role={user.role} />}
        {current === 'direct' && <StaffOrder key="direct" channel="direct" />}
        {current === 'invitation' && <StaffOrder key="invitation" channel="invitation" />}
        {current === 'checkin' && <Scanner />}
        {current === 'report' && <Report />}
        {current === 'categories' && <Categories />}
        {current === 'vouchers' && <Vouchers />}
        {current === 'staff' && <Staff />}
        {current === 'settings' && <Settings />}
      </div>
    </section>
  )
}
