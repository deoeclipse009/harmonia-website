// DRAFT ticketing setup for Harmonia 2027. Nothing here is final: the seat
// plan is a stand-in until the real hall plan is drawn, and the prices are
// working numbers for testing the flow. Replace `rows` and `tiers` and the
// rest of the system follows.
export const ticketing = {
  eventName: 'Harmonia 2027',
  draft: true,
  // Typical hold length in established ticketing systems is 5 to 10 minutes.
  holdMinutes: 8,
  maxSeatsPerOrder: 6,
  tiers: [
    { id: 'front', nameId: 'Depan', nameEn: 'Front', price: 150000 },
    { id: 'middle', nameId: 'Tengah', nameEn: 'Middle', price: 115000 },
    { id: 'back', nameId: 'Belakang', nameEn: 'Back', price: 85000 },
  ],
  // Front to back. `left` and `right` are seat counts either side of the
  // centre aisle. Row I is skipped, as venues usually do, because it reads
  // as the number 1.
  rows: [
    { label: 'A', tier: 'front', left: 10, right: 10 },
    { label: 'B', tier: 'front', left: 10, right: 10 },
    { label: 'C', tier: 'front', left: 10, right: 10 },
    { label: 'D', tier: 'middle', left: 10, right: 10 },
    { label: 'E', tier: 'middle', left: 10, right: 10 },
    { label: 'F', tier: 'middle', left: 10, right: 10 },
    { label: 'G', tier: 'middle', left: 10, right: 10 },
    { label: 'H', tier: 'middle', left: 10, right: 10 },
    { label: 'J', tier: 'back', left: 10, right: 10 },
    { label: 'K', tier: 'back', left: 10, right: 10 },
    { label: 'L', tier: 'back', left: 10, right: 10 },
  ],
}
