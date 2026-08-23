import { partnerGroups } from '../data/sponsors.js'
import './PartnerMarquee.css'

// Continuous right-to-left logo ticker.
//
// The track holds the full partner list twice. The animation translates it
// by exactly -50%, so the moment the first copy scrolls out the second is
// pixel-aligned behind it and the loop is seamless. Duration scales with the
// number of logos to keep a constant apparent speed.

const ALL = partnerGroups.flatMap((g) => g.items)
const SECONDS_PER_LOGO = 3.2

export default function PartnerMarquee({ label }) {
  const duration = ALL.length * SECONDS_PER_LOGO

  return (
    <div className="marquee">
      {label && (
        <div className="container">
          <p className="marquee__label">{label}</p>
        </div>
      )}

      <div className="marquee__viewport">
        <ul
          className="marquee__track"
          style={{ '--marquee-duration': `${duration}s` }}
        >
          {/* first copy is the readable one */}
          {ALL.map((p) => (
            <li key={p.id} className="marquee__item">
              <img src={p.logo} alt={p.name} loading="lazy" decoding="async" />
            </li>
          ))}
          {/* second copy exists only to make the wrap seamless */}
          {ALL.map((p) => (
            <li key={`dup-${p.id}`} className="marquee__item" aria-hidden="true">
              <img src={p.logo} alt="" loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
