const BASE = '/assets/images/pet-runtime/';

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
  { id: 'accessory_head_star_clip', title: '星星发卡', type: 'accessory', slot: 'head', price: 80, minLevel: 4, image: `${BASE}accessories/accessory_head_star_clip.png` },
  { id: 'accessory_head_headphones', title: '小耳机', type: 'accessory', slot: 'head', price: 100, minLevel: 5, image: `${BASE}accessories/accessory_head_headphones.png` },
  { id: 'accessory_head_explorer_hat', title: '探索帽', type: 'accessory', slot: 'head', price: 120, minLevel: 6, image: `${BASE}accessories/accessory_head_explorer_hat.png` },
  { id: 'accessory_neck_mint_bow', title: '薄荷领结', type: 'accessory', slot: 'neck', price: 80, minLevel: 3, image: `${BASE}accessories/accessory_neck_mint_bow.png` },
  { id: 'accessory_neck_rainbow_scarf', title: '彩条围巾', type: 'accessory', slot: 'neck', price: 90, minLevel: 3, image: `${BASE}accessories/accessory_neck_rainbow_scarf.png` },
  { id: 'accessory_back_schoolbag', title: '探索书包', type: 'accessory', slot: 'back', price: 140, minLevel: 5, image: `${BASE}accessories/accessory_back_schoolbag.png` },
  { id: 'accessory_back_cloud_cape', title: '云朵披风', type: 'accessory', slot: 'back', price: 160, minLevel: 7, image: `${BASE}accessories/accessory_back_cloud_cape.png` },
  { id: 'accessory_hand_star_pen', title: '星星笔', type: 'accessory', slot: 'hand', price: 110, minLevel: 4, image: `${BASE}accessories/accessory_hand_star_pen.png` },
];

const ALL_ITEMS = FOODS.concat(TOYS, ACCESSORIES);

function findItem(id) {
  return ALL_ITEMS.find((item) => item.id === id) || null;
}

function levelForXp(xp) {
  let current = LEVELS[0];
  LEVELS.forEach((item) => {
    if (xp >= item.totalXp) current = item;
  });
  return current;
}

function nextLevel(xp) {
  return LEVELS.find((item) => item.totalXp > xp) || null;
}

module.exports = {
  PET_BLUE: `${BASE}pet-sprout-blue-idle.png`,
  PET_BLUE_IDLE: `${BASE}pet-sprout-blue-idle.png`,
  PET_BLUE_HAPPY: `${BASE}pet-sprout-blue-happy.png`,
  PET_BLUE_EAT: `${BASE}pet-sprout-blue-eat.png`,
  PET_BLUE_PLAY: `${BASE}pet-sprout-blue-play.png`,
  PET_BLUE_SLEEPY: `${BASE}pet-sprout-blue-sleepy.png`,
  LEVELS,
  FOODS,
  TOYS,
  ACCESSORIES,
  ALL_ITEMS,
  findItem,
  levelForXp,
  nextLevel,
};
