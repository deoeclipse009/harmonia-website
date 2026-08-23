import { useLanguage } from '../i18n/LanguageContext.jsx'
import { gallerySets, photographer, galleryCount } from '../data/gallery.js'
import { orgInfo } from '../data/org.js'
import PageHero from '../components/PageHero.jsx'
import Carousel from '../components/Carousel.jsx'
import RecapVideo from '../components/RecapVideo.jsx'
import './Gallery.css'

// One carousel per artist, the way the audience remembers the night:
// set by set, rather than one undifferentiated wall of thumbnails.

export default function Gallery() {
  const { lang, t } = useLanguage()
  const g = t.gallery

  return (
    <>
      <PageHero kicker={g.kicker} title={g.title} lede={g.lede}>
        <p className="gallery-credit">
          {galleryCount} {lang === 'id' ? 'foto' : 'photos'} &middot; {t.home.photoCredit}{' '}
          <strong>{photographer}</strong>
        </p>
      </PageHero>

      {/* ---------- Recap video ---------- */}
      <section className="section--tight">
        <div className="container">
          <RecapVideo />
        </div>
      </section>

      {/* ---------- One set per artist ---------- */}
      {gallerySets.map((set) => (
        <section className="section--tight gallery-set" key={set.key}>
          <div className="container">
            <div className="gallery-set__head">
              <div>
                <span className="eyebrow">{lang === 'id' ? set.roleId : set.roleEn}</span>
                <h2>{lang === 'en' && set.titleEn ? set.titleEn : set.title}</h2>
              </div>
              <span className="gallery-set__count">
                {set.photos.length} {lang === 'id' ? 'foto' : 'photos'}
              </span>
            </div>

            <Carousel label={set.title}>
              {set.photos.map((src, i) => (
                <figure className="gallery-slide" key={src}>
                  <img
                    src={src}
                    alt={`${set.title}, ${lang === 'id' ? 'foto' : 'photo'} ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </Carousel>
          </div>
        </section>
      ))}

      {/* ---------- Instagram highlights ---------- */}
      <section className="section--tight">
        <div className="container">
          <div className="ig-highlights card">
            <div>
              <span className="eyebrow">{g.highlightsEyebrow}</span>
              <h2>{g.highlightsTitle}</h2>
              <p>{g.highlightsBody}</p>
            </div>
            <a className="btn btn-primary btn-lg" href={orgInfo.instagram} target="_blank" rel="noreferrer">
              {g.highlightsCta}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
