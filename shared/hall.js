// Where each section sits in the hall, worked out from its name, so the
// panel can rename or add sections without touching a layout table.
//
// The layout follows the 2025 seating poster as far as the section names
// tell it: louder dynamics sit nearer the stage, Left and Right are as seen
// from the seats, facing the stage. It is an approximation until the real
// hall plan arrives; change TIERS below when it does.

// Front to back. `test` matches the section name.
export const TIERS = [
  { key: 'vip', test: /\bvip\b/i },
  { key: 'ff', test: /fortissimo/i },
  { key: 'f', test: /\bforte\b/i },
  { key: 'mp', test: /mezzo/i },
  { key: 'pp1', test: /pianissimo/i, not: /(atas|lt\.?\s*2|upper|balkon|balcony)/i },
  { key: 'pp2', test: /pianissimo|balkon|balcony/i },
]

export function sideOf(name) {
  if (/\b(left|kiri)\b/i.test(name)) return 'left'
  if (/\b(right|kanan)\b/i.test(name)) return 'right'
  return 'center'
}

export function tierOf(name) {
  const tier = TIERS.find((t) => t.test.test(name) && !(t.not && t.not.test(name)))
  return tier ? tier.key : null
}

// Groups sections into tiers, each tier split into left, center, right.
// Sections whose name matches no tier come back in `other`.
export function hallLayout(sections) {
  const tiers = TIERS.map((t) => ({ key: t.key, left: [], center: [], right: [] }))
  const other = []
  for (const s of sections) {
    const key = tierOf(s.name)
    const tier = tiers.find((t) => t.key === key)
    if (tier) tier[sideOf(s.name)].push(s)
    else other.push(s)
  }
  return { tiers: tiers.filter((t) => t.left.length + t.center.length + t.right.length > 0), other }
}
