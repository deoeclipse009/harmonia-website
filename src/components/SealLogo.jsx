import './SealLogo.css'

// The Harmonia seal. If the real artwork exists in src/assets/brand/
// (seal.png / .jpg / .webp) it is shown inside a circular crop, clipping
// off the piano legs that extend beyond the red disc. Until then, a
// faithful SVG recreation stands in: crimson disc, arched cream wordmark,
// halftone-shaded grand piano, and the small stars.

const brandFiles = import.meta.glob('../assets/brand/seal.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const sealUrl = Object.values(brandFiles)[0] ?? null

export default function SealLogo({ size = 40, className = '' }) {
  if (sealUrl) {
    return (
      <span
        className={`seal seal--img ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label="Harmonia"
      >
        <img src={sealUrl} alt="" />
      </span>
    )
  }

  return (
    <svg
      className={`seal ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Harmonia"
    >
      <defs>
        <radialGradient id="seal-red" cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#b82634" />
          <stop offset="72%" stopColor="#a5202d" />
          <stop offset="100%" stopColor="#8c1a26" />
        </radialGradient>
        <pattern id="seal-dots" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.05" fill="#ffffff" opacity="0.85" />
        </pattern>
        <path id="seal-arc" d="M 32 108 A 68 68 0 0 1 168 108" />
      </defs>

      {/* parchment rim + crimson disc */}
      <circle cx="100" cy="100" r="98" fill="#ffffff" />
      <circle cx="100" cy="100" r="91" fill="url(#seal-red)" />

      {/* arched wordmark */}
      <text
        fill="#ffffff"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="27"
        fontWeight="700"
        letterSpacing="5"
      >
        <textPath href="#seal-arc" startOffset="50%" textAnchor="middle">
          HARMONIA
        </textPath>
      </text>

      {/* stars */}
      <g fill="#ffffff">
        <path d="M56 120l2.6 5.4 5.4 2.6-5.4 2.6-2.6 5.4-2.6-5.4-5.4-2.6 5.4-2.6z" />
        <path d="M148 116l2.2 4.6 4.6 2.2-4.6 2.2-2.2 4.6-2.2-4.6-4.6-2.2 4.6-2.2z" />
      </g>

      {/* halftone glow behind the piano */}
      <circle cx="103" cy="128" r="42" fill="url(#seal-dots)" opacity="0.5" />

      {/* grand piano, silhouette with cream lid edge + keys */}
      <g>
        <path
          d="M60 118 L60 100 C60 92 68 88 78 88 L120 88 C124 74 138 64 150 66 C146 78 138 86 132 92 C140 96 146 106 146 118 L146 150 L60 150 Z"
          fill="#5c0e18"
        />
        <path d="M120 88 C124 74 138 64 150 66 L150 70 C140 70 128 78 124 90 Z" fill="#ffffff" />
        <rect x="60" y="118" width="86" height="8" rx="2" fill="#ffffff" />
        <g fill="#5c0e18">
          <rect x="68" y="118" width="4" height="6" />
          <rect x="80" y="118" width="4" height="6" />
          <rect x="92" y="118" width="4" height="6" />
          <rect x="104" y="118" width="4" height="6" />
          <rect x="116" y="118" width="4" height="6" />
          <rect x="128" y="118" width="4" height="6" />
        </g>
      </g>
    </svg>
  )
}
