import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('basic-controls/android/basiccontrols/miniprogram/assets/images/pet');
const ink = '#173A62';
const blue = '#31A8FF';
const blue2 = '#6EC5FF';
const mint = '#43CFC7';
const mint2 = '#8BE3C5';
const yellow = '#FFD166';
const orange = '#FF9D59';
const cream = '#FFF8E8';
const purple = '#8E7BFF';
const pink = '#FF8EAE';

const defs = `
  <defs>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${blue2}"/><stop offset="1" stop-color="${blue}"/></linearGradient>
    <linearGradient id="mint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${mint2}"/><stop offset="1" stop-color="${mint}"/></linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF09A"/><stop offset="1" stop-color="${yellow}"/></linearGradient>
    <linearGradient id="orange" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFC487"/><stop offset="1" stop-color="${orange}"/></linearGradient>
    <linearGradient id="purple" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#B8ADFF"/><stop offset="1" stop-color="${purple}"/></linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="${ink}" flood-opacity=".12"/></filter>
  </defs>`;

function svg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${defs}<g filter="url(#soft)" stroke="${ink}" stroke-width="14" stroke-linejoin="round" stroke-linecap="round">${content}</g></svg>`;
}

const star = (cx, cy, r = 50, fill = 'url(#gold)') => {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r * .46 : r;
    points.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`);
  }
  return `<polygon points="${points.join(' ')}" fill="${fill}"/>`;
};

const assets = {
  accessories: {
    accessory_head_star_clip: svg(`${star(258, 230, 112)}<rect x="145" y="335" width="226" height="48" rx="24" fill="url(#blue)" transform="rotate(-8 258 359)"/>`),
    accessory_head_explorer_hat: svg(`<path d="M136 302c12-116 64-174 120-174s108 58 120 174z" fill="#E8C887"/><path d="M174 240h164" fill="none"/><rect x="80" y="292" width="352" height="76" rx="38" fill="#D8B66E"/><rect x="154" y="248" width="204" height="46" rx="23" fill="url(#mint)"/>${star(352, 272, 30)}`),
    accessory_head_headphones: svg(`<path d="M126 276v-42c0-82 58-142 130-142s130 60 130 142v42" fill="none" stroke-width="32"/><rect x="78" y="238" width="104" height="178" rx="48" fill="url(#purple)"/><rect x="330" y="238" width="104" height="178" rx="48" fill="url(#purple)"/><circle cx="130" cy="326" r="28" fill="url(#blue)"/><circle cx="382" cy="326" r="28" fill="url(#blue)"/>${star(256, 120, 27)}`),
    accessory_head_cloud_nightcap: svg(`<path d="M132 352c28-118 82-204 168-216 52-8 84 20 94 58 12 46-20 92-72 116-48 22-76 62-86 106z" fill="${cream}"/><path d="M128 344c72 34 156 34 228 0l22 50c-90 46-186 46-276 0z" fill="url(#blue)"/><path d="M324 172c10-34 52-46 76-20 28-10 58 12 56 42 26 18 16 62-18 66h-114c-42-4-46-68 0-88z" fill="#FFF"/>`),
    accessory_neck_mint_bow: svg(`<path d="M248 254c-64-84-148-86-164-26-16 62 66 112 164 70z" fill="url(#mint)"/><path d="M264 254c64-84 148-86 164-26 16 62-66 112-164 70z" fill="url(#mint)"/><circle cx="256" cy="282" r="52" fill="url(#gold)"/>`),
    accessory_neck_rainbow_scarf: svg(`<path d="M106 174c92 42 208 42 300 0l-10 146c-82 48-198 48-280 0z" fill="url(#blue)"/><path d="M116 226c84 40 196 40 280 0" fill="none" stroke="${yellow}" stroke-width="38"/><path d="M126 286c76 36 174 36 250 0" fill="none" stroke="${orange}" stroke-width="34"/><path d="M306 324l80 4-12 118-88-26z" fill="url(#blue)"/>`),
    accessory_neck_medal: svg(`<path d="M166 92l90 148 90-148 68 42-102 166H200L98 134z" fill="url(#blue)"/><circle cx="256" cy="332" r="116" fill="url(#gold)"/>${star(256, 332, 58, '#FFF8D2')}`),
    accessory_back_schoolbag: svg(`<rect x="108" y="154" width="296" height="270" rx="72" fill="url(#orange)"/><path d="M178 160c4-74 152-74 156 0" fill="none" stroke-width="28"/><rect x="150" y="282" width="212" height="100" rx="40" fill="url(#gold)"/><path d="M112 220H76v142h40M400 220h36v142h-40" fill="none" stroke-width="26"/>${star(256, 236, 38)}`),
    accessory_back_cloud_cape: svg(`<path d="M120 110c84 42 188 42 272 0l32 290c-104 70-232 70-336 0z" fill="url(#blue)"/><path d="M132 122c16-38 70-42 94-10 30-34 88-18 94 24 38-18 78 18 66 58H126c-30-18-24-58 6-72z" fill="#FFF"/><circle cx="256" cy="174" r="26" fill="url(#gold)"/>`),
    accessory_back_leaf_wings: svg(`<path d="M244 270C180 104 70 88 74 194c4 106 92 166 170 130z" fill="url(#mint)"/><path d="M268 270c64-166 174-182 170-76-4 106-92 166-170 130z" fill="url(#mint)"/><path d="M116 168c42 34 76 74 110 132M396 168c-42 34-76 74-110 132" fill="none" stroke="#278F79" stroke-width="14"/>`),
    accessory_hand_star_pen: svg(`<rect x="216" y="156" width="80" height="278" rx="40" fill="url(#blue)" transform="rotate(15 256 295)"/><path d="M204 410l30 76 56-60z" fill="url(#gold)"/>${star(294, 104, 72)}`),
    accessory_hand_flag: svg(`<rect x="126" y="72" width="36" height="370" rx="18" fill="url(#blue)"/><path d="M160 90h242l-54 86 54 86H160z" fill="url(#mint)"/>${star(270, 174, 46)}`),
    accessory_hand_magnifier: svg(`<circle cx="222" cy="210" r="126" fill="#EAF8FF" fill-opacity=".72"/><circle cx="222" cy="210" r="126" fill="none" stroke="url(#blue)" stroke-width="42"/><rect x="302" y="304" width="70" height="176" rx="35" fill="url(#orange)" transform="rotate(-42 337 392)"/>${star(222, 210, 38)}`)
  },
  food: {
    food_star_cookie: svg(`${star(256, 256, 154, 'url(#gold)')}<circle cx="206" cy="230" r="14" fill="${orange}" stroke="none"/><circle cx="302" cy="214" r="13" fill="${orange}" stroke="none"/><circle cx="276" cy="302" r="12" fill="${orange}" stroke="none"/>`),
    food_cloud_milk: svg(`<path d="M136 122h240l-22 300H158z" fill="url(#blue)"/><ellipse cx="256" cy="126" rx="120" ry="48" fill="#FFF"/><ellipse cx="256" cy="132" rx="90" ry="30" fill="${cream}" stroke-width="8"/><path d="M180 292c22-44 76-48 102-12 34-26 86 2 76 44H180c-28-4-30-26 0-32z" fill="#FFF" stroke-width="8"/>`),
    food_rainbow_cup: svg(`<path d="M128 136h256l-26 286H154z" fill="#F7F2FF"/><path d="M148 214h216l-8 80H156z" fill="${pink}" stroke="none"/><path d="M156 294h200l-8 70H164z" fill="${yellow}" stroke="none"/><path d="M164 364h184l-6 48H170z" fill="${mint2}" stroke="none"/><circle cx="194" cy="142" r="54" fill="#FF554F"/><circle cx="272" cy="126" r="56" fill="#8FD34B"/><circle cx="334" cy="160" r="42" fill="${orange}"/>`),
  },
  toys: {
    toy_bouncy_ball: svg(`<circle cx="256" cy="256" r="170" fill="url(#blue)"/><path d="M134 140c62 18 110 56 144 112-40 54-60 112-58 174" fill="none" stroke="${yellow}" stroke-width="70"/><path d="M376 130c-52 30-86 74-102 126 48 44 80 96 94 156" fill="none" stroke="${yellow}" stroke-width="64"/>${star(256, 256, 36, '#FFF')}`),
    toy_puzzle_blocks: svg(`<rect x="76" y="224" width="150" height="150" rx="34" fill="url(#blue)"/><rect x="184" y="108" width="150" height="150" rx="34" fill="url(#gold)"/><rect x="286" y="226" width="150" height="150" rx="34" fill="url(#mint)"/><circle cx="151" cy="299" r="28" fill="#FFF" stroke-width="8"/>${star(259, 183, 34, '#FFF')}<path d="M334 302h54M361 275v54" stroke="#FFF" stroke-width="18"/>`),
    toy_bubble_wand: svg(`<circle cx="270" cy="160" r="108" fill="#EAF8FF" fill-opacity=".45"/><circle cx="270" cy="160" r="108" fill="none" stroke="url(#purple)" stroke-width="32"/><rect x="230" y="246" width="80" height="224" rx="40" fill="url(#blue)"/>${star(270, 354, 34)}<circle cx="120" cy="120" r="34" fill="#EAF8FF" stroke="url(#mint)" stroke-width="12"/><circle cx="416" cy="210" r="42" fill="#EAF8FF" stroke="url(#gold)" stroke-width="12"/>`)
  }
};

for (const [group, items] of Object.entries(assets)) {
  const dir = path.join(root, group);
  await fs.mkdir(dir, { recursive: true });
  for (const [id, content] of Object.entries(items)) {
    await sharp(Buffer.from(content)).png().toFile(path.join(dir, `${id}.png`));
  }
}

console.log(`Generated ${Object.values(assets).reduce((sum, group) => sum + Object.keys(group).length, 0)} transparent PNG assets.`);
