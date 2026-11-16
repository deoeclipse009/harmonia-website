import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { editions } from '../data/editions.js'
import { performances } from '../data/performers.js'
import { partnerCount, impact } from '../data/sponsors.js'
import PageHero from '../components/PageHero.jsx'
import './Edition.css'

// A retrospective of one night, on the stage: the facts over the photo, the
// run of show, what it raised, and the printed programme to keep.
export default function Edition() {
  const { slug } = useParams()
  const { lang, t } = useLanguage()
  const edition = editions.find((e) => e.slug === slug)
  const e = t.edition
  const id = lang === 'id'

  if (!edition) {
    return (
      <PageHero title={id ? 'Edisi tidak ditemukan.' : 'Edition not found.'}>
        <Link className="btn btn-primary" to="/">
          {t.common.nav.home}
        </Link>
      </PageHero>
    )
  }

  const dateDisplay = id ? edition.dateDisplay : edition.dateDisplayEn
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(edition.mapQuery)}`
  // "17.30-21.00 WIB" -> doors "17.30 WIB", close "21.00 WIB"
  const [rawDoors, rawClose] = edition.time.split('-').map((s) => s.trim())
  const unit = (rawClose.match(/[A-Za-z]+$/) || [''])[0]
  const doorsTime = unit ? `${rawDoors} ${unit}` : rawDoors
  const venue = id ? (edition.venueFullId ?? edition.venue) : (edition.venueFullEn ?? edition.venue)

  return (
    <div className="stg">
      <PageHero title={edition.name} lede={e.description} photo={edition.heroImage} alt={t.home.bandAlt}>
        <dl className="ed-facts">
          <div>
            <dt>{e.dateLabel}</dt>
            <dd>{dateDisplay}, {edition.time}</dd>
          </div>
          <div>
            <dt>{e.venueLabel}</dt>
            <dd>
              {venue}{' '}
              <a href={mapHref} target="_blank" rel="noreferrer">
                {e.mapLabel} <span aria-hidden="true">→</span>
              </a>
            </dd>
          </div>
          {edition.collaborator && (
            <div>
              <dt>{e.collabLabel}</dt>
              <dd>{edition.collaborator}</dd>
            </div>
          )}
        </dl>
      </PageHero>

      {/* Run of show */}
      <section className="stg-sec">
        <div className="container">
          <div className="stg-head">
            <h2>{e.runTitle}</h2>
            <Link className="stg-link" to="/gallery">
              {t.common.nav.gallery} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ol className="stg-rows ed-run">
            <li className="ed-run__marker">
              <span className="stg-rows__k">{doorsTime}</span>
              <p className="stg-rows__t">{e.runDoors}</p>
            </li>
            {performances.map((p, i) => (
              <li key={p.key}>
                <span className="stg-rows__k">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="stg-rows__t">{id ? p.titleId : p.titleEn}</h3>
                <p className="stg-rows__d">{id ? p.roleId : p.roleEn}</p>
              </li>
            ))}
            <li className="ed-run__marker">
              <span className="stg-rows__k">{rawClose}</span>
              <p className="stg-rows__t">{e.runClose}</p>
            </li>
          </ol>
        </div>
      </section>

      {/* What the night raised */}
      <section className="stg-sheet">
        <div className="container">
          <div className="stg-split ed-impact">
            <h2 className="stg-h2">{e.impactTitle}</h2>
            <div className="stg-body">
              <p>{e.impactBody}</p>
              <p className="ed-impact__to">
                {id ? 'Penerima manfaat' : 'Beneficiary'}: <strong>{impact.beneficiary}</strong>
              </p>
            </div>
          </div>
          <ul className="stg-cells ed-impact__cells" style={{ '--cols': 3 }}>
            <li>
              <span className="stg-cells__v">{t.sponsorsImpact.impactRaisedValue}</span>
              <span className="stg-cells__k">{t.sponsorsImpact.impactRaisedLabel}</span>
            </li>
            <li>
              <span className="stg-cells__v">{edition.ticketsSold}</span>
              <span className="stg-cells__k">{id ? 'Tiket Terjual' : 'Tickets Sold'}</span>
            </li>
            <li>
              <span className="stg-cells__v">{partnerCount}</span>
              <span className="stg-cells__k">{id ? 'Mitra & Sponsor' : 'Partners & Sponsors'}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* The printed programme */}
      <section className="stg-close">
        <div className="container">
          <div>
            <h2>{e.guideTitle}</h2>
            <p>{e.guideBody}</p>
          </div>
          <a className="btn btn-primary btn-lg" href="/harmonia-2025-guide-book.pdf" target="_blank" rel="noreferrer">
            {e.guideCta} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </div>
  )
}
