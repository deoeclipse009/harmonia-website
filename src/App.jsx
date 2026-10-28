import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useLanguage } from './i18n/LanguageContext.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Edition from './pages/Edition.jsx'
import Lineup from './pages/Lineup.jsx'
import Gallery from './pages/Gallery.jsx'
import Merch from './pages/Merch.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

const SITE = 'Harmonia'
const ORIGIN = 'https://harmoniafest.vercel.app'

// One title per destination. Without this every route shares the static
// title in index.html, so search results and a row of browser tabs all
// read the same.
const TITLES = {
  '/': {
    id: 'Harmonia, Konser Musik Amal',
    en: 'Harmonia, Charity Music Concert',
  },
  '/about': { id: 'Tentang Kami', en: 'About Us' },
  '/lineup': { id: 'Penampil & Panitia', en: 'Lineup & Team' },
  '/gallery': { id: 'Galeri', en: 'Gallery' },
  '/merch': { id: 'Merchandise', en: 'Merchandise' },
  '/contact': { id: 'Kontak', en: 'Contact' },
}

function RouteMeta() {
  const { pathname } = useLocation()
  const { lang } = useLanguage()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const entry = TITLES[pathname]
    let title
    if (entry) {
      title = pathname === '/' ? entry[lang] : `${entry[lang]} | ${SITE}`
    } else if (pathname.startsWith('/edition/')) {
      title = `Harmonia 2025 | ${SITE}`
    } else {
      title =
        lang === 'id'
          ? `Halaman tidak ditemukan | ${SITE}`
          : `Page not found | ${SITE}`
    }
    document.title = title

    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = `${ORIGIN}${pathname}`
  }, [pathname, lang])

  return null
}

export default function App() {
  return (
    <div className="app-shell">
      <RouteMeta />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/edition/:slug" element={<Edition />} />
          <Route path="/lineup" element={<Lineup />} />
          {/* retired paths keep working */}
          <Route path="/performers" element={<Navigate to="/lineup" replace />} />
          <Route path="/team" element={<Navigate to="/lineup" replace />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/sponsors-impact" element={<Navigate to="/about#partners" replace />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
