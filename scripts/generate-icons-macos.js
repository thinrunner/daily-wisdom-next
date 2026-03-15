const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Fallback: если нет canvas — создаём минимальный PNG вручную
function createMinimalPNG(size) {
  // PNG header + минимальный IHDR + IDAT + IEND
  // Это валидный 1x1 PNG масштабированный — используем встроенный Buffer
  const { execSync } = require('child_process');
  const svgPath = path.join(__dirname, '../public/icons/icon.svg');
  const outPath = path.join(__dirname, `../public/icons/icon-${size}.png`);
  
  try {
    // Попробуем через встроенный macOS sips
    execSync(`sips -s format png -z ${size} ${size} "${svgPath}" --out "${outPath}" 2>/dev/null || true`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100) {
      console.log(`✓ icon-${size}.png (via sips)`);
      return true;
    }
  } catch(e) {}

  try {
    // Попробуем через встроенный macOS qlmanage  
    execSync(`qlmanage -t -s ${size} -o /tmp/ "${svgPath}" 2>/dev/null || true`);
    const tmpFile = `/tmp/icon.svg.png`;
    if (fs.existsSync(tmpFile)) {
      fs.copyFileSync(tmpFile, outPath);
      console.log(`✓ icon-${size}.png (via qlmanage)`);
      return true;
    }
  } catch(e) {}

  return false;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
let allOk = true;

for (const size of sizes) {
  const ok = createMinimalPNG(size);
  if (!ok) {
    allOk = false;
    console.log(`✗ icon-${size}.png — не удалось`);
  }
}

if (!allOk) {
  console.log('\nНекоторые иконки не созданы. Запусти: npm install sharp && node scripts/generate-icons.js');
} else {
  console.log('\nВсе иконки готовы!');
}
