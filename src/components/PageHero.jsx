import './PageHero.css'

export default function PageHero({ kicker, title, lede, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="page-hero__inner">
          {kicker && <span className="badge badge-accent">{kicker}</span>}
          <h1>{title}</h1>
          {lede && <p className="page-hero__lede">{lede}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}
