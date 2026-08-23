import { useState } from 'react'
import './Avatar.css'

// Square portrait that degrades to a monogram tile when no photo is on file.
// Team portraits are still being collected, so the monogram is the state most
// visitors will see first, it is designed to look deliberate, not broken.

// Honorifics and post-nominals would otherwise produce monograms like "DD"
// for "Dr. dr. Jodi Visnu, MPH." Skip them and use the actual name.
const TITLES = /^(dr|drs|prof|ir|mr|mrs|ms|hj|h|st|mph|msc|m|s|ph|phd|sc)\.?,?$/i

function initials(name) {
  const parts = name
    .trim()
    .split(/[\s,]+/)
    .filter((w) => w && !TITLES.test(w))
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

export default function Avatar({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showPhoto = src && !failed

  return (
    <div className={`avatar ${showPhoto ? '' : 'avatar--mono'} ${className}`}>
      {showPhoto ? (
        <img src={src} alt={name} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </div>
  )
}
