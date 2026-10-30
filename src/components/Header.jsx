import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { activeEdition } from '../data/editions.js'
import SealLogo from './SealLogo.jsx'
import './Header.css'

const isUpcoming = activeEdition.status === 'upcoming'

export default function Header() {
  const { lang, toggleLang, t } = useLanguage()
  const [open, setOpen] = useState(false)

  const nav = t.common.nav
  // Five destinations, each one topic. Sponsors and impact live inside
  // About; the committee lives with the performers; merch lives with
  // Contact. Fewer doors, none of them mixed.
  const links = [
    { to: '/', label: nav.home },
    { to: '/about', label: nav.about },
    { to: '/edition/harmonia-2025', label: nav.edition },
    { to: '/lineup', label: nav.lineup },
    { to: '/gallery', label: nav.gallery },
  ]

  const close = () => setOpen(false)

  const navRef = useRef(null)
  const toggleRef = useRef(null)

  // While the panel is open it owns the keyboard: Escape closes it and
  // returns focus to the button that opened it, and Tab cycles inside
  // rather than wandering into the page behind.
  useEffect(() => {
    if (!open) return undefined

    const items = () =>
      navRef.current
        ? Array.from(navRef.current.querySelectorAll('a[href]'))
        : []

    items()[0]?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return

      const focusable = [...items(), toggleRef.current].filter(Boolean)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink to="/" className="brand" aria-label="Harmonia" onClick={close}>
          <SealLogo size={34} />
          <span className="brand__word">Harmonia</span>
        </NavLink>

        <nav
          ref={navRef}
          id="primary-nav"
          className={`main-nav ${open ? 'is-open' : ''}`}
          aria-label="Primary"
        >
          <ul>
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === '/'} onClick={close}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="lang-toggle"
            onClick={toggleLang}
            aria-label="Switch language"
          >
            <span className={lang === 'id' ? 'is-active' : ''}>ID</span>
            <span className="lang-toggle__sep" aria-hidden="true" />
            <span className={lang === 'en' ? 'is-active' : ''}>EN</span>
          </button>

          {isUpcoming ? (
            <a
              className="btn btn-accent header-cta"
              href={activeEdition.ticketUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t.common.tickets}
            </a>
          ) : (
            <NavLink
              to={`/edition/${activeEdition.slug}`}
              className="btn btn-accent header-cta"
              onClick={close}
            >
              {t.common.recap}
            </NavLink>
          )}

          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
