import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { orgInfo } from '../data/org.js'
import PageHero from '../components/PageHero.jsx'
import './Contact.css'

const initialForm = { name: '', email: '', topic: '', message: '' }

export default function Contact() {
  const { lang, t } = useLanguage()
  const c = t.contact
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle') // idle | sent

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // NOTE: not wired to a real email service yet, see PRD.md §6/§11.
    // Swap this for a POST to Formspree/Resend once the team picks one;
    // for now this only confirms the form works end-to-end locally.
    setStatus('sent')
  }

  return (
    <>
      <PageHero kicker={c.kicker} title={c.title} lede={c.lede} />

      <section className="section contact-section">
        <div className="container contact-grid">
          <form className="contact-form card" onSubmit={handleSubmit}>
            {status === 'sent' ? (
              <div className="contact-form__sent">
                <p>{lang === 'id' ? 'Terima kasih! Pesan tersimpan secara lokal di demo ini.' : 'Thanks! Your message is captured locally in this demo.'}</p>
                <p className="contact-form__sent-note">
                  {lang === 'id'
                    ? `Untuk sekarang, hubungi langsung ke ${orgInfo.contactEmail} atau Instagram kami.`
                    : `For now, reach us directly at ${orgInfo.contactEmail} or on Instagram.`}
                </p>
              </div>
            ) : (
              <>
                <label>
                  <span>{c.formName}</span>
                  <input type="text" required value={form.name} onChange={update('name')} />
                </label>
                <label>
                  <span>{c.formEmail}</span>
                  <input type="email" required value={form.email} onChange={update('email')} />
                </label>
                <label>
                  <span>{c.formTopic}</span>
                  <select required value={form.topic} onChange={update('topic')}>
                    <option value="" disabled>
                      {lang === 'id' ? 'Pilih topik' : 'Select a topic'}
                    </option>
                    {c.formTopicOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{c.formMessage}</span>
                  <textarea rows={5} required value={form.message} onChange={update('message')} />
                </label>
                <button type="submit" className="btn btn-primary btn-lg">
                  {c.formSubmit}
                </button>
                <p className="contact-form__note">{c.formNote}</p>
              </>
            )}
          </form>

          <aside className="contact-aside card">
            <div>
              <p className="eyebrow">Email</p>
              <a href={`mailto:${orgInfo.contactEmail}`}>{orgInfo.contactEmail}</a>
            </div>
            <div>
              <p className="eyebrow">Instagram</p>
              <a href={orgInfo.instagram} target="_blank" rel="noreferrer">
                {orgInfo.instagramHandle}
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">{c.faqEyebrow}</p>
            <h2>{c.faqTitle}</h2>
          </div>
          <div className="faq-list">
            {c.faq.map((item) => (
              <details key={item.q} className="faq-item card">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
