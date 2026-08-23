import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { editions } from '../data/editions.js'
import { orgInfo } from '../data/org.js'
import SealLogo from './SealLogo.jsx'
import './Footer.css'

export default function Footer() {
  const { t, lang } = useLanguage()
  const collab = editions[0]?.collaborator

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
            <div className="footer-brand">
              <span className="footer-brand__mark">
                <SealLogo size={30} tone="light" />
                Harmonia
              </span>
              <p>{t.common.footer.tagline}</p>
              {collab && (
                <p className="footer-collab">
                  {t.common.footer.collab} <strong>{collab}</strong>
                </p>
              )}
            </div>

            <div className="footer-col">
              <span className="footer-col__title">{t.common.nav.home}</span>
              <ul>
                <li><Link to="/about">{t.common.nav.about}</Link></li>
                <li><Link to="/edition/harmonia-2025">{t.common.nav.edition}</Link></li>
                <li><Link to="/lineup">{t.common.nav.lineup}</Link></li>
                <li><Link to="/gallery">{t.common.nav.gallery}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <span className="footer-col__title">{lang === 'id' ? 'Lainnya' : 'More'}</span>
              <ul>
                <li><Link to="/about#partners">{t.common.nav.sponsors}</Link></li>
                <li><Link to="/merch">{t.common.nav.merch}</Link></li>
                <li><Link to="/contact">{t.common.nav.contact}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <span className="footer-col__title">{t.common.footer.follow}</span>
              <ul>
                <li>
                  <a href={orgInfo.instagram} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href={orgInfo.tiktok} target="_blank" rel="noreferrer">
                    TikTok
                  </a>
                </li>
                <li>
                  <a href={orgInfo.linktree} target="_blank" rel="noreferrer">
                    Linktree
                  </a>
                </li>
              </ul>
            </div>
          </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {t.common.footer.rights}</p>
          <p className="footer-note">{t.common.footer.madeFor}</p>
        </div>
      </div>
    </footer>
  )
}
