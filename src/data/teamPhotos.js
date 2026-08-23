// Resolves team portraits at build time.
//
// Vite's dev server answers unknown paths with index.html (HTTP 200), and
// SPA hosts usually do the same, so an <img> pointing at a missing file
// never reliably fires onError. Globbing the assets folder instead means a
// portrait only renders when the file genuinely exists.
//
// To add one: drop `<member-id>.jpg` into src/assets/team/, the id is the
// `id` field in team.js. Nothing else to wire up.

const files = import.meta.glob('../assets/team/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const teamPhotos = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path.split('/').pop().replace(/\.(jpg|jpeg|png|webp)$/i, ''),
    url,
  ]),
)

export const getTeamPhoto = (id) => teamPhotos[id] ?? null
