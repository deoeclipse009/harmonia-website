// One endpoint, many actions: POST /api/tix with { action, ...input }.
// The table below is the whole permission model. An action with no role is
// public; every other action needs a signed session with one of its roles.
import * as core from './core.js'
import { db as openDb } from './db.js'
import { sendTicketEmail } from './mail.js'

const ANY = ['admin', 'seller', 'checkin']
const ACTIONS = {
  'event.get': [null, core.getEvent],
  'seats.get': [null, core.getSeats],
  'order.create': [null, core.createOrder],
  'order.get': [null, core.getOrder],
  'order.details': [null, core.submitDetails],
  'order.proof': [null, core.uploadProof],
  'order.cancel': [null, core.cancelByBuyer],
  'voucher.check': [null, core.checkVoucher],
  'auth.login': [null, core.login],

  'panel.orders': [['admin', 'seller'], core.listOrders],
  'panel.order': [['admin', 'seller'], core.getOrderAdmin],
  'panel.confirm': [['admin'], confirmAndMail],
  'panel.reject': [['admin'], core.rejectProof],
  'panel.cancel': [['admin'], core.cancelOrder],
  'panel.people': [['admin'], core.updateOrderPeople],
  'panel.staffOrder': [['admin', 'seller'], staffOrderAndMail],
  'panel.resend': [['admin'], resend],
  'panel.categories': [ANY, core.listCategories],
  'panel.saveCategory': [['admin'], core.saveCategory],
  'panel.archiveCategory': [['admin'], core.archiveCategory],
  'panel.settings': [['admin'], core.getSettings],
  'panel.saveSettings': [['admin'], core.saveSettings],
  'panel.vouchers': [['admin'], core.listVouchers],
  'panel.saveVoucher': [['admin'], core.saveVoucher],
  'panel.staff': [['admin'], core.listStaff],
  'panel.saveStaff': [['admin'], core.saveStaff],
  'panel.report': [ANY, core.salesReport],
  'panel.checkin': [['admin', 'checkin'], core.checkIn],
}

async function mail(ctx, result) {
  const settings = await core.getSettings(ctx)
  const status = await sendTicketEmail(ctx.env, result.order, settings.event.name)
  await core.markEmail(ctx, { id: result.order.id, status })
  result.order.emailStatus = status
  return result
}

async function confirmAndMail(ctx, input) {
  return mail(ctx, await core.confirmOrder(ctx, input))
}

async function staffOrderAndMail(ctx, input) {
  return mail(ctx, await core.staffOrder(ctx, input))
}

async function resend(ctx, input) {
  const result = await core.getOrderAdmin(ctx, input)
  if (result.order.status !== 'paid') throw new core.Fail('not_paid')
  return mail(ctx, result)
}

export async function handle({ body, authorization, env = process.env, now = Date.now() }) {
  try {
    const { action, ...input } = body && typeof body === 'object' ? body : {}
    const entry = ACTIONS[action]
    if (!entry) return { status: 404, json: { ok: false, error: 'unknown_action' } }
    const [roles, fn] = entry

    let session = null
    if (roles) {
      const token = String(authorization || '').replace(/^Bearer\s+/i, '')
      session = core.readSession(token, env.SESSION_SECRET, now)
      if (!session) return { status: 401, json: { ok: false, error: 'login_required' } }
      if (!roles.includes(session.role)) return { status: 403, json: { ok: false, error: 'forbidden' } }
    }
    const data = await fn({ db: await openDb(), now, session, env }, input)
    // `now` lets the browser correct its countdown against the server clock.
    return { status: 200, json: { ok: true, now, ...data } }
  } catch (err) {
    if (err instanceof core.Fail) return { status: 200, json: { ok: false, error: err.code, ...err.extra } }
    if (err?.code === 'not_configured') return { status: 503, json: { ok: false, error: 'not_configured' } }
    console.error('tix:', err)
    return { status: 500, json: { ok: false, error: 'server_error' } }
  }
}
