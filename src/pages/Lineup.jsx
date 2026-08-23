import { useLanguage } from '../i18n/LanguageContext.jsx'
import { performers, program } from '../data/performers.js'
import { getPerformerPhoto } from '../data/performerPhotos.js'
import { team, teamCount } from '../data/team.js'
import { getTeamPhoto } from '../data/teamPhotos.js'
import { photographer } from '../data/gallery.js'
import PageHero from '../components/PageHero.jsx'
import Figure from '../components/Figure.jsx'
import Avatar from '../components/Avatar.jsx'
import './Lineup.css'

const DIVISION_ORDER = ['lead', 'stage', 'ops', 'creative']

function PerformerCard({ p, lang }) {
  return (
    <article className="performer">
      <Avatar src={getPerformerPhoto(p.id)} name={p.name} />
      <div className="performer__body">
        <h3>{p.name}</h3>
        <p className="performer__role">{lang === 'id' ? p.roleId : p.roleEn}</p>
        {(p.noteId || p.noteEn) && (
          <p className="performer__note">{lang === 'id' ? p.noteId : p.noteEn}</p>
        )}
        {p.members && (
          <ul className="performer__members">
            {p.members.map((m) => (
              <li key={m.name}>
                {m.instagram ? (
                  <a href={`https://instagram.com/${m.instagram}`} target="_blank" rel="noreferrer">
                    <span className="performer__member-name">{m.name}</span>
                    <span className="performer__member-ig">@{m.instagram}</span>
                  </a>
                ) : (
                  <span className="performer__member-name">{m.name}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {p.instagram && (
          <a
            className="performer__ig"
            href={`https://instagram.com/${p.instagram}`}
            target="_blank"
            rel="noreferrer"
          >
            @{p.instagram}
          </a>
        )}
      </div>
    </article>
  )
}

export default function Lineup() {
  const { lang, t } = useLanguage()
  const pf = t.performers
  const a = t.about
  const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99)
  const solos = performers.filter((p) => p.kind === 'solo').sort(byOrder)
  const ensembles = performers.filter((p) => p.kind === 'ensemble').sort(byOrder)

  return (
    <>
      <PageHero kicker={pf.kicker} title={pf.title} lede={pf.lede} />

      {/* ---------- The artists lead the page ---------- */}
      <section className="section--tight">
        <div className="container">
          <div className="lineup-head">
            <h2>{pf.soloTitle}</h2>
            <span className="lineup-head__count">{solos.length}</span>
          </div>
          <div className="performers">
            {solos.map((p) => (
              <PerformerCard key={p.id} p={p} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <div className="lineup-head">
            <h2>{pf.ensembleTitle}</h2>
            <span className="lineup-head__count">{ensembles.length}</span>
          </div>
          <div className="performers performers--wide">
            {ensembles.map((p) => (
              <PerformerCard key={p.id} p={p} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Programme ---------- */}
      <section className="section--tight">
        <div className="container">
          <div className="programme card-dark">
            <div className="programme__head">
              <span className="badge badge-onDark">{pf.programEyebrow}</span>
              <h2>{pf.programTitle}</h2>
            </div>
            <div className="table-wrap">
              <table className="programme__table">
                <thead>
                  <tr>
                    <th>{pf.programCols.piece}</th>
                    <th>{pf.programCols.composer}</th>
                    <th>{pf.programCols.performedBy}</th>
                    <th>{pf.programCols.arrangedBy}</th>
                  </tr>
                </thead>
                <tbody>
                  {program.map((row) => (
                    <tr key={row.piece}>
                      <td className="programme__piece">{row.piece}</td>
                      <td>{row.composer || '\u2013'}</td>
                      <td>{row.performedBy}</td>
                      <td>{row.arrangedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- The crew behind them ---------- */}
      <section className="section crew-section">
        <div className="container">
          <div className="crew-intro">
            <div>
              <span className="eyebrow">{a.familyEyebrow}</span>
              <h2>{a.familyTitle}</h2>
              <p>{a.familyBody}</p>
            </div>
            <Figure
              src="/photos/team.jpg"
              alt={
                lang === 'id'
                  ? 'Panitia Harmonia berfoto bersama seusai acara'
                  : 'The Harmonia committee photographed together after the event'
              }
              ratio="16 / 10"
              credit={`${t.home.photoCredit} ${photographer}`}
            />
          </div>

          {DIVISION_ORDER.map((div) => {
            const members = team.filter((m) => m.division === div)
            if (!members.length) return null
            return (
              <div key={div} className="crew-group">
                <div className="crew-group__head">
                  <h3>{a.familyDivisions[div]}</h3>
                  <span className="crew-group__count">{members.length}</span>
                </div>
                <ul className="crew">
                  {members.map((m) => (
                    <li key={m.id} className="crew__member">
                      <Avatar src={getTeamPhoto(m.id)} name={m.name} />
                      <div className="crew__text">
                        <span className="crew__name">{m.name}</span>
                        <span className="crew__role">
                          {lang === 'id' ? m.roleId : m.roleEn}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          <p className="crew__total">
            {teamCount} {lang === 'id' ? 'panitia · Harmonia 2025' : 'organisers · Harmonia 2025'}
          </p>
        </div>
      </section>
    </>
  )
}
