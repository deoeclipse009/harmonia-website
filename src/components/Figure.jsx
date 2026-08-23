import { useState } from 'react'
import PlaceholderArt from './PlaceholderArt.jsx'
import './Figure.css'

// Renders real photography, falling back to the abstract placeholder plate
// when a file is missing or fails to load, so a partial photo set still
// renders cleanly rather than leaving broken-image icons.

export default function Figure({
  src,
  alt = '',
  ratio = '4 / 5',
  fill = false,
  credit,
  seed = 1,
  priority = false,
  className = '',
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <PlaceholderArt seed={seed} ratio={ratio} className={className} />
  }

  return (
    <figure
      className={`fig ${fill ? 'fig--fill' : ''} ${className}`}
      style={fill ? undefined : { aspectRatio: ratio }}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setFailed(true)}
      />
      {credit && <figcaption className="fig__credit">{credit}</figcaption>}
    </figure>
  )
}
