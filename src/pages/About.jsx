import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import PageHero from '../components/PageHero.jsx'
import Figure from '../components/Figure.jsx'
import PartnerMarquee from '../components/PartnerMarquee.jsx'
import { partnerGroups, partnerCount, impact } from '../data/sponsors.js'
import { photographer } from '../data/gallery.js'
import './About.css'

export default function About() {
  const { lang, t } = useLanguage()
  const a = t.about

  return (
    <>
      <PageHero kicker={a.kicker} title={a.title} lede={a.lede} />

      {/* Three plates before any prose: the room, the stage, the cause. */}
      <section className="section--tight">
        <div className="container">
          <div className="about-band">
            <Figure
              src="/photos/hero-band.jpg"
              alt={t.home.bandAlt}
              ratio="4 / 3"
              priority
              className="about-band__wide"
              credit={`${t.home.photoCredit} ${photographer}`}
            />
            <Figure
              src="/photos/highlight-1.jpg"
              alt={lang === 'id' ? 'Pianis membawakan karya di atas grand piano' : 'A pianist performing at the grand piano'}
              ratio="1 / 1"
            />
            <Figure
              src="/photos/impact.jpg"
              alt={impact.beneficiary}
              ratio="1 / 1"
            />
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <div className="about-mission card">
            <h2>{a.missionTitle}</h2>
            <div className="about-mission__paras prose-serif">
              {a.missionParas.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Foreword, the printed programme's opening page ---------- */}
      <section className="section--tight">
        <div className="container">
          <div className="foreword card-dark">
            <span className="badge badge-onDark">{a.forewordEyebrow}</span>
            <h2 className="foreword__title">{a.forewordTitle}</h2>
            <div className="foreword__paras prose-serif">
              {a.forewordParas.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
            <p className="foreword__sign">{a.forewordSign}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{a.historyEyebrow}</span>
            <h2>{a.historyTitle}</h2>
          </div>
          <ol className="timeline">
            {a.history.map((item) => (
              <li key={item.name} className="timeline__item card">
                <span className="badge timeline__year">{item.year}</span>
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Harmonia Family ---------- */}
      <section className="section family-section">
        <div className="container">
          <div className="family-intro">
            <div>
              <span className="eyebrow">{a.familyEyebrow}</span>
              <h2>{a.familyTitle}</h2>
              <p>{a.familyBody}</p>
              <Link className="btn btn-primary" to="/lineup">
                {t.common.nav.team}
              </Link>
            </div>
            <Figure
              src="/photos/team.jpg"
              alt={
                lang === 'id'
                  ? 'Panitia Harmonia berfoto bersama seusai acara'
                  : 'The Harmonia committee photographed together after the event'
              }
              ratio="16 / 10"
              className="family-intro__fig"
            />
          </div>
        </div>
      </section>

      {/* ---------- Partners & impact (merged from Sponsors & Impact) ---------- */}
      <section className="section" id="partners">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.sponsorsImpact.sponsorsEyebrow}</span>
            <h2>{t.sponsorsImpact.sponsorsTitle}</h2>
          </div>
        </div>

        <PartnerMarquee label={t.sponsorsImpact.partnersNote} />

        <div className="container partner-wall-wrap">
          {partnerGroups.map((group) => (
            <div key={group.key} className="partner-group">
              <div className="partner-group__head">
                <h3>{t.sponsorsImpact.groups[group.key]}</h3>
                <span className="partner-group__count">{group.items.length}</span>
              </div>
              <ul className="partner-wall">
                {group.items.map((p) => (
                  <li key={p.id} className="partner-tile">
                    <img src={p.logo} alt={p.name} loading="lazy" />
                    <span className="partner-tile__name">{p.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="impact">
        <div className="container">
          <div className="impact card-dark">
            <div className="impact__main">
              <span className="badge badge-onDark">{t.sponsorsImpact.impactEyebrow}</span>
              <h2>{t.sponsorsImpact.impactTitle}</h2>
              <p>{t.sponsorsImpact.impactBody}</p>
              <div className="impact__facts">
                <div>
                  <span className="impact__fact-v">{t.sponsorsImpact.impactRaisedValue}</span>
                  <span className="impact__fact-k">{t.sponsorsImpact.impactRaisedLabel}</span>
                </div>
                <div>
                  <span className="impact__fact-v">201</span>
                  <span className="impact__fact-k">
                    {lang === 'id' ? 'Tiket Terjual' : 'Tickets Sold'}
                  </span>
                </div>
                <div>
                  <span className="impact__fact-v">{partnerCount}</span>
                  <span className="impact__fact-k">
                    {lang === 'id' ? 'Mitra & Sponsor' : 'Partners & Sponsors'}
                  </span>
                </div>
              </div>
              <p className="impact__note">{t.sponsorsImpact.impactStatsNote}</p>
            </div>
            <Figure
              src="/photos/impact.jpg"
              alt={impact.beneficiary}
              ratio="4 / 5"
              className="impact__fig"
              credit={`${t.home.photoCredit} ${photographer}`}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="partner card">
            <div>
              <span className="eyebrow">{a.partnerEyebrow}</span>
              <h2>{a.partnerTitle}</h2>
              <p>{a.partnerBody}</p>
            </div>
            <Link className="btn btn-primary btn-lg" to="/contact">
              {a.partnerCta}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
