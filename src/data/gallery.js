// Official event photography by @fusiapicture, organised the way the team
// filed it: one set per performance, in running order, then everything
// off-stage. Photo files live in public/photos/performances/ (per
// performance) and public/photos/gallery/ (the room, behind the scenes).

export const photographer = '@fusiapicture'

const perf = (set, ids) => ids.map((n) => `/photos/performances/${set}-${n}.jpg`)
const room = (ids) => ids.map((n) => `/photos/gallery/${n}.jpg`)

export const gallerySets = [
  {
    key: 'adi-utarini',
    title: 'Prof. dr. Adi Utarini, M.Sc, MPH, Ph.D & dr. Muhammad Khidir',
    roleId: 'Piano Empat Tangan',
    roleEn: 'Piano Four Hands',
    photos: perf('adi-utarini', ['0152', '0153', '0155', '0156', '0160', '0161']),
  },
  {
    key: 'jodi-jorge',
    title: 'Dr. dr. Jodi Visnu, MPH. & Jorge Amadeo Benavides',
    roleId: 'Vokal & Piano',
    roleEn: 'Vocals & Piano',
    photos: perf('jodi-jorge', ['0165', '0180', '0190', '0201', '0220', '0234']),
  },
  {
    key: 'jorge',
    title: 'Jorge Amadeo Benavides',
    roleId: 'Piano Solo',
    roleEn: 'Solo Piano',
    photos: perf('jorge', ['0244', '0247', '0249', '0250', '0257', '0268']),
  },
  {
    key: 'wikan-jorge',
    title: 'Gregorius Wikan Herdwiyogatama x Jorge Amadeo Benavides',
    roleId: 'Saksofon & Piano',
    roleEn: 'Saxophone & Piano',
    photos: perf('wikan-jorge', ['0275', '0278', '0282', '0285', '0288', '0291']),
  },
  {
    key: 'felice-voce',
    title: 'Felice Voce',
    roleId: 'Ansambel Vokal',
    roleEn: 'Vocal Ensemble',
    photos: perf('felice-voce', ['0295', '0302', '0309', '0315', '0322', '0330']),
  },
  {
    key: 'psm-ugm',
    title: 'Paduan Suara Mahasiswa UGM',
    roleId: 'Paduan Suara',
    roleEn: 'Student Choir',
    photos: perf('psm-ugm', ['0385', '0387', '0390', '0395', '0398', '0401']),
  },
  {
    key: 'syncro5',
    title: 'SYNCRO5',
    roleId: 'Band Pop-Jazz SMA',
    roleEn: 'High School Pop-Jazz Band',
    photos: perf('syncro5', ['0403', '0409', '0411', '0417', '0432', '0440']),
  },
  {
    key: 'room',
    title: 'Penonton & Di Balik Layar',
    titleEn: 'The Room & Behind the Scenes',
    roleId: 'Di Luar Panggung',
    roleEn: 'Off Stage',
    photos: room(['0568', '0443', '0479', '0134', '0085', '0353', '0548', '0041', '0005', '0100', '0661']),
  },
]

export const galleryCount = gallerySets.reduce((n, s) => n + s.photos.length, 0)
