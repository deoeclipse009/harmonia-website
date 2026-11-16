import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import PageHero from '../components/PageHero.jsx'
import Figure from '../components/Figure.jsx'
import { partnerGroups, partnerCount, impact } from '../data/sponsors.js'
import { photographer } from '../data/gallery.js'
import './About.css'

// About, on the stage: why Harmonia exists, the foreword, how it grew, the
// people, where the money went, who backed it, and how to join in.
export default function About() {
  const { lang, t } = useLanguage()
  const a = t.about
  const si = t.sponsorsImpact
  const id = lang === 'id'

  return (
    <div className="stg">
      <PageHero
        title={a.title}
        lede={a.lede}
        photo="/photos/highlight-1.jpg"
        alt={id ? 'Pianis membawakan karya di atas grand piano' : 'A pianist performing at the grand piano'}
      />

      {/* Why: the mission as one line and its reasons beside it */}
      <section className="stg-sec">
        <div className="container stg-split">
          <h2 className="stg-line">{a.missionTitle}</h2>
          <div className="stg-body">
            {a.missionParas.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Two plates: the whole cast, and the cause */}
      <section className="stg-sec stg-sec--flush">
        <div className="container about-plates">
          <Figure src="/photos/hero-band.jpg" alt={t.home.bandAlt} ratio="3 / 2" credit={`${t.home.photoCredit} ${photographer}`} />
          <Figure src="/photos/highlight-2.jpg" alt="" ratio="4 / 5" />
        </div>
      </section>

      {/* The foreword from the printed programme, as a letter */}
      <section className="stg-sec stg-sec--flush">
        <div className="container">
          <article className="stg-panel about-letter">
            <h2 className="stg-h2">{a.forewordTitle}</h2>
            <div className="stg-body stg-quote">
              {a.forewordParas.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              <p className="about-letter__sign">{a.forewordSign}</p>
            </div>
          </article>
        </div>
      </section>

      {/* How it grew */}
      <section className="stg-sec">
        <div className="container">
          <div className="stg-head">
            <h2>{a.historyTitle}</h2>
          </div>
          <ol className="stg-rows">
            {a.history.map((item) => (
              <li key={item.name}>
                <span className="stg-rows__k">{item.year}</span>
                <h3 className="stg-rows__t">{item.name}</h3>
                <p className="stg-rows__d">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The people */}
      <section className="stg-sec stg-sec--flush">
        <div className="container about-family">
          <Figure
            src="/photos/team.jpg"
            alt={id ? 'Panitia Harmonia berfoto bersama seusai acara' : 'The Harmonia committee photographed together after the event'}
            ratio="16 / 10"
          />
          <div className="about-family__text">
            <h2 className="stg-h2">{a.familyTitle}</h2>
            <div className="stg-body">
              <p>{a.familyBody}</p>
            </div>
            <Link className="btn btn-primary" to="/lineup">
              {t.common.nav.team} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Where the money went: the maroon sheet */}
      <section className="stg-sheet about-impact" id="impact">
        <div className="container stg-split">
          <div>
            <h2 className="stg-h2">{si.impactTitle}</h2>
            <div className="stg-body">
              <p>{si.impactBody}</p>
            </div>
            <ul className="stg-cells about-impact__cells" style={{ '--cols': 3 }}>
              <li>
                <span className="stg-cells__v">{si.impactRaisedValue}</span>
                <span className="stg-cells__k">{si.impactRaisedLabel}</span>
              </li>
              <li>
                <span className="stg-cells__v">201</span>
                <span className="stg-cells__k">{id ? 'Tiket Terjual' : 'Tickets Sold'}</span>
              </li>
              <li>
                <span className="stg-cells__v">{partnerCount}</span>
                <span className="stg-cells__k">{id ? 'Mitra & Sponsor' : 'Partners & Sponsors'}</span>
              </li>
            </ul>
            <p className="about-impact__note">{si.impactStatsNote}</p>
          </div>
          <Figure src="/photos/impact.jpg" alt={impact.beneficiary} ratio="4 / 5" className="about-impact__fig" credit={`${t.home.photoCredit} ${photographer}`} />
        </div>
      </section>

      {/* Who backed it: every partner, by group, logo on its own white tile */}
      <section className="stg-sec" id="partners">
        <div className="container">
          <div className="stg-head">
            <h2>{si.sponsorsTitle}</h2>
          </div>
          <p className="about-partners__note">{si.partnersNote}</p>
          {partnerGroups.map((group) => (
            <div key={group.key} className="about-group">
              <h3 className="about-group__title">
                {si.groups[group.key]} <span>{group.items.length}</span>
              </h3>
              <ul className="stg-tiles">
                {group.items.map((p) => (
                  <li key={p.id}>
                    <span className="stg-tiles__logo">
                      <img src={p.logo} alt="" loading="lazy" decoding="async" />
                    </span>
                    <span className="stg-tiles__name">{p.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Join in */}
      <section className="stg-close">
        <div className="container">
          <div>
            <h2>{a.partnerTitle}</h2>
            <p>{a.partnerBody}</p>
          </div>
          <Link className="btn btn-primary btn-lg" to="/contact">
            {a.partnerCta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
