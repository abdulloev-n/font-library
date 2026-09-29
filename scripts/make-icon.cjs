const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const width = 256;
const rgba = Buffer.alloc(width * width * 4);
const blue = [37, 99, 235, 255];
const white = [255, 255, 255, 255];
function paint(x, y, color) { const i = (y * width + x) * 4; for (let n = 0; n < 4; n++) rgba[i + n] = color[n]; }
for (let y = 0; y < width; y++) for (let x = 0; x < width; x++) {
  const cx = x < 27 ? 27 : x > 228 ? 228 : x;
  const cy = y < 27 ? 27 : y > 228 ? 228 : y;
  if ((x - cx) ** 2 + (y - cy) ** 2 < 27 ** 2) paint(x, y, blue);
  if ((x >= 67 && x <= 91 && y >= 59 && y <= 196) || (x >= 67 && x <= 184 && y >= 59 && y <= 82) || (x >= 67 && x <= 166 && y >= 113 && y <= 137)) paint(x, y, white);
}
function crc(buf) { let c = 0xffffffff; for (const b of buf) { c ^= b; for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const name = Buffer.from(type); const out = Buffer.alloc(data.length + 12); out.writeUInt32BE(data.length, 0); name.copy(out, 4); data.copy(out, 8); out.writeUInt32BE(crc(Buffer.concat([name, data])), data.length + 8); return out; }
const rows = Buffer.alloc(width * (width * 4 + 1));
for (let y = 0; y < width; y++) rgba.copy(rows, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(width, 4); ihdr[8] = 8; ihdr[9] = 6;
const png = Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
const ico = Buffer.alloc(22); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4); ico[10] = 1; ico.writeUInt16LE(32, 12); ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);
const out = path.join(__dirname, '..', 'build', 'icon.ico'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, Buffer.concat([ico, png]));
