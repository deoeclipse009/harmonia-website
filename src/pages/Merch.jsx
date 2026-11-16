import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { merch, orgInfo } from '../data/org.js'
import PageHero from '../components/PageHero.jsx'
import Figure from '../components/Figure.jsx'
import './Merch.css'

// One product, sold for the cause: the photo, the price, how to order.
export default function Merch() {
  const { lang, t } = useLanguage()
  const m = t.merch
  const pick = (id, en) => (lang === 'id' ? id : en)

  return (
    <div className="stg">
      <PageHero title={m.title} lede={m.lede} />

      <section className="stg-sec stg-sec--flush">
        <div className="container mx-product">
          <Figure src={merch.photo} alt={pick(merch.descId, merch.descEn)} ratio="4 / 5" seed={2} />
          <div className="mx-product__body">
            <h2 className="stg-h2">{pick(merch.nameId, merch.nameEn)}</h2>
            <p className="mx-product__desc">{pick(merch.descId, merch.descEn)}</p>

            <div className="mx-price">
              <span className="mx-price__now">{merch.promoPrice}</span>
              <span className="mx-price__was">
                {m.normalLabel} <s>{merch.price}</s>
              </span>
            </div>

            <dl className="mx-terms">
              <div>
                <dt>{m.promoHow}</dt>
                <dd>{pick(merch.promoTermsId, merch.promoTermsEn)}</dd>
              </div>
              <div>
                <dt>{m.cashbackLabel}</dt>
                <dd>{pick(merch.cashbackId, merch.cashbackEn)}</dd>
              </div>
            </dl>

            <div className="mx-actions">
              <a className="btn btn-primary btn-lg" href={merch.orderForm} target="_blank" rel="noreferrer">
                {m.orderCta} <span aria-hidden="true">→</span>
              </a>
              <a className="btn btn-ghost btn-lg" href={orgInfo.instagram} target="_blank" rel="noreferrer">
                DM {orgInfo.instagramHandle}
              </a>
            </div>
            <p className="mx-product__pickup">{m.pickupNote}</p>
          </div>
        </div>
      </section>

      <section className="stg-sec">
        <div className="container">
          <div className="stg-head">
            <h2>{m.orderTitle}</h2>
            <Link className="stg-link" to="/contact">
              {t.common.nav.contact} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ol className="stg-rows mx-ways">
            {m.orderWays.map((w, i) => (
              <li key={w}>
                <span className="stg-rows__k">{String(i + 1).padStart(2, '0')}</span>
                <p className="stg-rows__t">{w}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}
