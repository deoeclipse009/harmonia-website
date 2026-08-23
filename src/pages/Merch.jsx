import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { merch, orgInfo } from '../data/org.js'
import PageHero from '../components/PageHero.jsx'
import Figure from '../components/Figure.jsx'
import './Merch.css'

export default function Merch() {
  const { lang, t } = useLanguage()
  const m = t.merch
  const pick = (id, en) => (lang === 'id' ? id : en)

  return (
    <>
      <PageHero kicker={m.kicker} title={m.title} lede={m.lede} />

      <section className="section--tight">
        <div className="container">
          <div className="product card">
            <Figure
              src={merch.photo}
              alt={pick(merch.descId, merch.descEn)}
              ratio="4 / 3"
              className="product__fig"
              seed={2}
            />
            <div className="product__body">
              <h2>{pick(merch.nameId, merch.nameEn)}</h2>
              <p className="product__desc">{pick(merch.descId, merch.descEn)}</p>

              <div className="product__prices">
                <div>
                  <span className="product__price-key">{m.normalLabel}</span>
                  <span className="product__price product__price--was">{merch.price}</span>
                </div>
                <div>
                  <span className="product__price-key">{m.promoLabel}</span>
                  <span className="product__price">{merch.promoPrice}</span>
                </div>
              </div>

              <div className="product__terms">
                <p>
                  <strong>{m.promoHow}:</strong> {pick(merch.promoTermsId, merch.promoTermsEn)}
                </p>
                <p>
                  <strong>{m.cashbackLabel}:</strong> {pick(merch.cashbackId, merch.cashbackEn)}
                </p>
              </div>

              <div className="product__actions">
                <a className="btn btn-accent btn-lg" href={merch.orderForm} target="_blank" rel="noreferrer">
                  {m.orderCta}
                </a>
                <a className="btn btn-ghost btn-lg" href={orgInfo.instagram} target="_blank" rel="noreferrer">
                  DM {orgInfo.instagramHandle}
                </a>
              </div>

              <p className="product__pickup">{m.pickupNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <div className="merch-order card--quiet card">
            <div>
              <span className="eyebrow">{m.orderTitle}</span>
              <ol className="merch-order__list">
                {m.orderWays.map((w, i) => (
                  <li key={w}>
                    <span className="merch-order__num">{String(i + 1).padStart(2, '0')}</span>
                    {w}
                  </li>
                ))}
              </ol>
            </div>
            <Link className="btn btn-primary" to="/contact">
              {t.common.nav.contact}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
