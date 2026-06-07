const storage = require('./storage');
const catalog = require('../config/pet-catalog');

const KEY = 'pet_reward_state_v1';
const MAX_LEDGER = 200;
const MIN_ENERGY_TO_PLAY = 10;
const SLEEP_ENERGY_THRESHOLD = 45;
const SLEEP_ENERGY_RESTORE = 40;

function playEnergyCost(toy) {
  return Math.max(MIN_ENERGY_TO_PLAY, Math.abs(toy.energy || MIN_ENERGY_TO_PLAY));
}

function load() {
  return wx.getStorageSync(KEY) || {};
}

function save(root) {
  wx.setStorageSync(KEY, root);
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function defaultBucket() {
  return {
    points: 0,
    xp: 0,
    ledger: [],
    shareClaims: {},
    profile: { adopted: false, speciesId: 'star_sprout', colorId: 'sky_blue', name: '芽芽' },
    status: { hunger: 75, mood: 80, energy: 80, lastDailyReset: '' },
    inventory: { ownedItemIds: ['toy_bouncy_ball'], consumables: {} },
    equipped: { head: '', neck: '', back: '', hand: '', room: 'room_default' },
    dailyCare: { date: '', freeFeedUsed: false },
    claimedLevelRewards: [],
  };
}

function bucketFor(root) {
  const childId = storage.getCurrentChildId() || 'default';
  root.children = root.children || {};
  const bucket = Object.assign(defaultBucket(), root.children[childId] || {});
  bucket.profile = Object.assign(defaultBucket().profile, bucket.profile || {});
  bucket.status = Object.assign(defaultBucket().status, bucket.status || {});
  bucket.inventory = Object.assign(defaultBucket().inventory, bucket.inventory || {});
  bucket.inventory.ownedItemIds = bucket.inventory.ownedItemIds || ['toy_bouncy_ball'];
  bucket.inventory.consumables = bucket.inventory.consumables || {};
  bucket.equipped = Object.assign(defaultBucket().equipped, bucket.equipped || {});
  bucket.dailyCare = Object.assign(defaultBucket().dailyCare, bucket.dailyCare || {});
  bucket.claimedLevelRewards = bucket.claimedLevelRewards || [];
  bucket.ledger = bucket.ledger || [];
  bucket.shareClaims = bucket.shareClaims || {};
  root.children[childId] = bucket;
  return bucket;
}

function addLedger(bucket, entry) {
  bucket.ledger = [Object.assign({ createdAt: Date.now() }, entry)].concat(bucket.ledger).slice(0, MAX_LEDGER);
}

function applyDailyReset(bucket) {
  const today = todayKey();
  if (bucket.status.lastDailyReset && bucket.status.lastDailyReset !== today) {
    bucket.status.hunger = Math.max(35, bucket.status.hunger - 20);
    bucket.status.mood = Math.max(40, bucket.status.mood - 10);
    bucket.status.energy = Math.min(100, bucket.status.energy + 20);
  }
  if (bucket.dailyCare.date !== today) {
    bucket.dailyCare = { date: today, freeFeedUsed: false };
  }
  bucket.status.lastDailyReset = today;
}

function state() {
  const root = load();
  const bucket = bucketFor(root);
  applyDailyReset(bucket);
  const level = catalog.levelForXp(bucket.xp);
  catalog.LEVELS.forEach((item) => {
    if (item.level <= level.level && item.rewardPoints > 0 && bucket.claimedLevelRewards.indexOf(item.level) < 0) {
      bucket.claimedLevelRewards.push(item.level);
      bucket.points += item.rewardPoints;
      addLedger(bucket, {
        eventId: `level_reward:${item.level}`,
        type: 'level',
        title: `${item.level} 级成长奖励`,
        points: item.rewardPoints,
        xp: 0,
      });
    }
  });
  save(root);
  const next = catalog.nextLevel(bucket.xp);
  return {
    adopted: bucket.profile.adopted,
    profile: bucket.profile,
    points: bucket.points,
    xp: bucket.xp,
    level: level.level,
    stageTitle: level.title,
    nextLevel: next,
    levelProgress: next ? Math.round(((bucket.xp - level.totalXp) / (next.totalXp - level.totalXp)) * 100) : 100,
    status: bucket.status,
    inventory: bucket.inventory,
    equipped: bucket.equipped,
    ledger: bucket.ledger,
    petImage: catalog.PET_BLUE,
  };
}

function adopt(name) {
  const root = load();
  const bucket = bucketFor(root);
  if (bucket.profile.adopted) return { ok: false, reason: 'already_adopted' };
  bucket.profile = {
    adopted: true,
    speciesId: 'star_sprout',
    colorId: 'sky_blue',
    name: String(name || '芽芽').trim().slice(0, 8) || '芽芽',
    adoptedAt: Date.now(),
  };
  bucket.points += 30;
  addLedger(bucket, { eventId: 'pet_adopted', type: 'adopt', title: '领养新手礼包', points: 30, xp: 0 });
  save(root);
  return { ok: true, points: bucket.points };
}

function pickFeedFood(bucket) {
  const owned = catalog.FOODS
    .filter((food) => (bucket.inventory.consumables[food.id] || 0) > 0)
    .sort((a, b) => b.hunger - a.hunger);
  if (owned.length) return owned[0].id;
  return 'food_star_cookie';
}

function feed(foodId) {
  const root = load();
  const bucket = bucketFor(root);
  applyDailyReset(bucket);
  const resolvedId = foodId || pickFeedFood(bucket);
  const food = catalog.findItem(resolvedId);
  if (!food || food.type !== 'food') return { ok: false, message: '食物不存在' };
  if (bucket.status.hunger >= 90) return { ok: false, message: '已经吃得很饱啦' };
  const owned = bucket.inventory.consumables[foodId] || 0;
  const free = foodId === 'food_star_cookie' && !bucket.dailyCare.freeFeedUsed;
  if (!owned && !free && bucket.points < food.price) {
    return { ok: false, message: `还差 ${food.price - bucket.points} 星星积分` };
  }
  if (owned) bucket.inventory.consumables[foodId] = owned - 1;
  else if (free) bucket.dailyCare.freeFeedUsed = true;
  else bucket.points -= food.price;
  bucket.status.hunger = Math.min(100, bucket.status.hunger + food.hunger);
  bucket.status.mood = Math.min(100, bucket.status.mood + food.mood);
  bucket.status.energy = Math.min(100, bucket.status.energy + food.energy);
  addLedger(bucket, { eventId: `feed:${Date.now()}`, type: 'spend', title: `喂养：${food.title}`, points: free || owned ? 0 : -food.price, xp: 0 });
  save(root);
  return { ok: true, message: free ? '今日首次基础喂养免费' : `${food.title}吃完啦`, state: bucket.status, points: bucket.points };
}

function play(toyId) {
  const root = load();
  const bucket = bucketFor(root);
  applyDailyReset(bucket);
  const toy = catalog.findItem(toyId);
  if (!toy || toy.type !== 'toy') return { ok: false, message: '玩具不存在' };
  if (bucket.inventory.ownedItemIds.indexOf(toyId) < 0) return { ok: false, message: '请先在商店购买这个玩具' };
  const cost = playEnergyCost(toy);
  if (bucket.status.energy < cost) {
    return { ok: false, message: `活力不足（需要 ${cost}），让小宠先睡一会儿吧` };
  }
  bucket.status.mood = Math.min(100, bucket.status.mood + toy.mood);
  bucket.status.energy = Math.max(0, bucket.status.energy - cost);
  addLedger(bucket, { eventId: `play:${Date.now()}`, type: 'care', title: `玩耍：${toy.title}`, points: 0, xp: 0 });
  save(root);
  return { ok: true, message: `${toy.title}时间！`, state: bucket.status };
}

function sleep() {
  const root = load();
  const bucket = bucketFor(root);
  applyDailyReset(bucket);
  if (bucket.status.energy > SLEEP_ENERGY_THRESHOLD) {
    return { ok: false, message: '现在精神很好，暂时不需要睡觉' };
  }
  bucket.status.energy = Math.min(100, bucket.status.energy + SLEEP_ENERGY_RESTORE);
  bucket.status.hunger = Math.max(0, bucket.status.hunger - 8);
  bucket.status.mood = Math.min(100, bucket.status.mood + 5);
  addLedger(bucket, { eventId: `sleep:${Date.now()}`, type: 'care', title: '小睡恢复活力', points: 0, xp: 0 });
  save(root);
  return { ok: true, message: '好好睡了一觉，活力恢复啦', state: bucket.status };
}

function purchase(itemId) {
  const root = load();
  const bucket = bucketFor(root);
  const item = catalog.findItem(itemId);
  if (!item) return { ok: false, message: '商品不存在' };
  const level = catalog.levelForXp(bucket.xp).level;
  if (item.minLevel && level < item.minLevel) return { ok: false, message: `${item.minLevel} 级后可以购买` };
  if (item.type !== 'food' && bucket.inventory.ownedItemIds.indexOf(itemId) >= 0) return { ok: false, message: '已经拥有啦' };
  if (bucket.points < item.price) return { ok: false, message: `还差 ${item.price - bucket.points} 星星积分` };
  bucket.points -= item.price;
  if (item.type === 'food') {
    bucket.inventory.consumables[itemId] = (bucket.inventory.consumables[itemId] || 0) + 1;
  } else {
    bucket.inventory.ownedItemIds.push(itemId);
  }
  addLedger(bucket, { eventId: `purchase:${itemId}:${Date.now()}`, type: 'spend', title: `购买：${item.title}`, points: -item.price, xp: 0 });
  save(root);
  return { ok: true, message: `已购买${item.title}`, points: bucket.points };
}

function equip(itemId) {
  const root = load();
  const bucket = bucketFor(root);
  if (!itemId) return { ok: false, message: '请选择配饰' };
  const item = catalog.findItem(itemId);
  if (!item || item.type !== 'accessory') return { ok: false, message: '配饰不存在' };
  if (catalog.levelForXp(bucket.xp).level < item.minLevel) return { ok: false, message: `${item.minLevel} 级后可以穿戴` };
  if (bucket.inventory.ownedItemIds.indexOf(itemId) < 0) return { ok: false, message: '请先购买这件配饰' };
  bucket.equipped[item.slot] = itemId;
  addLedger(bucket, { eventId: `equip:${itemId}:${Date.now()}`, type: 'care', title: `穿戴：${item.title}`, points: 0, xp: 0 });
  save(root);
  return { ok: true, message: `已穿戴${item.title}` };
}

function unequip(slot) {
  const root = load();
  const bucket = bucketFor(root);
  if (Object.prototype.hasOwnProperty.call(bucket.equipped, slot)) bucket.equipped[slot] = '';
  save(root);
  return { ok: true };
}

module.exports = {
  state,
  adopt,
  feed,
  play,
  sleep,
  purchase,
  equip,
  unequip,
  todayKey,
  MIN_ENERGY_TO_PLAY,
  SLEEP_ENERGY_THRESHOLD,
  playEnergyCost,
  pickFeedFood,
};
