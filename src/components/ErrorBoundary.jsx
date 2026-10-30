import { Component } from 'react'
import './ErrorBoundary.css'

// Sits outside LanguageProvider so it still catches if the provider itself
// throws. That means no access to the i18n dictionary, so both languages
// are written out rather than chosen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    // Keep it in the console for whoever is debugging. No analytics
    // service is wired up, so there is nowhere else to send it.
    console.error('Harmonia: render failed', error, info)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="error-boundary">
        <div className="error-boundary__inner">
          <p className="error-boundary__mark">Harmonia</p>
          <h1>Ada yang tidak beres di halaman ini.</h1>
          <p>
            Coba muat ulang. Kalau masih sama, hubungi kami lewat Instagram
            dan sebutkan halaman mana yang kamu buka.
          </p>
          <h2>Something went wrong on this page.</h2>
          <p>
            Try reloading. If it keeps happening, message us on Instagram and
            tell us which page you were on.
          </p>
          <div className="error-boundary__actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Muat ulang / Reload
            </button>
            <a
              className="btn btn-ink"
              href="https://instagram.com/harmoniafest.id"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    )
  }
}
