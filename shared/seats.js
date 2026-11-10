// Seat naming shared by the server and the browser, so both always agree on
// what "C7" means. No I or O: read aloud at a door they sound like 1 and 0.
export const ROW_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

export function seatLabels(rows) {
  return rows.flatMap((count, r) =>
    Array.from({ length: count }, (_, i) => `${ROW_LETTERS[r]}${i + 1}`),
  )
}
