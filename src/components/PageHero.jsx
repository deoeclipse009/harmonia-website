import './PageHero.css'

// Inner-page hero on the stage. With a photo it runs full width and fades
// into the page, like the home hero but shorter; without one it is a large
// light-weight title with the lede set beside it.
export default function PageHero({ title, lede, photo, alt = '', children }) {
  return (
    <section className={`page-hero${photo ? ' page-hero--photo' : ''}`}>
      {photo && (
        <>
          <img className="page-hero__img" src={photo} alt={alt} fetchPriority="high" />
          <div className="page-hero__shade" />
        </>
      )}
      <div className="container page-hero__inner">
        <h1>{title}</h1>
        {(lede || children) && (
          <div className="page-hero__side">
            {lede && <p className="page-hero__lede">{lede}</p>}
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
