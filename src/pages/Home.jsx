import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { activeEdition, latestPastEdition } from '../data/editions.js'
import { performances } from '../data/performers.js'
import { photographer } from '../data/gallery.js'
import Figure from '../components/Figure.jsx'
import PartnerMarquee from '../components/PartnerMarquee.jsx'
import './Home.css'

// The home page holds exactly five sections:
// 1. Hero, fits the viewport on tablet and up, so the earned numbers
//    are readable without scrolling
// 2. Words from the founder
// 3. Mission (dark chamber)
// 4. Performers (the bill)
// 5. Partners (marquee)

export default function Home() {
  const { lang, t } = useLanguage()
  const isUpcoming = activeEdition.status === 'upcoming'
  const heroEdition = isUpcoming ? activeEdition : latestPastEdition
  const dateDisplay = lang === 'id' ? heroEdition.dateDisplay : heroEdition.dateDisplayEn

  return (
    <>
      {/* ============ 1 · HERO ============ */}
      <section className="hero">
        <div className="container">
          <div className="hero__lead">
            <h1 className="display hero__title">
              Harmonia
              <span className="hero__title-sub">Harmoni Indonesia</span>
            </h1>

            <div className="hero__row">
              <p className="hero__subtitle">{t.home.subtitle}</p>
              <div className="hero__actions">
                {isUpcoming ? (
                  <a
                    className="btn btn-accent btn-lg"
                    href={activeEdition.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.home.ctaPrimary}
                  </a>
                ) : (
                  <Link className="btn btn-accent btn-lg" to={`/edition/${heroEdition.slug}`}>
                    {t.home.ctaSecondary}
                  </Link>
                )}
                <Link className="btn btn-ghost btn-lg" to="/gallery">
                  {t.common.nav.gallery}
                </Link>
              </div>
            </div>
          </div>

          <div className="hero__media">
            <Figure
              src="/photos/hero-band.jpg"
              alt={t.home.bandAlt}
              ratio="21 / 9"
              fill
              priority
              credit={`${t.home.photoCredit} ${photographer}`}
            />
          </div>

          <p className="hero__meta">
            {dateDisplay} &middot; {heroEdition.venue}
          </p>

          <ul className="hero__stats">
            {t.home.stats.map((s) => (
              <li key={s.k}>
                <span className="hero__stat-v">{s.v}</span>
                <span className="hero__stat-k">{s.k}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 2 · WORDS FROM THE FOUNDER ============ */}
      <section className="section--tight">
        <div className="container">
          <div className="founder card--quiet card">
            <Figure
              src="/photos/hero-portrait.jpg"
              alt={t.home.founderName}
              ratio="4 / 5"
              className="founder__fig"
              credit={`${t.home.photoCredit} ${photographer}`}
            />
            <div className="founder__body">
              <span className="eyebrow">{t.home.founderEyebrow}</span>
              <h2>{t.home.founderTitle}</h2>
              <div className="founder__paras prose-serif">
                {t.home.founderParas.map((para) => (
                  <p key={para.slice(0, 24)}>{para}</p>
                ))}
              </div>
              <div className="founder__sign">
                <span className="founder__name">{t.home.founderName}</span>
                <span className="founder__role">{t.home.founderRole}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3 · MISSION ============ */}
      <section className="section--tight">
        <div className="container">
          <div className="mission card-dark">
            <div className="mission__head">
              <span className="badge badge-onDark">{t.home.missionEyebrow}</span>
              <h2>{t.home.missionTitle}</h2>
              <p>{t.home.missionBody}</p>
              <Link className="btn btn-inverse" to="/about#partners">
                {t.common.nav.sponsors}
              </Link>
            </div>
            <Figure
              src="/photos/impact.jpg"
              alt="SOS Children’s Villages Indonesia"
              ratio="16 / 10"
              className="mission__fig"
            />
          </div>
        </div>
      </section>
      {/* ============ 4 · PERFORMERS, the bill ============ */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.home.performersEyebrow}</span>
            <h2>{t.home.performersTitle}</h2>
          </div>
          <ol className="bill">
            {performances.map((p, i) => (
              <li key={p.key} className="bill__row">
                <span className="bill__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="bill__name">{lang === 'id' ? p.titleId : p.titleEn}</span>
                <span className="bill__role">{lang === 'id' ? p.roleId : p.roleEn}</span>
              </li>
            ))}
          </ol>
          <Link className="btn btn-primary btn-lg bill__cta" to="/lineup">
            {t.home.performersCta}
          </Link>
        </div>
      </section>

      {/* ============ 5 · PARTNERS ============ */}
      <section className="section--tight">
        <PartnerMarquee label={t.sponsorsImpact.partnersNote} />
        <div className="container">
          <Link className="logo-strip__more" to="/about#partners">
            {t.common.nav.sponsors} &rarr;
          </Link>
        </div>
      </section>
    </>
  )
}
