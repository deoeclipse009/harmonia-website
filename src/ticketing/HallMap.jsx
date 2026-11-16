import { hallLayout } from '../../shared/hall.js'

// The whole hall at a glance: every section in its place, drawn as its own
// rows of seats, so a buyer sees where the section is before choosing it.
// Each section is a button; the list under the map does the same job for
// anyone who prefers reading names and prices.
export default function HallMap({ sections, onOpen, disabled, labels, formatPrice }) {
  const { tiers } = hallLayout(sections)
  if (tiers.length === 0) return null

  function block(s, side) {
    const open = s.status === 'on_sale' && !disabled
    const note = s.status !== 'on_sale' ? labels.status[s.status] : labels.left(s.left)
    return (
      <button
        key={s.id}
        type="button"
        className={`hall__block hall__block--${side}${open ? '' : ' is-closed'}`}
        disabled={!open}
        aria-label={`${s.name}, ${formatPrice(s.price)}, ${note}`}
        onClick={() => onOpen(s)}
      >
        <span className="hall__rows" aria-hidden="true">
          {(s.rows || []).map((n, i) => (
            <span key={i} className="hall__row" style={{ '--n': n }} />
          ))}
        </span>
        <span className="hall__name">{s.name}</span>
        <span className="hall__meta">
          {formatPrice(s.price)}
          <span className="hall__note">{note}</span>
        </span>
      </button>
    )
  }

  return (
    <div className="hall">
      <p className="hall__stage">{labels.stage}</p>
      {tiers.map((t) => (
        <div className={`hall__tier hall__tier--${t.key}`} key={t.key}>
          <div className="hall__side hall__side--left">{t.left.map((s) => block(s, 'left'))}</div>
          <div className="hall__side hall__side--center">{t.center.map((s) => block(s, 'center'))}</div>
          <div className="hall__side hall__side--right">{t.right.map((s) => block(s, 'right'))}</div>
        </div>
      ))}
      <p className="tix-quiet hall__note-foot">{labels.mapNote}</p>
    </div>
  )
}
