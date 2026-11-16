import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { latestPastEdition } from '../data/editions.js'
import { performances } from '../data/performers.js'
import { partnerGroups } from '../data/sponsors.js'
import './Home.css'

// The home page, in the Blend look (docs/design-decisions.md): the dark
// stage, slow reveals, the logo maroon. Nine sections:
// hero, statement, numbers, performers, the cause, gallery, founder,
// partners, closing.

const PHOTO = {
  'adi-utarini': 'adi-utarini-0155.jpg',
  'jodi-jorge': 'jodi-jorge-0190.jpg',
  jorge: 'jorge-0250.jpg',
  'wikan-jorge': 'wikan-jorge-0285.jpg',
  'felice-voce': 'felice-voce-0309.jpg',
  'psm-ugm': 'psm-ugm-0390.jpg',
  syncro5: 'syncro5-0411.jpg',
}
const PARTNERS = partnerGroups.flatMap((g) => g.items)
const GALLERY = ['0041', '0207', '0315', '0548']

// Adds `is-in` once an element scrolls into view; CSS decides what that does
// (a fade and rise for text, a mask opening for photos).
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return undefined
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-in')),
      { rootMargin: '0px 0px -12% 0px' },
    )
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

// When scrolling stops with the section's top within a third of the screen
// of the header, glide it into place. Wide screens only: on a phone the list
// is taller than the screen and a snap would fight the reader.
function useSnap(selector) {
  useEffect(() => {
    const query = (q) => window.matchMedia(q).matches
    let timer
    let busy = false
    // Only the reader's own scrolling counts. A link or script that scrolls
    // the page smoothly must not be pulled back to this section.
    let touched = 0
    const mark = () => (touched = Date.now())
    function settle() {
      const el = document.querySelector(selector)
      if (!el || busy || Date.now() - touched > 1200) return
      if (!query('(min-width: 761px)') || query('(prefers-reduced-motion: reduce)')) return
      const header = document.querySelector('.site-header')?.offsetHeight ?? 0
      const off = el.getBoundingClientRect().top - header
      if (Math.abs(off) > 4 && Math.abs(off) < window.innerHeight / 3) {
        busy = true
        window.scrollBy({ top: off, behavior: 'smooth' })
        setTimeout(() => (busy = false), 700)
      }
    }
    function onScroll() {
      clearTimeout(timer)
      timer = setTimeout(settle, 140)
    }
    const inputs = ['wheel', 'touchmove', 'keydown']
    inputs.forEach((e) => window.addEventListener(e, mark, { passive: true }))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      inputs.forEach((e) => window.removeEventListener(e, mark))
      window.removeEventListener('scroll', onScroll)
    }
  }, [selector])
}

export default function Home() {
  const { lang, t } = useLanguage()
  const ref = useReveal()
  useSnap('.home-bill')
  const id = lang === 'id'
  const ed = latestPastEdition
  const [act, setAct] = useState(0)
  const cut = t.home.subtitle.indexOf('. ')
  const lead = cut > 0 ? t.home.subtitle.slice(0, cut + 1) : t.home.subtitle
  const rest = cut > 0 ? t.home.subtitle.slice(cut + 2) : ''
  const relive = id ? 'Tonton kembali 2025' : 'Relive 2025'

  return (
    <div className="home" ref={ref}>
      {/* 1. Hero: what, when, one main action */}
      <section className="home-hero">
        <img className="home-hero__img" src="/photos/hero-band.jpg" alt={t.home.bandAlt} />
        <div className="home-hero__shade" />
        <div className="home-hero__text container">
          <p className="home-hero__kicker" data-reveal>{id ? 'Konser musik amal' : 'Charity concert'}</p>
          <h1 className="home-hero__title" data-reveal>
            Harmonia
          </h1>
          <p className="home-hero__sub" data-reveal>
            {id ? 'Edisi berikutnya sedang disiapkan. Tanggal diumumkan segera.' : 'The next edition is in the works. Date announced soon.'}
          </p>
          <div className="home-hero__actions" data-reveal>
            <Link className="home-btn home-btn--main" to={`/edition/${ed.slug}`}>
              {relive} <span aria-hidden="true">→</span>
            </Link>
            <Link className="home-btn home-btn--line" to="/about">{id ? 'Tentang Harmonia' : 'About Harmonia'}</Link>
          </div>
        </div>
      </section>

      {/* 2. Statement: first sentence large, the rest at reading size */}
      <section className="home-statement container">
        <p className="home-statement__line" data-reveal>{lead}</p>
        <p className="home-statement__body" data-reveal>{rest}</p>
      </section>

      {/* 3. Earned numbers: four equal cells, the money in the brand pink */}
      <section className="home-numbers container">
        <div className="home-numbers__panel">
          <ul className="home-stats">
            {t.home.stats.map((s) => (
              <li key={s.k} data-reveal>
                <span className="home-stats__v">{s.v}</span>
                <span className="home-stats__k">{s.k}</span>
              </li>
            ))}
          </ul>
          <p className="home-stats__note">
            {id ? 'Harmonia 2025, satu malam untuk SOS Children’s Villages Indonesia.' : 'Harmonia 2025, one night for SOS Children’s Villages Indonesia.'}
          </p>
        </div>
      </section>

      {/* 4. The bill: a numbered list, one large photo that follows the row
          you point at or focus. No sideways scrolling. */}
      <section className="home-bill container">
        <div className="home-head">
          <h2 data-reveal>{t.home.performersTitle}</h2>
          <Link className="home-link" to="/lineup">{t.home.performersCta} →</Link>
        </div>
        <div className="home-bill__grid">
          <ol className="home-acts">
            {performances.map((p, i) => (
              <li key={p.key} data-reveal>
                <Link
                  to="/lineup"
                  className={`home-act${i === act ? ' is-on' : ''}`}
                  onMouseEnter={() => setAct(i)}
                  onFocus={() => setAct(i)}
                >
                  <img className="home-act__thumb" src={`/photos/performances/${PHOTO[p.key]}`} alt="" loading="lazy" />
                  <span className="home-act__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="home-act__name">{id ? p.titleId : p.titleEn}</span>
                  <span className="home-act__role">{id ? p.roleId : p.roleEn}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="home-bill__stage" aria-hidden="true" data-reveal>
            {performances.map((p, i) => (
              <img key={p.key} src={`/photos/performances/${PHOTO[p.key]}`} alt="" loading="lazy" className={i === act ? 'is-on' : ''} />
            ))}
            <p className="home-bill__caption">
              <span>{String(act + 1).padStart(2, '0')} / {String(performances.length).padStart(2, '0')}</span>
              {id ? performances[act].roleId : performances[act].roleEn}
            </p>
          </div>
        </div>
      </section>

      {/* 5. The cause: colour flood */}
      <section className="home-cause">
        <div className="container home-cause__grid">
          <div>
            <h2 data-reveal>{t.home.missionTitle}</h2>
            <p data-reveal>{t.home.missionBody}</p>
            <Link className="home-btn home-btn--inverse" to="/about#partners" data-reveal>
              {t.common.nav.sponsors} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="home-cause__img" data-reveal>
            <img src="/photos/impact.jpg" alt="SOS Children’s Villages Indonesia" loading="lazy" />
          </div>
        </div>
      </section>

      {/* 6. Gallery: four plates, revealed on scroll */}
      <section className="home-gallery container">
        <div className="home-head">
          <h2 data-reveal>{id ? 'Dari malam itu' : 'From the night'}</h2>
          <Link className="home-link" to="/gallery">{t.common.nav.gallery} →</Link>
        </div>
        <div className="home-plates">
          {GALLERY.map((g) => (
            <Link key={g} to="/gallery" className="home-plate" data-reveal aria-label={t.common.nav.gallery}>
              <img src={`/photos/gallery/${g}.jpg`} alt="" loading="lazy" />
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Founder: a card with the portrait and the opening of the letter */}
      <section className="home-founder container">
        <figure className="home-founder__card" data-reveal>
          <img src="/photos/hero-portrait.jpg" alt={t.home.founderName} loading="lazy" />
          <blockquote>
            <p>{t.home.founderParas[0]}</p>
            <footer>
              <strong>{t.home.founderName}</strong>
              <span>{t.home.founderRole}</span>
            </footer>
          </blockquote>
        </figure>
      </section>

      {/* 8. Partners. The logo files are white squares, so on the dark
          page each one becomes its own white tile on purpose. */}
      <section className="home-partners">
          <div className="container">
            <div className="home-head">
              <h2 data-reveal>{id ? 'Didukung oleh' : 'Made possible by'}</h2>
              <Link className="home-link" to="/about#partners">{t.common.nav.sponsors} →</Link>
            </div>
            <p className="home-partners__note">{t.sponsorsImpact.partnersNote}</p>
          </div>
          <div className="home-ticker">
            <ul className="home-tiles" style={{ '--n': PARTNERS.length }}>
              {[...PARTNERS, ...PARTNERS].map((p, i) => (
                <li key={`${p.id}-${i}`} aria-hidden={i >= PARTNERS.length || undefined}>
                  <img src={p.logo} alt={i < PARTNERS.length ? p.name : ''} loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
          </div>
      </section>

      {/* 9. Closing: the one action again */}
      <section className="home-close">
        <div className="container">
          <h2 data-reveal>{id ? 'Sampai jumpa di 2027.' : 'See you in 2027.'}</h2>
          <Link className="home-btn home-btn--main" to={`/edition/${ed.slug}`} data-reveal>
            {relive} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
