import { useEffect, useState } from 'react'
import SeatPicker from '../ticketing/SeatPicker.jsx'
import { call, shrinkImage } from '../ticketing/client.js'
import { formatIDR, fromInput, message, toInput } from './util.js'

const SEAT_LABELS = {
  title: 'Denah kursi',
  help: 'Gunakan tombol panah untuk berpindah kursi, lalu Enter atau Spasi untuk memilih.',
  stage: 'Arah panggung',
  row: 'Baris',
  seat: 'kursi',
  available: 'Tersedia',
  selected: 'Dipilih',
  sold: 'Tidak tersedia',
}

// Loads a list once and gives back a setter, so each tool reads the same way.
function useList(action, key) {
  const [items, setItems] = useState(null)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    let alive = true
    call(action).then((res) => {
      if (!alive) return
      if (res.ok) setItems(res[key])
      else setNotice(message(res))
    })
    return () => {
      alive = false
    }
  }, [action, key])
  return [items, setItems, notice, setNotice]
}

function Field({ id, label, children, hint }) {
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      {children}
      {hint && <span className="tix-quiet">{hint}</span>}
    </label>
  )
}

// ---------- Jual langsung / Undangan ----------

export function StaffOrder({ channel }) {
  const [cats, , notice, setNotice] = useList('panel.categories', 'categories')
  const [section, setSection] = useState(null)
  const [selected, setSelected] = useState([])
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '' })
  const [done, setDone] = useState(null)
  const [busy, setBusy] = useState(false)
  const invitation = channel === 'invitation'

  async function open(id) {
    setDone(null)
    setSelected([])
    if (!id) {
      setSection(null)
      return
    }
    const res = await call('seats.get', { categoryId: Number(id) })
    if (res.ok) setSection(res)
    else setNotice(message(res))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await call('panel.staffOrder', { channel, categoryId: section.id, seats: selected, buyer })
    setBusy(false)
    if (res.ok) {
      setDone(res.order)
      setNotice('')
      setSelected([])
      setBuyer({ name: '', email: '', phone: '' })
      open(section.id)
    } else {
      setNotice(res.error === 'invalid' ? 'Nama wajib diisi, dan email harus lengkap jika diisi.' : message(res))
      if (res.error === 'taken') open(section.id)
    }
  }

  const cat = cats?.find((x) => x.id === section?.id)
  const price = invitation ? 0 : (cat?.price ?? 0)

  return (
    <form className="tix-form panel-wide" noValidate onSubmit={submit}>
      <p className="tix-quiet">
        {invitation
          ? 'Tiket undangan untuk tamu, media, dan pengisi acara. Gratis dan langsung terbit. Kursi yang diblokir bisa dipilih di sini.'
          : 'Penjualan di tempat. Terima uangnya dulu, lalu buat tiket: pesanan langsung berstatus lunas.'}
      </p>
      <Field id="so-cat" label="Kategori">
        <select id="so-cat" value={section?.id ?? ''} onChange={(e) => open(e.target.value)}>
          <option value="">Pilih kategori</option>
          {(cats ?? []).map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}, {formatIDR(x.price)}, sisa {x.left}
            </option>
          ))}
        </select>
      </Field>
      {section && (
        <SeatPicker
          rows={section.rows}
          blocked={section.blocked}
          taken={section.taken}
          selected={selected}
          allowBlocked={invitation}
          labels={SEAT_LABELS}
          onToggle={(id) => setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])}
        />
      )}
      <Field id="so-name" label={invitation ? 'Nama tamu' : 'Nama pembeli'}>
        <input id="so-name" value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} />
      </Field>
      <Field id="so-email" label="Email (opsional, untuk kirim e-tiket)">
        <input id="so-email" type="email" value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} />
      </Field>
      <Field id="so-phone" label="WhatsApp (opsional)">
        <input id="so-phone" type="tel" value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} />
      </Field>
      <p className="tix-notice" role="status">{notice}</p>
      <div className="tix-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy || !section || selected.length === 0}>
          {selected.length === 0
            ? 'Pilih kursi dulu'
            : invitation
              ? `Terbitkan ${selected.length} undangan`
              : `Terbitkan ${selected.length} tiket, ${formatIDR(price * selected.length)}`}
        </button>
      </div>
      {done && (
        <p className="tix-good">
          Pesanan {done.code} terbit untuk {done.tickets.map((t) => t.seat).join(', ')}.{' '}
          <a href={`/e-tiket/${done.token}`} target="_blank" rel="noreferrer">
            Buka e-tiket
          </a>
        </p>
      )}
    </form>
  )
}

// ---------- Kategori ----------

const NEW_CATEGORY = { name: '', kind: 'online', price: 0, maxPerOrder: 5, onSale: true, sort: 0, rows: '', blocked: '', description: '', saleStart: '', saleEnd: '' }

export function Categories() {
  const [cats, setCats, notice, setNotice] = useList('panel.categories', 'categories')
  const [form, setForm] = useState(null)

  function edit(cat) {
    setNotice('')
    setForm({
      id: cat.id,
      name: cat.name,
      kind: cat.kind,
      price: cat.price,
      maxPerOrder: cat.maxPerOrder,
      onSale: cat.onSale,
      sort: cat.sort,
      rows: cat.rows.join(', '),
      blocked: cat.blocked.join(', '),
      description: cat.description,
      saleStart: toInput(cat.saleStart),
      saleEnd: toInput(cat.saleEnd),
    })
  }

  async function save(e) {
    e.preventDefault()
    const res = await call('panel.saveCategory', {
      ...form,
      rows: form.rows.split(/[\s,]+/).filter(Boolean).map(Number),
      blocked: form.blocked.split(/[\s,]+/).filter(Boolean),
      saleStart: fromInput(form.saleStart),
      saleEnd: fromInput(form.saleEnd),
    })
    if (res.ok) {
      setCats(res.categories)
      setForm(null)
      setNotice('Tersimpan.')
    } else setNotice(res.error === 'invalid' ? 'Nama dan jumlah kursi per baris wajib diisi.' : message(res))
  }

  async function archive() {
    const res = await call('panel.archiveCategory', { id: form.id })
    if (res.ok) {
      setCats(res.categories)
      setForm(null)
    } else setNotice(message(res))
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const seatCount = form ? form.rows.split(/[\s,]+/).filter(Boolean).reduce((n, x) => n + (Number(x) || 0), 0) : 0

  return (
    <div className="panel-stack">
      <p className="tix-quiet">
        Jumlah kursi per baris dihitung dari poster denah 2025 dan belum tentu tepat. Periksa tiap kategori sebelum penjualan dibuka.
      </p>
      <p className="tix-notice" role="status">{notice}</p>
      {!form && (
        <>
          <div className="tix-actions">
            <button type="button" className="btn btn-primary" onClick={() => setForm(NEW_CATEGORY)}>
              Tambah kategori
            </button>
          </div>
          {cats === null ? (
            <div className="tix-skeleton" />
          ) : (
            <div className="panel-table">
              <table>
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th className="num">Harga</th>
                    <th className="num">Kursi</th>
                    <th className="num">Terisi</th>
                    <th>Status</th>
                    <th><span className="tix-sr">Aksi</span></th>
                  </tr>
                </thead>
                <tbody>
                  {cats.map((x) => (
                    <tr key={x.id}>
                      <td>
                        {x.name}
                        <small>{x.kind === 'online' ? 'Dijual online' : 'Hanya panel'}</small>
                      </td>
                      <td className="num">{formatIDR(x.price)}</td>
                      <td className="num">{x.total}</td>
                      <td className="num">{x.taken}</td>
                      <td>{{ on_sale: 'Dijual', not_started: 'Belum dibuka', sold_out: 'Habis', ended: 'Berakhir' }[x.status]}</td>
                      <td>
                        <button type="button" className="tix-btn-quiet tix-btn-small" onClick={() => edit(x)}>
                          Ubah
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {form && (
        <form className="tix-form panel-wide" noValidate onSubmit={save}>
          <h2>{form.id ? `Ubah ${form.name}` : 'Kategori baru'}</h2>
          <Field id="c-name" label="Nama kategori">
            <input id="c-name" value={form.name} onChange={set('name')} />
          </Field>
          <Field id="c-kind" label="Jalur penjualan">
            <select id="c-kind" value={form.kind} onChange={set('kind')}>
              <option value="online">Dijual online</option>
              <option value="offline">Hanya lewat panel (undangan, jual langsung)</option>
            </select>
          </Field>
          <Field id="c-price" label="Harga (rupiah)">
            <input id="c-price" type="number" inputMode="numeric" min="0" value={form.price} onChange={set('price')} />
          </Field>
          <Field id="c-max" label="Maksimal tiket per pesanan">
            <input id="c-max" type="number" inputMode="numeric" min="1" max="20" value={form.maxPerOrder} onChange={set('maxPerOrder')} />
          </Field>
          <Field id="c-rows" label="Jumlah kursi per baris, dari depan ke belakang" hint={`Contoh: 19, 18 berarti baris A 19 kursi dan baris B 18 kursi. Total sekarang ${seatCount} kursi.`}>
            <input id="c-rows" value={form.rows} onChange={set('rows')} />
          </Field>
          <Field id="c-blocked" label="Kursi yang tidak dijual" hint="Contoh: F4, F5. Kursi ini tetap bisa dipakai untuk undangan.">
            <input id="c-blocked" value={form.blocked} onChange={set('blocked')} />
          </Field>
          <Field id="c-desc" label="Keterangan singkat (opsional)">
            <input id="c-desc" value={form.description} onChange={set('description')} />
          </Field>
          <Field id="c-start" label="Mulai dijual (kosongkan jika langsung)">
            <input id="c-start" type="datetime-local" value={form.saleStart} onChange={set('saleStart')} />
          </Field>
          <Field id="c-end" label="Akhir penjualan (opsional)">
            <input id="c-end" type="datetime-local" value={form.saleEnd} onChange={set('saleEnd')} />
          </Field>
          <Field id="c-sort" label="Urutan tampil (angka kecil di atas)">
            <input id="c-sort" type="number" value={form.sort} onChange={set('sort')} />
          </Field>
          <label className="panel-check" htmlFor="c-on">
            <input id="c-on" type="checkbox" checked={form.onSale} onChange={set('onSale')} />
            <span>Penjualan aktif</span>
          </label>
          <div className="tix-actions">
            <button type="submit" className="btn btn-primary">Simpan</button>
            <button type="button" className="tix-btn-quiet" onClick={() => setForm(null)}>Batal</button>
            {form.id && (
              <button type="button" className="tix-btn-quiet" onClick={archive}>
                Hapus kategori
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

// ---------- Voucher ----------

const NEW_VOUCHER = { code: '', name: '', type: 'nominal', amount: 0, stock: 10, minTotal: 0, startsAt: '', endsAt: '', active: true }

export function Vouchers() {
  const [items, setItems, notice, setNotice] = useList('panel.vouchers', 'vouchers')
  const [form, setForm] = useState(null)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function save(e) {
    e.preventDefault()
    const res = await call('panel.saveVoucher', { ...form, startsAt: fromInput(form.startsAt), endsAt: fromInput(form.endsAt) })
    if (res.ok) {
      setItems(res.vouchers)
      setForm(null)
      setNotice('Tersimpan.')
    } else setNotice(res.error === 'invalid' ? 'Kode minimal 3 karakter, dan persen maksimal 100.' : message(res))
  }

  return (
    <div className="panel-stack">
      <p className="tix-notice" role="status">{notice}</p>
      {!form && (
        <>
          <div className="tix-actions">
            <button type="button" className="btn btn-primary" onClick={() => setForm(NEW_VOUCHER)}>
              Tambah voucher
            </button>
          </div>
          {items === null ? (
            <div className="tix-skeleton" />
          ) : items.length === 0 ? (
            <p className="tix-quiet">Belum ada voucher.</p>
          ) : (
            <div className="panel-table">
              <table>
                <thead>
                  <tr><th>Kode</th><th>Potongan</th><th className="num">Terpakai</th><th>Status</th><th><span className="tix-sr">Aksi</span></th></tr>
                </thead>
                <tbody>
                  {items.map((v) => (
                    <tr key={v.code}>
                      <td>{v.code}<small>{v.name}</small></td>
                      <td>{v.type === 'percent' ? `${v.amount}%` : formatIDR(v.amount)}</td>
                      <td className="num">{v.used} dari {v.stock}</td>
                      <td>{v.active ? 'Aktif' : 'Nonaktif'}</td>
                      <td>
                        <button
                          type="button"
                          className="tix-btn-quiet tix-btn-small"
                          onClick={() => setForm({ code: v.code, name: v.name, type: v.type, amount: v.amount, stock: v.stock, minTotal: v.min_total, startsAt: toInput(v.starts_at), endsAt: toInput(v.ends_at), active: Boolean(v.active) })}
                        >
                          Ubah
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {form && (
        <form className="tix-form panel-wide" noValidate onSubmit={save}>
          <Field id="v-code" label="Kode voucher"><input id="v-code" autoCapitalize="characters" value={form.code} onChange={set('code')} /></Field>
          <Field id="v-name" label="Nama (catatan internal)"><input id="v-name" value={form.name} onChange={set('name')} /></Field>
          <Field id="v-type" label="Jenis potongan">
            <select id="v-type" value={form.type} onChange={set('type')}>
              <option value="nominal">Nominal rupiah</option>
              <option value="percent">Persen</option>
            </select>
          </Field>
          <Field id="v-amount" label={form.type === 'percent' ? 'Persen potongan' : 'Potongan (rupiah)'}><input id="v-amount" type="number" inputMode="numeric" min="0" value={form.amount} onChange={set('amount')} /></Field>
          <Field id="v-stock" label="Bisa dipakai berapa kali"><input id="v-stock" type="number" inputMode="numeric" min="0" value={form.stock} onChange={set('stock')} /></Field>
          <Field id="v-min" label="Minimal total pesanan (rupiah)"><input id="v-min" type="number" inputMode="numeric" min="0" value={form.minTotal} onChange={set('minTotal')} /></Field>
          <Field id="v-start" label="Berlaku mulai (opsional)"><input id="v-start" type="datetime-local" value={form.startsAt} onChange={set('startsAt')} /></Field>
          <Field id="v-end" label="Berlaku sampai (opsional)"><input id="v-end" type="datetime-local" value={form.endsAt} onChange={set('endsAt')} /></Field>
          <label className="panel-check" htmlFor="v-on">
            <input id="v-on" type="checkbox" checked={form.active} onChange={set('active')} />
            <span>Voucher aktif</span>
          </label>
          <div className="tix-actions">
            <button type="submit" className="btn btn-primary">Simpan</button>
            <button type="button" className="tix-btn-quiet" onClick={() => setForm(null)}>Batal</button>
          </div>
        </form>
      )}
    </div>
  )
}

// ---------- Staf ----------

const NEW_STAFF = { username: '', name: '', role: 'checkin', password: '', active: true }

export function Staff() {
  const [items, setItems, notice, setNotice] = useList('panel.staff', 'staff')
  const [form, setForm] = useState(null)
  const [show, setShow] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function save(e) {
    e.preventDefault()
    const res = await call('panel.saveStaff', form)
    if (res.ok) {
      setItems(res.staff)
      setForm(null)
      setNotice('Tersimpan.')
    } else if (res.error === 'invalid') {
      setNotice(res.fields.username === 'taken' ? 'Nama pengguna itu sudah dipakai.' : res.fields.password ? 'Kata sandi minimal 8 karakter.' : 'Nama pengguna minimal 3 karakter: huruf kecil, angka, titik.')
    } else setNotice(message(res))
  }

  return (
    <div className="panel-stack">
      <p className="tix-quiet">Petugas check-in hanya bisa memindai tiket. Penjual bisa menjual langsung dan melihat pesanan.</p>
      <p className="tix-notice" role="status">{notice}</p>
      {!form && (
        <>
          <div className="tix-actions">
            <button type="button" className="btn btn-primary" onClick={() => setForm(NEW_STAFF)}>Tambah staf</button>
          </div>
          {items === null ? (
            <div className="tix-skeleton" />
          ) : items.length === 0 ? (
            <p className="tix-quiet">Belum ada akun staf.</p>
          ) : (
            <div className="panel-table">
              <table>
                <thead><tr><th>Nama pengguna</th><th>Nama</th><th>Peran</th><th>Status</th><th><span className="tix-sr">Aksi</span></th></tr></thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.id}>
                      <td>{s.username}</td>
                      <td>{s.name}</td>
                      <td>{s.role === 'seller' ? 'Penjual' : 'Petugas check-in'}</td>
                      <td>{s.active ? 'Aktif' : 'Nonaktif'}</td>
                      <td>
                        <button type="button" className="tix-btn-quiet tix-btn-small" onClick={() => setForm({ id: s.id, username: s.username, name: s.name, role: s.role, password: '', active: Boolean(s.active) })}>
                          Ubah
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {form && (
        <form className="tix-form panel-wide" noValidate onSubmit={save}>
          <Field id="s-user" label="Nama pengguna"><input id="s-user" autoCapitalize="none" value={form.username} onChange={set('username')} /></Field>
          <Field id="s-name" label="Nama lengkap"><input id="s-name" value={form.name} onChange={set('name')} /></Field>
          <Field id="s-role" label="Peran">
            <select id="s-role" value={form.role} onChange={set('role')}>
              <option value="checkin">Petugas check-in</option>
              <option value="seller">Penjual</option>
            </select>
          </Field>
          <label htmlFor="s-pass">
            <span>{form.id ? 'Kata sandi baru (kosongkan jika tidak diganti)' : 'Kata sandi, minimal 8 karakter'}</span>
            <div className="tix-inline">
              <input id="s-pass" type={show ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={set('password')} />
              <button type="button" className="tix-btn-quiet" aria-pressed={show} onClick={() => setShow(!show)}>
                {show ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
          </label>
          <label className="panel-check" htmlFor="s-on">
            <input id="s-on" type="checkbox" checked={form.active} onChange={set('active')} />
            <span>Akun aktif</span>
          </label>
          <div className="tix-actions">
            <button type="submit" className="btn btn-primary">Simpan</button>
            <button type="button" className="tix-btn-quiet" onClick={() => setForm(null)}>Batal</button>
          </div>
        </form>
      )}
    </div>
  )
}

// ---------- Pengaturan ----------

export function Settings() {
  const [form, setForm] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let alive = true
    call('panel.settings').then((res) => {
      if (!alive) return
      if (res.ok) setForm(res.event)
      else setNotice(message(res))
    })
    return () => {
      alive = false
    }
  }, [])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function pickQris(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setForm({ ...form, qrisImage: await shrinkImage(file, 900, 0.85) })
    } catch {
      setNotice('Gambar ini tidak bisa dibaca.')
    }
  }

  async function save(e) {
    e.preventDefault()
    const res = await call('panel.saveSettings', { event: form })
    if (res.ok) {
      setForm(res.event)
      setNotice('Tersimpan.')
    } else setNotice(message(res))
  }

  if (!form) return notice ? <p className="tix-notice">{notice}</p> : <div className="tix-skeleton" />
  return (
    <form className="tix-form panel-wide" noValidate onSubmit={save}>
      <h2>Acara</h2>
      <Field id="e-name" label="Nama acara"><input id="e-name" value={form.name} onChange={set('name')} /></Field>
      <Field id="e-date" label="Tanggal" hint="Contoh: Jumat, 27 Agustus 2027"><input id="e-date" value={form.dateText} onChange={set('dateText')} /></Field>
      <Field id="e-time" label="Waktu" hint="Contoh: 18.00 sampai 21.00 WIB"><input id="e-time" value={form.timeText} onChange={set('timeText')} /></Field>
      <Field id="e-venue" label="Tempat"><input id="e-venue" value={form.venue} onChange={set('venue')} /></Field>
      <h2>Pembayaran</h2>
      <p className="tix-quiet">Pembeli melihat data ini setelah membuat pesanan, lalu mengunggah bukti transfer.</p>
      <Field id="e-bank" label="Nama bank"><input id="e-bank" value={form.bankName} onChange={set('bankName')} /></Field>
      <Field id="e-acc" label="Nomor rekening"><input id="e-acc" inputMode="numeric" value={form.bankAccount} onChange={set('bankAccount')} /></Field>
      <Field id="e-holder" label="Atas nama"><input id="e-holder" value={form.bankHolder} onChange={set('bankHolder')} /></Field>
      <Field id="e-qris" label="Gambar QRIS (opsional)"><input id="e-qris" type="file" accept="image/*" onChange={pickQris} /></Field>
      {form.qrisImage && (
        <div className="tix-qris">
          <img src={form.qrisImage} alt="Gambar QRIS yang tersimpan" />
          <div className="tix-actions">
            <button type="button" className="tix-btn-quiet" onClick={() => setForm({ ...form, qrisImage: '' })}>Hapus QRIS</button>
          </div>
        </div>
      )}
      <Field id="e-hours" label="Batas waktu bayar setelah pesanan dibuat (jam)"><input id="e-hours" type="number" inputMode="numeric" min="1" max="72" value={form.payHours} onChange={set('payHours')} /></Field>
      <h2>Syarat dan ketentuan</h2>
      <Field id="e-terms" label="Tampil di halaman e-tiket (opsional)"><textarea id="e-terms" rows="6" value={form.terms} onChange={set('terms')} /></Field>
      <p className="tix-notice" role="status">{notice}</p>
      <div className="tix-actions">
        <button type="submit" className="btn btn-primary btn-lg">Simpan pengaturan</button>
      </div>
    </form>
  )
}
