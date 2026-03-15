#!/usr/bin/env node
// Генерирует минимальные валидные PNG иконки без внешних зависимостей
// Использует только встроенный zlib

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const outDir = path.join(__dirname, '../public/icons');

function createPNG(size, color1 = [102, 126, 234], color2 = [118, 75, 162]) {
  const width = size;
  const height = size;

  // Создаём пиксели с градиентом
  const pixels = [];
  for (let y = 0; y < height; y++) {
    const row = [0]; // filter byte
    for (let x = 0; x < width; x++) {
      const t = (x + y) / (width + height);
      const r = Math.round(color1[0] + (color2[0] - color1[0]) * t);
      const g = Math.round(color1[1] + (color2[1] - color1[1]) * t);
      const b = Math.round(color1[2] + (color2[2] - color1[2]) * t);
      const a = 255;
      row.push(r, g, b, a);
    }
    pixels.push(...row);
  }

  const rawData = Buffer.from(pixels);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // PNG chunks
  function crc32(buf) {
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcData = Buffer.concat([typeBytes, data]);
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcData));
    return Buffer.concat([len, typeBytes, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const png = createPNG(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`✓ icon-${size}.png (${png.length} bytes)`);
});

console.log('\nВсе иконки созданы!');
