import './PlaceholderArt.css'

// Stand-ins for photography that hasn't been supplied yet (see PRD.md §11).
// Deliberately abstract and near-achromatic, they read as empty image slots
// in the zinc system, never as real event photos.

const TONES = ['a', 'b', 'c', 'd', 'e']

export default function PlaceholderArt({
  seed = 1,
  label,
  ratio = '4 / 5',
  radius,
  className = '',
}) {
  const tone = TONES[(seed - 1) % TONES.length]
  const style = { aspectRatio: ratio }
  if (radius) style.borderRadius = radius

  return (
    <div className={`ph ph--${tone} ${className}`} style={style}>
      <svg className="ph__mark" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="1.5" />
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M29 64V46C29 41.6 33 38 38 38H58C63 38 67 41.6 67 46V64" />
          <path d="M29 64H67" />
          <path d="M41 38V28L55 25.5V38" />
        </g>
      </svg>
      {label && <span className="ph__label">{label}</span>}
    </div>
  )
}
