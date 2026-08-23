// The real Harmonia 2025 lineup, from the team's event reference document
// (compiled from @harmoniafest.id, Aug 2026).
//
// Portraits: drop `<id>.jpg` into src/assets/performers/, members without
// a file render a monogram tile (same pattern as the committee).

// `order` drives how the roster reads on the lineup page.
export const performers = [
  {
    id: 'adi-utarini',
    order: 3,
    name: 'Prof. dr. Adi Utarini, M.Sc, MPH, Ph.D',
    roleId: 'Pianis (empat tangan)',
    roleEn: 'Pianist (four hands)',
    kind: 'solo',
    instagram: 'adiutarinimusik',
    noteId: 'Tampil dalam formasi piano empat tangan bersama dr. Muhammad Khidir.',
    noteEn: 'Performed piano four hands together with dr. Muhammad Khidir.',
  },
  {
    id: 'muhammad-khidir',
    instagram: 'khidirmalik',
    order: 4,
    name: 'dr. Muhammad Khidir',
    roleId: 'Pianis (empat tangan)',
    roleEn: 'Pianist (four hands)',
    kind: 'solo',
    noteId: 'Tampil dalam formasi piano empat tangan bersama Prof. dr. Adi Utarini.',
    noteEn: 'Performed piano four hands together with Prof. dr. Adi Utarini.',
  },
  {
    id: 'gregorius-wikan-herdwiyogatama',
    order: 5,
    name: 'Gregorius Wikan Herdwiyogatama',
    roleId: 'Pemain Saksofon',
    roleEn: 'Saxophonist',
    kind: 'solo',
    instagram: 'greggg._',
  },
  {
    id: 'jodi-visnu',
    order: 2,
    name: 'Dr. dr. Jodi Visnu, MPH.',
    roleId: 'Vokalis',
    roleEn: 'Vocalist',
    kind: 'solo',
    instagram: 'jodivisnu',
    noteId: 'Turut tampil bersama Harmonia dalam aksi donasi "Pohon Harapan" di GKI Coyudan, Solo (Desember 2025).',
    noteEn: 'Also performed with Harmonia at the "Pohon Harapan" donation drive, GKI Coyudan, Solo (December 2025).',
  },
  {
    id: 'jorge-amadeo-benavides',
    order: 1,
    name: 'Jorge Amadeo Benavides',
    roleId: 'Pianis',
    roleEn: 'Pianist',
    kind: 'solo',
    instagram: 'jorge_amadeo_',
  },
  {
    id: 'felice-voce',
    order: 6,
    name: 'Felice Voce',
    roleId: 'Ansambel Vokal',
    roleEn: 'Vocal Ensemble',
    kind: 'ensemble',
    noteId: 'Grup vokal enam anggota.',
    noteEn: 'A six-member vocal group.',
    members: [
      { name: 'Ike Kusumawati', instagram: 'kusumawati9200' },
      { name: 'Margarisje Lucij Elisabeth Makikui', instagram: 'sayangungu' },
      { name: 'Langgeng Sumujut', instagram: 'sumujut' },
      { name: 'Gina Simon', instagram: 'ginasimondamanik' },
      { name: 'Diani Rinarti Sitompul', instagram: 'diani_sitompul' },
      { name: 'Putra Andino Nugrahhu', instagram: 'nugrahhu' },
    ],
  },
  {
    id: 'psm-ugm',
    instagram: 'psm.ugm',
    order: 7,
    name: 'PSM UGM',
    roleId: 'Paduan Suara Mahasiswa UGM',
    roleEn: 'UGM Student Choir',
    kind: 'ensemble',
    noteId: 'Membawakan repertoar nusantara, tampil dalam busana tradisional Jawa.',
    noteEn: 'Performing Indonesian nusantara repertoire, appearing in Javanese traditional dress.',
  },
  {
    id: 'syncro5',
    instagram: 'syncro5_',
    order: 8,
    name: 'Syncro5',
    roleId: 'Band Pop-Jazz SMA',
    roleEn: 'High School Pop-Jazz Band',
    kind: 'ensemble',
    noteId: 'Band pop-jazz tingkat SMA, membawakan aransemen medley lagu rakyat Indonesia.',
    noteEn: 'A high school pop-jazz band, performing Indonesian folk medley arrangements.',
    members: [
      { name: 'Josefhine Azalea Narwastu Furw', instagram: 'josefhineazaleaa' },
      { name: 'Jorge Amadeo Benavides', instagram: 'jorge_amadeo_' },
      { name: 'Jerico Joshua Kurniadi', instagram: 'jerico_jjkk' },
      { name: 'Joseph Abednego Erroldinho Setiabudi', instagram: 'jaerroldinho25s' },
      { name: 'Moses Christian Priyanto', instagram: 'mo23schrist' },
    ],
  },
]

// The seven performances of the night, in the order they took the stage.
export const performances = [
  { key: 'adi-utarini', titleId: 'Prof. Adi Utarini x dr. Khidir', titleEn: 'Prof. Adi Utarini x dr. Khidir', roleId: 'Piano Empat Tangan', roleEn: 'Piano Four Hands' },
  { key: 'jodi-jorge', titleId: 'Dr. Jodi Visnu x Jorge Amadeo', titleEn: 'Dr. Jodi Visnu x Jorge Amadeo', roleId: 'Vokal & Piano', roleEn: 'Vocals & Piano' },
  { key: 'jorge', titleId: 'Jorge Amadeo Benavides', titleEn: 'Jorge Amadeo Benavides', roleId: 'Piano Solo', roleEn: 'Solo Piano' },
  { key: 'wikan-jorge', titleId: 'Gregorius Wikan x Jorge Amadeo', titleEn: 'Gregorius Wikan x Jorge Amadeo', roleId: 'Saksofon & Piano', roleEn: 'Saxophone & Piano' },
  { key: 'felice-voce', titleId: 'Felice Voce', titleEn: 'Felice Voce', roleId: 'Ansambel Vokal', roleEn: 'Vocal Ensemble' },
  { key: 'psm-ugm', titleId: 'PSM UGM x Jorge Amadeo', titleEn: 'PSM UGM x Jorge Amadeo', roleId: 'Paduan Suara', roleEn: 'Student Choir' },
  { key: 'syncro5', titleId: 'SYNCRO5', titleEn: 'SYNCRO5', roleId: 'Band Pop-Jazz SMA', roleEn: 'High School Pop-Jazz Band' },
]

// The full repertoire, from the printed guide book, in running order.
export const program = [
  {
    piece: 'Rayuan Pulau Kelapa',
    composer: 'Ismail Marzuki',
    performedBy: 'Prof. Adi Utarini & dr. Khidir',
    arrangedBy: 'George Harliono, re-arranged by Ardiansyah Pratama Putra',
  },
  {
    piece: 'Indonesia Pusaka',
    composer: 'Ismail Marzuki',
    performedBy: 'dr. Jodi Visnu & Jorge Amadeo',
    arrangedBy: 'Aditya Ong & Jorge Amadeo',
  },
  {
    piece: 'Tanah Airku',
    composer: 'Ibu Sud',
    performedBy: 'dr. Jodi Visnu & Jorge Amadeo',
    arrangedBy: 'Jorge Amadeo',
  },
  {
    piece: 'Rapsodia Nusantara No. 19',
    composer: 'Ananda Sukarlan',
    performedBy: 'Jorge Amadeo',
    arrangedBy: 'Ananda Sukarlan',
  },
  {
    piece: 'Bengawan Solo',
    composer: 'Gesang',
    performedBy: 'Jorge Amadeo & Gregorius Wikan',
    arrangedBy: 'Jorge Amadeo & Gregorius Wikan',
  },
  {
    piece: 'Bumiku Indonesia',
    composer: 'Lilik Sugiarto',
    performedBy: 'Felice Voce',
    arrangedBy: 'Lilik Sugiarto',
  },
  {
    piece: 'Kupinta Lagi',
    composer: 'Cornel Simanjuntak',
    performedBy: 'Felice Voce',
    arrangedBy: 'Binsar Sitompul',
  },
  {
    piece: 'Melodi Nusantara',
    composer: 'Rois Munandar',
    performedBy: 'PSM UGM',
    arrangedBy: 'Rois Munandar',
  },
  {
    piece: 'Medley Nusantara (Mbiring Manggis, Mande Mande, Cik Cik Periuk)',
    composer: 'PSM UGM',
    performedBy: 'PSM UGM & Jorge Amadeo',
    arrangedBy: 'M. Ginting',
  },
  {
    piece: 'Yamko Rambe Yamko',
    composer: '',
    performedBy: 'Syncro5',
    arrangedBy: 'Syncro5',
  },
  {
    piece: 'Gemu Fa Mi Re',
    composer: 'Nyong Franco',
    performedBy: 'Syncro5',
    arrangedBy: 'Syncro5',
  },
]
