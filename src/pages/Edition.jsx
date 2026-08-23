import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { editions } from '../data/editions.js'
import { performances } from '../data/performers.js'
import { partnerCount, impact } from '../data/sponsors.js'
import { photographer } from '../data/gallery.js'
import Figure from '../components/Figure.jsx'
import './Edition.css'

// A retrospective, not a listing. The night is told in order: the facts,
// the room, the run of show, what it raised, and the printed programme.

export default function Edition() {
  const { slug } = useParams()
  const { lang, t } = useLanguage()
  const edition = editions.find((e) => e.slug === slug)
  const e = t.edition

  if (!edition) {
    return (
      <div className="container section">
        <span className="eyebrow">404</span>
        <h1 style={{ margin: '8px 0 16px' }}>
          {lang === 'id' ? 'Edisi tidak ditemukan.' : 'Edition not found.'}
        </h1>
        <Link className="btn btn-primary" to="/">
          {t.common.nav.home}
        </Link>
      </div>
    )
  }

  const dateDisplay = lang === 'id' ? edition.dateDisplay : edition.dateDisplayEn
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(edition.mapQuery)}`
  // "17.30-21.00 WIB" -> doors "17.30 WIB", close "21.00 WIB"
  const [rawDoors, rawClose] = edition.time.split('-').map((s) => s.trim())
  const unit = (rawClose.match(/[A-Za-z]+$/) || [''])[0]
  const doorsTime = unit ? `${rawDoors} ${unit}` : rawDoors
  const closeTime = rawClose

  const facts = [
    { k: e.dateLabel, v: `${dateDisplay} · ${edition.time}` },
    {
      k: e.venueLabel,
      v: lang === 'id' ? (edition.venueFullId ?? edition.venue) : (edition.venueFullEn ?? edition.venue),
      link: { href: mapHref, label: e.mapLabel },
    },
    ...(edition.collaborator ? [{ k: e.collabLabel, v: edition.collaborator }] : []),
  ]

  return (
    <>
      <section className="edition-hero">
        <div className="container">
          <div className="edition-hero__inner">
            <div className="edition-hero__badges">
              <span className="badge badge-accent">{e.kicker}</span>
              <span className="badge">{t.home.statusPastLabel}</span>
            </div>
            <h1>{edition.name}</h1>
            <p className="edition-hero__desc">{e.description}</p>
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <Figure
            src={edition.heroImage}
            alt={t.home.bandAlt}
            ratio="21 / 9"
            credit={`${t.home.photoCredit} ${photographer}`}
          />
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <ul className="edition-facts">
            {facts.map((f) => (
              <li key={f.k} className="edition-facts__item">
                <span className="edition-facts__key">{f.k}</span>
                <span className="edition-facts__val">{f.v}</span>
                {f.link && (
                  <a className="edition-facts__link" href={f.link.href} target="_blank" rel="noreferrer">
                    {f.link.label} &rarr;
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Run of show ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{e.runEyebrow}</span>
            <h2>{e.runTitle}</h2>
          </div>

          <ol className="run">
            <li className="run__item run__item--marker">
              <span className="run__time">{doorsTime}</span>
              <span className="run__label">{e.runDoors}</span>
            </li>

            {performances.map((p, i) => (
              <li key={p.key} className="run__item">
                <span className="run__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="run__body">
                  <span className="run__name">{lang === 'id' ? p.titleId : p.titleEn}</span>
                  <span className="run__role">{lang === 'id' ? p.roleId : p.roleEn}</span>
                </span>
              </li>
            ))}

            <li className="run__item run__item--marker">
              <span className="run__time">{closeTime}</span>
              <span className="run__label">{e.runClose}</span>
            </li>
          </ol>

          <Link className="btn btn-ghost run__cta" to="/gallery">
            {t.common.nav.gallery} &rarr;
          </Link>
        </div>
      </section>

      {/* ---------- What the night raised ---------- */}
      <section className="section--tight">
        <div className="container">
          <div className="edition-impact card-dark">
            <div className="edition-impact__head">
              <span className="badge badge-onDark">{e.impactEyebrow}</span>
              <h2>{e.impactTitle}</h2>
              <p>{e.impactBody}</p>
            </div>
            <ul className="edition-impact__facts">
              <li>
                <span className="edition-impact__v">{edition.ticketsSold}</span>
                <span className="edition-impact__k">
                  {lang === 'id' ? 'Tiket Terjual' : 'Tickets Sold'}
                </span>
              </li>
              <li>
                <span className="edition-impact__v">{t.sponsorsImpact.impactRaisedValue}</span>
                <span className="edition-impact__k">{t.sponsorsImpact.impactRaisedLabel}</span>
              </li>
              <li>
                <span className="edition-impact__v">{partnerCount}</span>
                <span className="edition-impact__k">
                  {lang === 'id' ? 'Mitra & Sponsor' : 'Partners & Sponsors'}
                </span>
              </li>
              <li>
                <span className="edition-impact__v edition-impact__v--text">
                  {impact.beneficiary}
                </span>
                <span className="edition-impact__k">
                  {lang === 'id' ? 'Penerima Manfaat' : 'Beneficiary'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- The printed programme ---------- */}
      <section className="section--tight">
        <div className="container">
          <div className="guidebook card">
            <div>
              <span className="eyebrow">{e.guideEyebrow}</span>
              <h2>{e.guideTitle}</h2>
              <p>{e.guideBody}</p>
            </div>
            <a
              className="btn btn-primary btn-lg"
              href="/harmonia-2025-guide-book.pdf"
              target="_blank"
              rel="noreferrer"
            >
              {e.guideCta}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
