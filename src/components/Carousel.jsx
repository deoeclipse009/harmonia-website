import { useCallback, useEffect, useRef, useState } from 'react'
import './Carousel.css'

// Instagram-style horizontal carousel: a scroll-snapping rail with arrow
// controls and dot indicators. Native scroll does the work, so touch,
// trackpad, and keyboard all behave the way people already expect.

export default function Carousel({ children, label }) {
  const railRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [bounds, setBounds] = useState({ atStart: true, atEnd: false })
  const count = Array.isArray(children) ? children.length : 1

  const sync = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    const slide = rail.firstElementChild
    if (!slide) return
    const step = slide.getBoundingClientRect().width + 12
    setIndex(Math.round(rail.scrollLeft / step))
    setBounds({
      atStart: rail.scrollLeft <= 2,
      atEnd: rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2,
    })
  }, [])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    sync()
    rail.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      rail.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [sync])

  const go = (dir) => {
    const rail = railRef.current
    if (!rail) return
    const slide = rail.firstElementChild
    if (!slide) return
    rail.scrollBy({ left: dir * (slide.getBoundingClientRect().width + 12), behavior: 'smooth' })
  }

  const toSlide = (i) => {
    const rail = railRef.current
    if (!rail) return
    const slide = rail.firstElementChild
    if (!slide) return
    rail.scrollTo({ left: i * (slide.getBoundingClientRect().width + 12), behavior: 'smooth' })
  }

  return (
    <div className="carousel">
      <div className="carousel__rail" ref={railRef} role="group" aria-label={label} tabIndex={0}>
        {children}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="carousel__arrow carousel__arrow--prev"
            onClick={() => go(-1)}
            disabled={bounds.atStart}
            aria-label="Previous"
          >
            <span aria-hidden="true">&#8592;</span>
          </button>
          <button
            type="button"
            className="carousel__arrow carousel__arrow--next"
            onClick={() => go(1)}
            disabled={bounds.atEnd}
            aria-label="Next"
          >
            <span aria-hidden="true">&#8594;</span>
          </button>

          <div className="carousel__dots">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`carousel__dot ${i === index ? 'is-active' : ''}`}
                onClick={() => toSlide(i)}
                aria-label={`${i + 1} / ${count}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
