import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import PageHero from '../components/PageHero.jsx'

export default function NotFound() {
  const { lang, t } = useLanguage()

  return (
    <PageHero
      kicker="404"
      title={lang === 'id' ? 'Halaman tidak ditemukan' : 'Page not found'}
      lede={
        lang === 'id'
          ? 'Halaman yang kamu cari tidak ada atau telah dipindahkan.'
          : 'The page you’re looking for doesn’t exist or has moved.'
      }
    >
      <Link className="btn btn-primary btn-lg" to="/">
        {t.common.nav.home}
      </Link>
    </PageHero>
  )
}
