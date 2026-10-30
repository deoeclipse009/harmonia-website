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
  const [errors, setErrors] = useState({})

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      // Clear a field's error as soon as the visitor starts correcting it.
      setErrors((prev) => {
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Messages say how to fix the field, not just that it is wrong, and are
  // carried in text beside the input rather than by colour alone.
  function validate(values) {
    const id = lang === 'id'
    const found = {}
    if (!values.name.trim()) {
      found.name = id ? 'Tulis nama kamu.' : 'Enter your name.'
    }
    if (!values.email.trim()) {
      found.email = id ? 'Tulis alamat email kamu.' : 'Enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      found.email = id
        ? 'Alamat email ini belum lengkap, contoh: nama@email.com'
        : 'That address looks incomplete, for example: name@email.com'
    }
    if (!values.topic) {
      found.topic = id ? 'Pilih satu topik.' : 'Choose a topic.'
    }
    if (!values.message.trim()) {
      found.message = id ? 'Tulis pesan kamu.' : 'Write your message.'
    }
    return found
  }

  function handleSubmit(e) {
    e.preventDefault()

    const found = validate(form)
    setErrors(found)

    const firstBad = ['name', 'email', 'topic', 'message'].find((f) => found[f])
    if (firstBad) {
      // Move focus to the first thing that needs fixing. What was typed stays.
      document.getElementById(`contact-${firstBad}`)?.focus()
      return
    }

    // NOTE: not wired to a real email service yet, see PRD.md §6/§11.
    // Swap this for a POST to Formspree/Resend once the team picks one.
    setStatus('sent')
  }

  return (
    <>
      <PageHero kicker={c.kicker} title={c.title} lede={c.lede} />

      <section className="section contact-section">
        <div className="container contact-grid">
          <form className="contact-form card" noValidate onSubmit={handleSubmit}>
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
                <label htmlFor="contact-name">
                  <span>{c.formName}</span>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={update('name')}
                    aria-invalid={errors.name ? 'true' : undefined}
                    aria-describedby={errors.name ? 'err-name' : undefined}
                  />
                  {errors.name && (
                    <span className="field-error" id="err-name">
                      {errors.name}
                    </span>
                  )}
                </label>
                <label htmlFor="contact-email">
                  <span>{c.formEmail}</span>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    aria-invalid={errors.email ? 'true' : undefined}
                    aria-describedby={errors.email ? 'err-email' : undefined}
                  />
                  {errors.email && (
                    <span className="field-error" id="err-email">
                      {errors.email}
                    </span>
                  )}
                </label>
                <label htmlFor="contact-topic">
                  <span>{c.formTopic}</span>
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={update('topic')}
                    aria-invalid={errors.topic ? 'true' : undefined}
                    aria-describedby={errors.topic ? 'err-topic' : undefined}
                  >
                    <option value="" disabled>
                      {lang === 'id' ? 'Pilih topik' : 'Select a topic'}
                    </option>
                    {c.formTopicOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.topic && (
                    <span className="field-error" id="err-topic">
                      {errors.topic}
                    </span>
                  )}
                </label>
                <label htmlFor="contact-message">
                  <span>{c.formMessage}</span>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={form.message}
                    onChange={update('message')}
                    aria-invalid={errors.message ? 'true' : undefined}
                    aria-describedby={errors.message ? 'err-message' : undefined}
                  />
                  {errors.message && (
                    <span className="field-error" id="err-message">
                      {errors.message}
                    </span>
                  )}
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
              <details key={item.q} name="harmonia-faq" className="faq-item card">
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
