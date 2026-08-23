// Partner roster and logos, verified against the team's event reference
// document (Aug 2026). Files live in public/logos/{sponsors,community,media}/.
//
// `url` is empty everywhere, no partner websites supplied yet; fill in to
// make logos clickable.

export const sponsors = [
  { id: 'sp-1', name: 'Bank Mandiri', logo: '/logos/sponsors/1.png', url: '' },
  { id: 'sp-2', name: 'Dagadu Djokdja', logo: '/logos/sponsors/2.png', url: '' },
  { id: 'sp-3', name: 'CG Production, Arte Divertente', logo: '/logos/sponsors/3.png', url: '' },
  { id: 'sp-4', name: 'Wiwied Kembar', logo: '/logos/sponsors/4.png', url: '' },
  { id: 'sp-5', name: '3ADIKA Art & Science Studio', logo: '/logos/sponsors/5.png', url: '' },
  { id: 'sp-6', name: 'IXO Transport', logo: '/logos/sponsors/6.png', url: '' },
  { id: 'sp-7', name: 'Porta by Ambarrukmo', logo: '/logos/sponsors/7.png', url: '' },
  { id: 'sp-8', name: 'Dolphin Blue Raincoat', logo: '/logos/sponsors/8.png', url: '' },
  { id: 'sp-9', name: 'Ignite Transport', logo: '/logos/sponsors/9.png', url: '' },
  { id: 'sp-10', name: 'Happy Bear Preschool Surakarta', logo: '/logos/sponsors/10.png', url: '' },
  { id: 'sp-11', name: 'Plento Music', logo: '/logos/sponsors/11.png', url: '' },
  { id: 'sp-12', name: 'Rumah Sakit Akademik UGM', logo: '/logos/sponsors/12.png', url: '' },
  { id: 'sp-13', name: 'Chapy, Wrapping, Florist, Party & Balloon', logo: '/logos/sponsors/13.png', url: '' },
  { id: 'sp-14', name: "Maryane's Group", logo: '/logos/sponsors/14.png', url: '' },
]

export const communityPartners = [
  { id: 'co-1', name: 'OIA, Office of International Affairs UGM', logo: '/logos/community/1.png', url: '' },
  { id: 'co-2', name: 'Jazz Kota Baru', logo: '/logos/community/2.png', url: '' },
  { id: 'co-3', name: 'Virtuoso Music Course', logo: '/logos/community/3.png', url: '' },
  { id: 'co-4', name: 'Sekolah Tumbuh', logo: '/logos/community/4.png', url: '' },
  { id: 'co-5', name: 'Hagios School of Life', logo: '/logos/community/5.png', url: '' },
  { id: 'co-6', name: 'SMA Regina Pacis Surakarta', logo: '/logos/community/6.png', url: '' },
]

export const mediaPartners = [
  { id: 'me-1', name: 'Area Jogja', logo: '/logos/media/1.png', url: '' },
  { id: 'me-2', name: 'RBTV', logo: '/logos/media/2.png', url: '' },
  { id: 'me-3', name: 'Info Konser Jogja', logo: '/logos/media/3.png', url: '' },
]

export const partnerGroups = [
  { key: 'sponsors', items: sponsors },
  { key: 'community', items: communityPartners },
  { key: 'media', items: mediaPartners },
]

export const partnerCount =
  sponsors.length + communityPartners.length + mediaPartners.length

export const impact = {
  beneficiary: 'SOS Children’s Villages Indonesia',
  relatedId:
    'Kolaborasi terkait: para penampil Harmonia turut mengisi pujian dalam ibadah penggalangan dana Yayasan Kanker Anak Indonesia (YKAI), Agustus 2025.',
  relatedEn:
    'Related collaboration: Harmonia performers also contributed music at a Yayasan Kanker Anak Indonesia (YKAI) worship & fundraising event, August 2025.',
}
