// Real facts sourced from @harmoniafest.id (Instagram), the Artatix event
// listing (artatix.co.id/event/harmonia), and figures supplied directly by
// the Harmonia team. Nothing here is estimated.

export const editions = [
  {
    slug: 'harmonia-2025',
    name: 'Harmonia: Harmoni Indonesia',
    status: 'past', // 'upcoming' | 'past'
    date: '2025-08-29',
    dateDisplay: '29 Agustus 2025',
    dateDisplayEn: '29 August 2025',
    time: '17.30-21.00 WIB',
    venue: 'Performance Hall, FBSB UNY',
    venueFullId:
      'Gedung Performance Hall, Fakultas Bahasa, Seni, dan Budaya, Universitas Negeri Yogyakarta',
    venueFullEn:
      'Performance Hall, Faculty of Languages, Arts & Culture, Universitas Negeri Yogyakarta',
    venueAddress:
      'Karang Malang, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta, Indonesia',
    mapQuery: 'FBSB UNY Performance Hall, Karang Malang, Caturtunggal, Depok, Sleman',
    collaborator: '@desaanaksos',
    ticketUrl: 'https://artatix.co.id/event/harmonia',
    startingPrice: 'Rp115.000',
    earlyBirdId: 'Tiket Early Bird untuk 34 pembeli pertama dibuka 26 Juli 2025, pukul 12.00 WIB.',
    earlyBirdEn: 'Early Bird tickets for the first 34 buyers opened 26 July 2025 at 12:00 PM.',
    ticketsSold: 201,
    heroImage: '/photos/edition-band.jpg',
  },
]

// The next edition is announced but not yet dated. When it is, add an entry
// above with status: 'upcoming', the homepage hero, header CTA, and every
// ticket button switch over automatically. No layout work required.
export const nextEdition = {
  announced: true,
  dated: false,
}

export const activeEdition = editions.find((e) => e.status === 'upcoming') ?? editions[0]
export const latestPastEdition = [...editions].reverse().find((e) => e.status === 'past')
