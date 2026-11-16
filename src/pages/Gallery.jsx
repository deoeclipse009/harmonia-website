import { useLanguage } from '../i18n/LanguageContext.jsx'
import { gallerySets, photographer, galleryCount } from '../data/gallery.js'
import { orgInfo } from '../data/org.js'
import PageHero from '../components/PageHero.jsx'
import RecapVideo from '../components/RecapVideo.jsx'
import './Gallery.css'

// The night set by set, the way the audience remembers it. Each act gets a
// grid led by one large photo; every photo opens full size.
export default function Gallery() {
  const { lang, t } = useLanguage()
  const g = t.gallery
  const id = lang === 'id'

  return (
    <div className="stg">
      <PageHero title={g.title} lede={g.lede}>
        <p className="gal-credit">
          {galleryCount} {id ? 'foto oleh' : 'photos by'} <strong>{photographer}</strong>
        </p>
      </PageHero>

      <section className="stg-sec stg-sec--flush">
        <div className="container">
          <RecapVideo />
        </div>
      </section>

      {gallerySets.map((set, n) => (
        <section className="stg-sec gal-set" key={set.key}>
          <div className="container">
            <div className="gal-set__head">
              <span className="stg-rows__k">{String(n + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="gal-set__title">{lang === 'en' && set.titleEn ? set.titleEn : set.title}</h2>
                <p className="gal-set__role">{id ? set.roleId : set.roleEn}</p>
              </div>
            </div>
            <div className="gal-grid">
              {set.photos.map((src, i) => (
                <a key={src} className="gal-plate stg-mask" href={src} target="_blank" rel="noreferrer">
                  <img src={src} alt={`${set.title}, ${id ? 'foto' : 'photo'} ${i + 1}`} loading="lazy" decoding="async" />
                </a>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="stg-close">
        <div className="container">
          <div>
            <h2>{g.highlightsTitle}</h2>
            <p>{g.highlightsBody}</p>
          </div>
          <a className="btn btn-primary btn-lg" href={orgInfo.instagram} target="_blank" rel="noreferrer">
            {g.highlightsCta} <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </div>
  )
}
