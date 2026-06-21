const BASE = '/packages/pet/assets/runtime/';

const LEVELS = [
  { level: 1, totalXp: 0, rewardPoints: 0, title: '幼芽' },
  { level: 2, totalXp: 40, rewardPoints: 10, title: '活力幼芽' },
  { level: 3, totalXp: 100, rewardPoints: 15, title: '成长幼芽' },
  { level: 4, totalXp: 180, rewardPoints: 15, title: '闪亮幼芽' },
  { level: 5, totalXp: 280, rewardPoints: 20, title: '小星苗' },
  { level: 6, totalXp: 400, rewardPoints: 20, title: '探索星苗' },
  { level: 7, totalXp: 550, rewardPoints: 20, title: '好奇星苗' },
  { level: 8, totalXp: 730, rewardPoints: 25, title: '快乐星苗' },
  { level: 9, totalXp: 940, rewardPoints: 25, title: '智慧星苗' },
  { level: 10, totalXp: 1180, rewardPoints: 30, title: '成长伙伴' },
];

const GROWTH_STAGES = [
  { id: 'seedling', minLevel: 1, title: '幼芽', image: `${BASE}pet-sprout-blue-idle.png`, desc: '刚刚来到星球的小幼芽' },
  { id: 'young', minLevel: 10, title: '小星苗', image: `${BASE}pet-sprout-blue-stage2.png`, desc: '长出双叶和金色花苞' },
  { id: 'explorer', minLevel: 25, title: '探索星芽', image: `${BASE}pet-sprout-blue-stage3.png`, desc: '拥有三叶冠和探索勇气' },
  { id: 'stellar', minLevel: 50, title: '星辉芽兽', image: `${BASE}pet-sprout-blue-stage4.png`, desc: '身体浮现明亮星图' },
  { id: 'guardian', minLevel: 100, title: '星界守护', image: `${BASE}pet-sprout-blue-stage5.png`, desc: '完成成熟进化，继续提升星阶' },
];

const FOODS = [
  { id: 'food_star_cookie', title: '星星饼干', type: 'food', price: 8, hunger: 20, mood: 0, energy: 0, image: `${BASE}food/food_star_cookie.png`, desc: '饱腹 +20' },
  { id: 'food_cloud_milk', title: '云朵牛奶', type: 'food', price: 12, hunger: 15, mood: 0, energy: 5, image: `${BASE}food/food_cloud_milk.png`, desc: '饱腹 +15，活力 +5' },
  { id: 'food_rainbow_cup', title: '彩虹果杯', type: 'food', price: 18, hunger: 25, mood: 5, energy: 0, image: `${BASE}food/food_rainbow_cup.png`, desc: '饱腹 +25，心情 +5' },
];

const TOYS = [
  { id: 'toy_bouncy_ball', title: '弹弹球', type: 'toy', price: 0, mood: 15, energy: -10, image: `${BASE}toys/toy_bouncy_ball.png`, desc: '默认拥有，心情 +15，消耗 10 活力' },
  { id: 'toy_puzzle_blocks', title: '拼图积木', type: 'toy', price: 30, mood: 12, energy: -10, image: `${BASE}toys/toy_puzzle_blocks.png`, desc: '永久玩具，心情 +12，消耗 10 活力' },
  { id: 'toy_bubble_wand', title: '泡泡棒', type: 'toy', price: 50, mood: 20, energy: -10, image: `${BASE}toys/toy_bubble_wand.png`, desc: '永久玩具，心情 +20，消耗 10 活力' },
];

const ACCESSORIES = [
  { id: 'accessory_head_star_clip', title: '星星发卡', type: 'accessory', slot: 'head', price: 80, minLevel: 4, image: `${BASE}accessories/accessory_head_star_clip.png`, layout: { width: 86, height: 86, left: 232, top: 86, z: 2 } },
  { id: 'accessory_head_headphones', title: '小耳机', type: 'accessory', slot: 'head', price: 100, minLevel: 5, image: `${BASE}accessories/accessory_head_headphones.png`, layout: { width: 390, height: 210, left: 20, top: 62, z: 0 } },
  { id: 'accessory_head_explorer_hat', title: '探索帽', type: 'accessory', slot: 'head', price: 120, minLevel: 6, image: `${BASE}accessories/accessory_head_explorer_hat.png`, layout: { width: 175, height: 140, left: 128, top: 68, z: 2 } },
  { id: 'accessory_head_cloud_nightcap', title: '云朵睡帽', type: 'accessory', slot: 'head', price: 130, minLevel: 7, image: `${BASE}accessories/accessory_head_cloud_nightcap.png`, layout: { width: 180, height: 150, left: 112, top: 38, z: 2 } },
  { id: 'accessory_head_moon_crown', title: '月芽冠', type: 'accessory', slot: 'head', price: 220, minLevel: 12, image: `${BASE}accessories/accessory_head_moon_crown.png`, layout: { width: 210, height: 115, left: 110, top: 64, z: 2 } },
  { id: 'accessory_head_scholar_cap', title: '星光学士帽', type: 'accessory', slot: 'head', price: 320, minLevel: 20, image: `${BASE}accessories/accessory_head_scholar_cap.png`, layout: { width: 225, height: 145, left: 102, top: 52, z: 2 } },
  { id: 'accessory_back_schoolbag', title: '探索书包', type: 'accessory', slot: 'back', price: 140, minLevel: 5, image: `${BASE}accessories/accessory_back_schoolbag.png`, layout: { width: 190, height: 190, left: 38, top: 215, z: 0 } },
  { id: 'accessory_back_cloud_cape', title: '云朵披风', type: 'accessory', slot: 'back', price: 160, minLevel: 7, image: `${BASE}accessories/accessory_back_cloud_cape.png`, layout: { width: 300, height: 265, left: 65, top: 195, z: 0 } },
  { id: 'accessory_back_leaf_wings', title: '叶子翅膀', type: 'accessory', slot: 'back', price: 180, minLevel: 8, image: `${BASE}accessories/accessory_back_leaf_wings.png`, layout: { width: 500, height: 340, left: -35, top: 125, z: 0 } },
  { id: 'accessory_back_starlight_wings', title: '星辉羽翼', type: 'accessory', slot: 'back', price: 300, minLevel: 18, image: `${BASE}accessories/accessory_back_starlight_wings.png`, layout: { width: 520, height: 350, left: -45, top: 120, z: 0 } },
  { id: 'accessory_back_galaxy_cape', title: '银河披风', type: 'accessory', slot: 'back', price: 450, minLevel: 35, image: `${BASE}accessories/accessory_back_galaxy_cape.png`, layout: { width: 350, height: 300, left: 40, top: 180, z: 0 } },
  { id: 'accessory_hand_star_pen', title: '星星笔', type: 'accessory', slot: 'hand', price: 110, minLevel: 4, image: `${BASE}accessories/accessory_hand_star_pen.png`, layout: { width: 130, height: 170, left: 258, top: 270, z: 2 } },
  { id: 'accessory_hand_flag', title: '小旗子', type: 'accessory', slot: 'hand', price: 125, minLevel: 5, image: `${BASE}accessories/accessory_hand_flag.png`, layout: { width: 145, height: 180, left: 72, top: 274, z: 2 } },
  { id: 'accessory_hand_magnifier', title: '放大镜', type: 'accessory', slot: 'hand', price: 145, minLevel: 6, image: `${BASE}accessories/accessory_hand_magnifier.png`, layout: { width: 155, height: 155, left: 235, top: 280, z: 2 } },
  { id: 'accessory_hand_star_lantern', title: '星愿灯', type: 'accessory', slot: 'hand', price: 340, minLevel: 22, image: `${BASE}accessories/accessory_hand_star_lantern.png`, layout: { width: 135, height: 180, left: 260, top: 265, z: 2 } },
  { id: 'accessory_hand_telescope', title: '观星镜', type: 'accessory', slot: 'hand', price: 520, minLevel: 40, image: `${BASE}accessories/accessory_hand_telescope.png`, layout: { width: 170, height: 155, left: 238, top: 270, z: 2 } },
];

const ALL_ITEMS = FOODS.concat(TOYS, ACCESSORIES);

function findItem(id) {
  return ALL_ITEMS.find((item) => item.id === id) || null;
}

function totalXpForLevel(level) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  if (safeLevel <= LEVELS.length) return LEVELS[safeLevel - 1].totalXp;
  const steps = safeLevel - 10;
  return 1180 + (255 * steps) + (15 * steps * steps);
}

function growthStageForLevel(level) {
  let stage = GROWTH_STAGES[0];
  GROWTH_STAGES.forEach((item) => { if (level >= item.minLevel) stage = item; });
  return stage;
}

function levelRewardPoints(level) {
  if (level <= 1) return 0;
  return 10 + Math.min(30, Math.floor(level / 5) * 2) + (level % 10 === 0 ? 10 : 0);
}

function infoForLevel(level) {
  const stage = growthStageForLevel(level);
  const rank = level >= 100 ? Math.floor((level - 100) / 25) + 1 : 0;
  return {
    level,
    totalXp: totalXpForLevel(level),
    rewardPoints: levelRewardPoints(level),
    title: rank ? `${stage.title} · ${rank}阶` : stage.title,
    stage,
  };
}

function levelForXp(xp) {
  const target = Math.max(0, Math.floor(Number(xp) || 0));
  let low = 1;
  let high = 16;
  while (totalXpForLevel(high) <= target) high *= 2;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (totalXpForLevel(middle) <= target) low = middle;
    else high = middle - 1;
  }
  return infoForLevel(low);
}

function nextLevel(xp) {
  return infoForLevel(levelForXp(xp).level + 1);
}

function petImageForLevel(level, emotion) {
  const stage = growthStageForLevel(level);
  if (stage.minLevel > 1) return stage.image;
  const images = {
    happy: `${BASE}pet-sprout-blue-happy.png`,
    eat: `${BASE}pet-sprout-blue-eat.png`,
    play: `${BASE}pet-sprout-blue-play.png`,
    sleepy: `${BASE}pet-sprout-blue-sleepy.png`,
  };
  return images[emotion] || `${BASE}pet-sprout-blue-idle.png`;
}

function accessoryStyle(item, scale) {
  if (!item || !item.layout) return '';
  const ratio = Number(scale) || 1;
  const layout = item.layout;
  return [
    `width:${Math.round(layout.width * ratio)}rpx`,
    `height:${Math.round(layout.height * ratio)}rpx`,
    `left:${Math.round(layout.left * ratio)}rpx`,
    `top:${Math.round(layout.top * ratio)}rpx`,
    `z-index:${layout.z}`,
  ].join(';');
}

module.exports = {
  PET_BLUE: `${BASE}pet-sprout-blue-idle.png`,
  PET_BLUE_IDLE: `${BASE}pet-sprout-blue-idle.png`,
  PET_BLUE_HAPPY: `${BASE}pet-sprout-blue-happy.png`,
  PET_BLUE_EAT: `${BASE}pet-sprout-blue-eat.png`,
  PET_BLUE_PLAY: `${BASE}pet-sprout-blue-play.png`,
  PET_BLUE_SLEEPY: `${BASE}pet-sprout-blue-sleepy.png`,
  LEVELS,
  GROWTH_STAGES,
  FOODS,
  TOYS,
  ACCESSORIES,
  ALL_ITEMS,
  findItem,
  accessoryStyle,
  totalXpForLevel,
  growthStageForLevel,
  levelRewardPoints,
  infoForLevel,
  levelForXp,
  nextLevel,
  petImageForLevel,
};
