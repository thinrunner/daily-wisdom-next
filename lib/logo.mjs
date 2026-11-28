// Знак «Мудрости дня»: открывающая кавычка, в которой первая запятая — месяц, вторая — солнце.
// Ночь и день, вчера и сегодня; цитата, которая приходит с каждым новым днём.
const R = 64;
const glyph = (cx, cy, r = R) => {
  const p = (x, y) => `${(cx + x * r).toFixed(1)},${(cy + y * r).toFixed(1)}`;
  return `M${p(-1, 0)} C${p(-1, -1.3)} ${p(-0.2, -2.1)} ${p(0.95, -2.25)} C${p(0.3, -1.75)} ${p(0.1, -1.3)} ${p(0.35, -0.937)} A${r},${r} 0 1 1 ${p(-1, 0)}Z`;
};

export function mark({ moon = '#d9dcf7', sunFrom = '#ffd27a', sunTo = '#f59e2e', glow = true } = {}) {
  const [mx, sx, cy] = [174, 340, 298];
  return `
  <defs>
    <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${sunFrom}"/><stop offset="1" stop-color="${sunTo}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${sx}" cy="${cy}" r="170" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#f7b23b" stop-opacity="0.22"/><stop offset="1" stop-color="#f7b23b" stop-opacity="0"/>
    </radialGradient>
    <mask id="crescent">
      <rect width="512" height="512" fill="#fff"/>
      <circle cx="${mx + 20}" cy="${cy - 14}" r="${R * 0.74}" fill="#000"/>
    </mask>
  </defs>
  ${glow ? `<circle class="logo-glow" cx="${sx}" cy="${cy}" r="170" fill="url(#glow)"/>` : ''}
  <path class="logo-moon" d="${glyph(mx, cy)}" fill="${moon}" mask="url(#crescent)"/>
  <path class="logo-sun" d="${glyph(sx, cy)}" fill="url(#sun)"/>`;
}

const bg = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#22224a"/><stop offset="1" stop-color="#141830"/>
    </linearGradient>
  </defs>`;

// rounded — иконка «any» и фавикон; full — на всю площадь (apple-touch и maskable, знак в безопасной зоне)
export function icon({ rounded = true, scale = 1 } = {}) {
  const t = `translate(256 256) scale(${scale}) translate(-256 -256)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${bg}
  <rect width="512" height="512" rx="${rounded ? 116 : 0}" fill="url(#bg)"/>
  <g transform="${t}">${mark()}</g>
</svg>`;
}

// Знак без подложки — для сплэша поверх фона приложения.
export const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="76 96 360 320" aria-hidden="true">${mark()}</svg>`;
