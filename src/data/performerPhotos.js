// Build-time performer portrait resolution, same pattern as teamPhotos.js.
const files = import.meta.glob('../assets/performers/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const performerPhotos = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path.split('/').pop().replace(/\.(jpg|jpeg|png|webp)$/i, ''),
    url,
  ]),
)

export const getPerformerPhoto = (id) => performerPhotos[id] ?? null
