/**
 * 生成番茄钟商用切图 — 蓝天星球儿童向风格
 * 运行：node scripts/gen-pomodoro-assets.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../assets/pomodoro');

const COLORS = {
  sky: '#DDF4FF',
  blue: '#31A8FF',
  blueDark: '#1479D6',
  blueSoft: '#C8EAFF',
  mint: '#43CFC7',
  gold: '#FFD166',
  orange: '#FF9F43',
  orangeDeep: '#FF7A18',
  text: '#173A62',
  white: '#FFFFFF',
};

async function savePng(name, svg, width, height) {
  const path = join(OUT, name);
  await sharp(Buffer.from(svg)).resize(width, height).png().toFile(path);
  console.log('✓', name);
}

function ringSvg(size = 640) {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.48;
  const inner = size * 0.36;
  const ticks = [];
  const labels = [];
  const minutes = [];
  for (let i = 0; i < 18; i += 1) {
    const min = 5 + i * 5;
    const angle = (i * 20 - 90) * (Math.PI / 180);
    const major = min % 15 === 0;
    const tickLen = major ? 22 : 12;
    const x1 = cx + Math.cos(angle) * (outer - 4);
    const y1 = cy + Math.sin(angle) * (outer - 4);
    const x2 = cx + Math.cos(angle) * (outer - tickLen);
    const y2 = cy + Math.sin(angle) * (outer - tickLen);
    ticks.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${major ? COLORS.blueDark : COLORS.blue}" stroke-width="${major ? 5 : 3}" stroke-linecap="round"/>`);
    if (major) {
      const lx = cx + Math.cos(angle) * (outer - 42);
      const ly = cy + Math.sin(angle) * (outer - 42);
      labels.push(`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="26" font-weight="800" fill="${COLORS.text}" font-family="Arial, sans-serif">${min}</text>`);
    }
    minutes.push(min);
  }

  const dots = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 90) * (Math.PI / 180);
    const dx = cx + Math.cos(a) * (outer - 68);
    const dy = cy + Math.sin(a) * (outer - 68);
    return `<circle cx="${dx}" cy="${dy}" r="4" fill="${COLORS.blueSoft}"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="55%" stop-color="#F3FAFF"/>
      <stop offset="100%" stop-color="#E4F5FF"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#31A8FF" flood-opacity="0.18"/>
    </filter>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${outer + 8}" fill="url(#ringGrad)" filter="url(#softShadow)"/>
  <circle cx="${cx}" cy="${cy}" r="${outer}" fill="none" stroke="${COLORS.blueSoft}" stroke-width="14"/>
  <circle cx="${cx}" cy="${cy}" r="${outer - 7}" fill="none" stroke="${COLORS.white}" stroke-width="4" opacity="0.9"/>
  ${ticks.join('\n')}
  ${dots}
  ${labels.join('\n')}
  <circle cx="${cx}" cy="${cy}" r="${inner}" fill="none"/>
</svg>`;
}

function faceSvg(size = 420) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="faceGrad" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#F7FCFF"/>
      <stop offset="100%" stop-color="#EAF6FF"/>
    </radialGradient>
    <filter id="faceShadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#31A8FF" flood-opacity="0.12"/>
    </filter>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#FFFFFF" opacity="0.55"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#faceGrad)" stroke="${COLORS.blueSoft}" stroke-width="6" filter="url(#faceShadow)"/>
  <circle cx="${cx - 36}" cy="${cy - 40}" r="28" fill="#FFFFFF" opacity="0.55"/>
  <circle cx="${cx + 48}" cy="${cy + 52}" r="18" fill="${COLORS.gold}" opacity="0.12"/>
  <circle cx="${cx}" cy="${cy + r - 18}" r="5" fill="${COLORS.mint}" opacity="0.35"/>
  <circle cx="${cx - 52}" cy="${cy + 30}" r="4" fill="${COLORS.blue}" opacity="0.2"/>
  <circle cx="${cx + 60}" cy="${cy - 20}" r="4" fill="${COLORS.orange}" opacity="0.25"/>
</svg>`;
}

function pointerSvg(w = 120, h = 160) {
  const cx = w / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="ptrGrad" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="45%" stop-color="${COLORS.gold}"/>
      <stop offset="100%" stop-color="#F4A623"/>
    </linearGradient>
    <filter id="ptrShadow">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#F4A623" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M ${cx} ${h - 8} C ${cx - 34} ${h * 0.55} ${cx - 28} 24 ${cx} 8 C ${cx + 28} 24 ${cx + 34} ${h * 0.55} ${cx} ${h - 8} Z"
        fill="url(#ptrGrad)" stroke="#FFFFFF" stroke-width="4" filter="url(#ptrShadow)"/>
  <circle cx="${cx}" cy="34" r="16" fill="#FFFFFF" opacity="0.55"/>
  <text x="${cx}" y="40" text-anchor="middle" font-size="18" font-weight="900" fill="${COLORS.orangeDeep}">★</text>
</svg>`;
}

function knobSvg(size = 128) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="knobGrad" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#FFD98A"/>
      <stop offset="55%" stop-color="${COLORS.orange}"/>
      <stop offset="100%" stop-color="${COLORS.orangeDeep}"/>
    </radialGradient>
    <filter id="knobShadow">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#FF7A18" flood-opacity="0.35"/>
    </filter>
  </defs>
  <circle cx="${cx}" cy="${cy + 4}" r="${r + 4}" fill="#FF7A18" opacity="0.15"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#knobGrad)" stroke="#FFFFFF" stroke-width="5" filter="url(#knobShadow)"/>
  <circle cx="${cx - 14}" cy="${cy - 16}" r="10" fill="#FFFFFF" opacity="0.45"/>
  <circle cx="${cx - 18}" cy="${cy - 6}" r="5" fill="#FFFFFF" opacity="0.85"/>
  <circle cx="${cx + 16}" cy="${cy - 6}" r="5" fill="#FFFFFF" opacity="0.85"/>
  <path d="M ${cx - 16} ${cy + 14} Q ${cx} ${cy + 28} ${cx + 16} ${cy + 14}" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
  <circle cx="${cx}" cy="${cy - 28}" r="6" fill="${COLORS.gold}" stroke="#FFFFFF" stroke-width="2"/>
</svg>`;
}

function mascotSvg(size = 512) {
  const cx = size / 2;
  const cy = size / 2 + 20;
  const r = size * 0.28;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="tomGrad" cx="38%" cy="32%" r="72%">
      <stop offset="0%" stop-color="#FF8A80"/>
      <stop offset="55%" stop-color="#FF5252"/>
      <stop offset="100%" stop-color="#E53935"/>
    </radialGradient>
    <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#66BB6A"/>
      <stop offset="100%" stop-color="#43A047"/>
    </linearGradient>
    <filter id="mascotShadow">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#E53935" flood-opacity="0.25"/>
    </filter>
  </defs>
  <ellipse cx="${cx}" cy="${cy + r + 18}" rx="${r * 0.9}" ry="16" fill="#E53935" opacity="0.12"/>
  <path d="M ${cx - 28} ${cy - r - 8} C ${cx - 10} ${cy - r - 52} ${cx + 10} ${cy - r - 52} ${cx + 28} ${cy - r - 8}"
        fill="none" stroke="#5D4037" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="${cx - 22}" cy="${cy - r - 18}" rx="34" ry="18" transform="rotate(-28 ${cx - 22} ${cy - r - 18})" fill="url(#leafGrad)"/>
  <ellipse cx="${cx + 22}" cy="${cy - r - 18}" rx="34" ry="18" transform="rotate(28 ${cx + 22} ${cy - r - 18})" fill="url(#leafGrad)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#tomGrad)" filter="url(#mascotShadow)"/>
  <ellipse cx="${cx - 38}" cy="${cy - 20}" rx="22" ry="14" fill="#FFFFFF" opacity="0.22"/>
  <ellipse cx="${cx - 44}" cy="${cy - 8}" rx="18" ry="22" fill="#FFFFFF"/>
  <ellipse cx="${cx + 44}" cy="${cy - 8}" rx="18" ry="22" fill="#FFFFFF"/>
  <circle cx="${cx - 38}" cy="${cy - 4}" r="9" fill="${COLORS.text}"/>
  <circle cx="${cx + 38}" cy="${cy - 4}" r="9" fill="${COLORS.text}"/>
  <circle cx="${cx - 35}" cy="${cy - 7}" r="3.5" fill="#FFFFFF"/>
  <circle cx="${cx + 41}" cy="${cy - 7}" r="3.5" fill="#FFFFFF"/>
  <ellipse cx="${cx}" cy="${cy + 28}" rx="16" ry="10" fill="#FFFFFF" opacity="0.85"/>
  <path d="M ${cx - 12} ${cy + 30} Q ${cx} ${cy + 42} ${cx + 12} ${cy + 30}" fill="none" stroke="#E53935" stroke-width="3" stroke-linecap="round"/>
  <circle cx="${cx - 58}" cy="${cy + 18}" r="10" fill="#FF8A80" opacity="0.45"/>
  <circle cx="${cx + 58}" cy="${cy + 18}" r="10" fill="#FF8A80" opacity="0.45"/>
</svg>`;
}

function iconMuteSvg(size = 128) {
  const cx = size / 2;
  const cy = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="28" fill="#EEF8FF"/>
  <path d="M ${cx - 8} ${cy - 18} L ${cx - 28} ${cy - 18} L ${cx - 28} ${cy + 18} L ${cx - 8} ${cy + 18} L ${cx + 18} ${cy + 32} L ${cx + 18} ${cy - 32} Z" fill="${COLORS.blueDark}"/>
  <path d="M ${cx + 30} ${cy - 22} L ${cx + 46} ${cy - 6} M ${cx + 46} ${cy - 22} L ${cx + 30} ${cy - 6}" stroke="#FF6B6B" stroke-width="6" stroke-linecap="round"/>
</svg>`;
}

function iconAlarmSvg(size = 320) {
  const cx = size / 2;
  const cy = size / 2 + 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bellGrad" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="100%" stop-color="${COLORS.gold}"/>
    </linearGradient>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="118" fill="#FFF8E1" opacity="0.8"/>
  <path d="M ${cx - 70} ${cy + 20} Q ${cx - 70} ${cy - 60} ${cx} ${cy - 70} Q ${cx + 70} ${cy - 60} ${cx + 70} ${cy + 20} Z" fill="url(#bellGrad)" stroke="#FFFFFF" stroke-width="6"/>
  <rect x="${cx - 18}" y="${cy - 86}" width="36" height="22" rx="10" fill="${COLORS.orange}"/>
  <circle cx="${cx}" cy="${cy + 34}" r="16" fill="${COLORS.orangeDeep}"/>
  <path d="M ${cx - 92} ${cy - 40} L ${cx - 118} ${cy - 68} M ${cx + 92} ${cy - 40} L ${cx + 118} ${cy - 68}" stroke="${COLORS.gold}" stroke-width="10" stroke-linecap="round"/>
  <text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="42" font-weight="900" fill="${COLORS.orangeDeep}">!</text>
</svg>`;
}

function iconTimerSvg(size = 128) {
  const cx = size / 2;
  const cy = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="28" fill="#EEF8FF"/>
  <circle cx="${cx}" cy="${cy + 6}" r="40" fill="none" stroke="${COLORS.blue}" stroke-width="8"/>
  <line x1="${cx}" y1="${cy + 6}" x2="${cx}" y2="${cy - 18}" stroke="${COLORS.blueDark}" stroke-width="6" stroke-linecap="round"/>
  <line x1="${cx}" y1="${cy + 6}" x2="${cx + 22}" y2="${cy + 16}" stroke="${COLORS.orange}" stroke-width="6" stroke-linecap="round"/>
  <rect x="${cx - 8}" y="${cy - 52}" width="16" height="12" rx="4" fill="${COLORS.blueDark}"/>
</svg>`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await savePng('compass-ring.png', ringSvg(640), 640, 640);
  await savePng('compass-face.png', faceSvg(420), 420, 420);
  await savePng('compass-pointer.png', pointerSvg(120, 160), 120, 160);
  await savePng('compass-knob.png', knobSvg(128), 128, 128);
  await savePng('mascot-tomato.png', mascotSvg(512), 512, 512);
  await savePng('icon-mute.png', iconMuteSvg(128), 128, 128);
  await savePng('icon-alarm.png', iconAlarmSvg(320), 320, 320);
  await savePng('icon-timer.png', iconTimerSvg(128), 128, 128);
  console.log('\n全部切图已输出到 assets/pomodoro/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
