const petService = require('./pet-service');
const petReward = require('./pet-reward');
const checkin = require('./checkin-service');
const catalog = require('../config/pet-catalog');

const PET_KEY = 'pet_reward_state_v1';
const CHECKIN_KEY = 'holiday_checkin_v1';

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function restore(key, value) {
  if (value == null || value === '') wx.removeStorageSync(key);
  else wx.setStorageSync(key, value);
}

function runAll() {
  const petSnapshot = clone(wx.getStorageSync(PET_KEY));
  const checkinSnapshot = clone(wx.getStorageSync(CHECKIN_KEY));
  const results = [];
  function assert(condition, message) { if (!condition) throw new Error(message); }
  function test(name, fn) {
    try { results.push({ name, passed: true, detail: fn() || '通过' }); }
    catch (err) { results.push({ name, passed: false, detail: err.message || String(err) }); }
  }
  try {
    wx.removeStorageSync(PET_KEY);
    wx.removeStorageSync(CHECKIN_KEY);
    test('领养与防重复', () => { const first = petService.adopt('测试芽芽'); const second = petService.adopt('重复领养'); assert(first.ok && !second.ok && petService.state().adopted, '领养状态错误'); });
    petService.debugPatch({ adopted: true, points: 200, xp: 1000, hunger: 40, mood: 40, energy: 80, ownedItemIds: ['toy_bouncy_ball', 'accessory_head_star_clip'] });
    test('商品目录完整性', () => { const ids = catalog.ALL_ITEMS.map((item) => item.id); assert(new Set(ids).size === ids.length && catalog.ALL_ITEMS.every((item) => item.image && item.price >= 0), '商品 ID、图片或价格配置异常'); });
    test('无限等级与成长形态', () => { const xp = catalog.totalXpForLevel(125); const level = catalog.levelForXp(xp); const next = catalog.nextLevel(xp); assert(level.level === 125 && next.level === 126 && level.stage.minLevel === 100, '高等级计算或成长阶段错误'); });
    test('长期装扮目录', () => { const highLevelItems = catalog.ACCESSORIES.filter((item) => item.minLevel >= 12); const leafWings = catalog.findItem('accessory_back_leaf_wings'); assert(catalog.ACCESSORIES.length >= 16 && highLevelItems.length >= 7 && leafWings.layout.width >= 500, '高等级装扮不足或叶子翅膀尺寸异常'); });
    test('配饰叠加安全区', () => { const headphones = catalog.findItem('accessory_head_headphones'); assert(headphones.layout.z === 0 && headphones.layout.width >= 380, '耳机未保持包耳背景层'); assert(!catalog.ACCESSORIES.some((item) => item.slot === 'neck'), '已下架的颈部配饰仍在目录中'); });
    test('颈部配饰下架退款', () => { const migrated = petService.debugPatch({ points: 0, ownedItemIds: ['toy_bouncy_ball', 'accessory_neck_mint_bow', 'accessory_neck_medal'] }); assert(migrated.points === 200 && migrated.inventory.ownedItemIds.indexOf('accessory_neck_mint_bow') < 0 && !Object.prototype.hasOwnProperty.call(migrated.equipped, 'neck'), '旧颈饰未正确退款或清理'); });
    test('状态边界', () => { petService.debugPatch({ hunger: 120, mood: -5, energy: 101 }); const s = petService.state().status; assert(s.hunger === 100 && s.mood === 0 && s.energy === 100, '状态未限制在 0-100'); });
    test('喂养逻辑', () => { petService.debugPatch({ hunger: 40, mood: 40, energy: 80 }); const before = petService.state().status.hunger; assert(petService.feed('food_star_cookie').ok && petService.state().status.hunger > before, '喂养未增加饱腹'); });
    test('饱腹限制', () => { petService.debugPatch({ hunger: 95 }); assert(!petService.feed('food_star_cookie').ok, '高饱腹时仍可喂养'); });
    test('玩耍消耗', () => { petService.debugPatch({ mood: 40, energy: 80 }); const before = petService.state().status; const result = petService.play('toy_bouncy_ball'); const after = petService.state().status; assert(result.ok && after.mood > before.mood && after.energy < before.energy, '玩耍状态变化错误'); });
    test('玩具所有权与活力限制', () => { petService.debugPatch({ ownedItemIds: [], energy: 80 }); assert(!petService.play('toy_bouncy_ball').ok, '未拥有玩具仍可玩耍'); petService.debugPatch({ ownedItemIds: ['toy_bouncy_ball'], energy: 5 }); assert(!petService.play('toy_bouncy_ball').ok, '低活力仍可玩耍'); });
    test('睡眠门槛', () => { petService.debugPatch({ energy: 80 }); assert(!petService.sleep().ok, '高活力时不应允许睡眠'); petService.debugPatch({ energy: 20, hunger: 80 }); assert(petService.sleep().ok && petService.state().status.energy > 20, '低活力睡眠未恢复'); });
    test('摸摸次数限制', () => { petService.debugPatch({ mood: 40 }); assert(petService.pet().ok && petService.pet().ok && petService.pet().ok, '前三次摸摸应成功'); assert(!petService.pet().ok, '第四次摸摸应受限'); });
    test('购买与扣分', () => { petService.debugPatch({ points: 200 }); const before = petService.state().points; assert(petService.purchase('food_cloud_milk').ok && petService.state().points < before, '购买未正确扣分'); });
    test('余额不足与重复购买', () => { petService.debugPatch({ points: 0, ownedItemIds: ['toy_bouncy_ball'] }); assert(!petService.purchase('toy_puzzle_blocks').ok, '余额不足仍购买成功'); petService.debugPatch({ points: 200 }); assert(petService.purchase('toy_puzzle_blocks').ok && !petService.purchase('toy_puzzle_blocks').ok, '永久商品重复购买未拦截'); });
    test('食物库存消费', () => { petService.debugPatch({ points: 200, hunger: 40 }); assert(petService.purchase('food_cloud_milk').ok, '食物购买失败'); const before = petService.state().inventory.consumables.food_cloud_milk; assert(petService.feed('food_cloud_milk').ok && petService.state().inventory.consumables.food_cloud_milk === before - 1, '食物库存未消费'); });
    test('配饰等级锁与穿脱', () => { petService.debugPatch({ xp: 0, ownedItemIds: ['toy_bouncy_ball', 'accessory_head_star_clip'] }); assert(!petService.equip('accessory_head_star_clip').ok, '低等级仍可穿戴'); petService.debugPatch({ xp: 1000 }); assert(petService.equip('accessory_head_star_clip').ok && petService.state().equipped.head === 'accessory_head_star_clip', '配饰未装备'); assert(petService.unequip('head').ok && !petService.state().equipped.head, '配饰未卸下'); });
    test('等级奖励防重复', () => { const firstState = petService.debugPatch({ points: 0, xp: 1000, claimedLevelRewards: [] }); const first = firstState.points; const second = petService.state().points; assert(first > 0 && second === first, '等级奖励重复发放'); });
    test('奖励防重复', () => { const event = { eventId: 'pet-self-test-reward', moduleId: 'test', title: '测试奖励', points: 5, xp: 5 }; assert(petReward.grantTaskReward(event).awarded && !petReward.grantTaskReward(event).awarded, '同一奖励被重复发放'); });
    test('分享奖励防重复', () => { const event = { eventId: 'pet-self-test-share', moduleId: 'test', title: '分享测试', points: 5, xp: 5 }; petReward.grantTaskReward(event); assert(petReward.claimShareReward(event.eventId).awarded && !petReward.claimShareReward(event.eventId).awarded, '同一任务分享奖励重复发放'); });
    test('每日打卡联动', () => { const first = checkin.recordDailyCompletion(6); const second = checkin.recordDailyCompletion(6); assert(first.recorded && !second.recorded && !second.reward.awarded, '打卡或奖励未正确防重复'); });
  } finally {
    restore(PET_KEY, petSnapshot);
    restore(CHECKIN_KEY, checkinSnapshot);
  }
  return results;
}

module.exports = { runAll };
