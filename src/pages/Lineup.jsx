import { useLanguage } from '../i18n/LanguageContext.jsx'
import { performers, program } from '../data/performers.js'
import { team, teamCount } from '../data/team.js'
import { photographer } from '../data/gallery.js'
import PageHero from '../components/PageHero.jsx'
import Figure from '../components/Figure.jsx'
import './Lineup.css'

const DIVISION_ORDER = ['lead', 'stage', 'ops', 'creative']

// Each performer shown with a photo from their own act on the 2025 stage
// (public/photos/performances). The four-hands pair share their act.
const STAGE_PHOTO = {
  'adi-utarini': 'adi-utarini-0155.jpg',
  'muhammad-khidir': 'adi-utarini-0160.jpg',
  'gregorius-wikan-herdwiyogatama': 'wikan-jorge-0285.jpg',
  'jodi-visnu': 'jodi-jorge-0190.jpg',
  'jorge-amadeo-benavides': 'jorge-0250.jpg',
  'felice-voce': 'felice-voce-0309.jpg',
  'psm-ugm': 'psm-ugm-0390.jpg',
  syncro5: 'syncro5-0411.jpg',
}

function Performer({ p, id, wide }) {
  const photo = STAGE_PHOTO[p.id]
  return (
    <article className={`lu-act${wide ? ' lu-act--wide' : ''}`}>
      <Figure src={photo ? `/photos/performances/${photo}` : null} alt={p.name} ratio={wide ? '16 / 10' : '4 / 5'} />
      <div className="lu-act__text">
        <h3 className="lu-act__name">{p.name}</h3>
        <p className="lu-act__role">{id ? p.roleId : p.roleEn}</p>
        {(p.noteId || p.noteEn) && <p className="lu-act__note">{id ? p.noteId : p.noteEn}</p>}
        {p.members && (
          <ul className="lu-act__members">
            {p.members.map((m) => (
              <li key={m.name}>
                {m.instagram ? (
                  <a href={`https://instagram.com/${m.instagram}`} target="_blank" rel="noreferrer">
                    {m.name}
                  </a>
                ) : (
                  m.name
                )}
              </li>
            ))}
          </ul>
        )}
        {p.instagram && (
          <a className="lu-act__ig" href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer">
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
  const id = lang === 'id'
  const byOrder = (x, y) => (x.order ?? 99) - (y.order ?? 99)
  const solos = performers.filter((p) => p.kind === 'solo').sort(byOrder)
  const ensembles = performers.filter((p) => p.kind === 'ensemble').sort(byOrder)

  return (
    <div className="stg">
      <PageHero
        title={pf.title}
        lede={pf.lede}
        photo="/photos/performances/felice-voce-0309.jpg"
        alt={id ? 'Felice Voce di panggung Harmonia 2025' : 'Felice Voce on the Harmonia 2025 stage'}
      />

      <section className="stg-sec">
        <div className="container">
          <div className="stg-head">
            <h2>{pf.soloTitle}</h2>
          </div>
          <div className="lu-grid">
            {solos.map((p) => (
              <Performer key={p.id} p={p} id={id} />
            ))}
          </div>
        </div>
      </section>

      <section className="stg-sec stg-sec--flush">
        <div className="container">
          <div className="stg-head">
            <h2>{pf.ensembleTitle}</h2>
          </div>
          <div className="lu-grid lu-grid--wide">
            {ensembles.map((p) => (
              <Performer key={p.id} p={p} id={id} wide />
            ))}
          </div>
        </div>
      </section>

      {/* The repertoire, as a printed programme */}
      <section className="stg-sec">
        <div className="container">
          <div className="stg-head">
            <h2>{pf.programTitle}</h2>
          </div>
          <div className="table-wrap">
            <table className="lu-prog">
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
                    <td className="lu-prog__piece">{row.piece}</td>
                    <td>{row.composer || '·'}</td>
                    <td>{row.performedBy}</td>
                    <td>{row.arrangedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* The crew behind them */}
      <section className="stg-sec stg-sec--flush">
        <div className="container">
          <div className="lu-crew-intro">
            <Figure
              src="/photos/team.jpg"
              alt={id ? 'Panitia Harmonia berfoto bersama seusai acara' : 'The Harmonia committee photographed together after the event'}
              ratio="16 / 10"
              credit={`${t.home.photoCredit} ${photographer}`}
            />
            <div>
              <h2 className="stg-h2">{a.familyTitle}</h2>
              <div className="stg-body">
                <p>{a.familyBody}</p>
              </div>
              <p className="lu-crew-total">
                {teamCount} {id ? 'panitia, Harmonia 2025' : 'organisers, Harmonia 2025'}
              </p>
            </div>
          </div>

          <div className="lu-divisions">
            {DIVISION_ORDER.map((div) => {
              const members = team.filter((m) => m.division === div)
              if (!members.length) return null
              return (
                <div key={div} className="lu-division">
                  <h3>
                    {a.familyDivisions[div]} <span>{members.length}</span>
                  </h3>
                  <ul>
                    {members.map((m) => (
                      <li key={m.id}>
                        <span className="lu-division__name">{m.name}</span>
                        <span className="lu-division__role">{id ? m.roleId : m.roleEn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
