// The e-ticket prints a QR code with one library and the door scanner reads
// it with another. This proves the two agree, without needing a camera.
import assert from 'node:assert/strict'
import QRCode from 'qrcode'
import jsQR from 'jsqr'

const code = 'ABCD2345WXYZ'
const qr = QRCode.create(code, { errorCorrectionLevel: 'M' })
const scale = 6
const margin = 4
const size = (qr.modules.size + margin * 2) * scale
const pixels = new Uint8ClampedArray(size * size * 4).fill(255)
for (let y = 0; y < qr.modules.size; y++) {
  for (let x = 0; x < qr.modules.size; x++) {
    if (!qr.modules.get(y, x)) continue
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < scale; dx++) {
        const i = (((y + margin) * scale + dy) * size + (x + margin) * scale + dx) * 4
        pixels[i] = pixels[i + 1] = pixels[i + 2] = 0
      }
    }
  }
}
assert.equal(jsQR(pixels, size, size)?.data, code)
console.log('qr round trip: printed code is readable by the scanner')
