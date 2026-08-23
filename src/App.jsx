import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
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
