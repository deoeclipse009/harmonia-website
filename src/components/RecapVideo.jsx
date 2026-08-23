import { useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './RecapVideo.css'

// Vertical (9:16) recap footage, framed for horizontal screens.
//
// The problem with a portrait video on a desktop page is the two dead bars
// either side. Instead of letterboxing them black, a muted, blurred, scaled
// copy of the same video fills that space, so the frame stays full-bleed
// and the eye stays on the upright picture in the middle. On phones the
// backdrop is skipped entirely and the video just fills the width.

const files = import.meta.glob('../assets/video/recap.{mp4,webm,mov}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const posters = import.meta.glob('../assets/video/recap-poster.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const videoUrl = Object.values(files)[0] ?? null
const posterUrl = Object.values(posters)[0] ?? null

export default function RecapVideo() {
  const { t } = useLanguage()
  const r = t.gallery.recap
  const mainRef = useRef(null)
  const backRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  // keep the blurred backdrop in step with the real video
  const mirror = (fn) => {
    const back = backRef.current
    const main = mainRef.current
    if (!back || !main) return
    fn(back, main)
  }

  if (!videoUrl) {
    return (
      <div className="recap recap--empty card">
        <span className="eyebrow">{r.eyebrow}</span>
        <h2>{r.title}</h2>
        <p>{r.soon}</p>
      </div>
    )
  }

  return (
    <figure className="recap">
      <div className="recap__stage">
        {/* blurred filler, decorative only */}
        <video
          ref={backRef}
          className="recap__backdrop"
          src={videoUrl}
          muted
          playsInline
          loop
          aria-hidden="true"
          tabIndex={-1}
        />
        <video
          ref={mainRef}
          className="recap__video"
          src={videoUrl}
          poster={posterUrl ?? undefined}
          controls
          playsInline
          preload="metadata"
          onPlay={() => {
            setPlaying(true)
            mirror((back, main) => {
              back.currentTime = main.currentTime
              back.play().catch(() => {})
            })
          }}
          onPause={() => {
            setPlaying(false)
            mirror((back) => back.pause())
          }}
          onSeeked={() => mirror((back, main) => { back.currentTime = main.currentTime })}
        />
      </div>
      <figcaption className="recap__caption">
        <span className="eyebrow">{r.eyebrow}</span>
        <span className="recap__title">{playing ? r.playingTitle : r.title}</span>
      </figcaption>
    </figure>
  )
}
