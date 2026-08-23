import { useState } from 'react'
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

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink to="/" className="brand" aria-label="Harmonia" onClick={close}>
          <SealLogo size={34} />
          <span className="brand__word">Harmonia</span>
        </NavLink>

        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Primary">
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
            type="button"
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
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
