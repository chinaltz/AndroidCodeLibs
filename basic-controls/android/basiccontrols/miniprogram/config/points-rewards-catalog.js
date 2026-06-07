/**
 * 简单礼物兑换目录（家长线下兑现）
 * 依据见 docs/points-module-default-rules.md §6
 */
module.exports = [
  {
    id: 'reward_story',
    type: 'experience',
    title: '自选睡前故事',
    price: 15,
    description: '孩子选书，家长读或共读 1 本',
    weeklyLimit: null,
    sortOrder: 1,
  },
  {
    id: 'reward_snack',
    type: 'experience',
    title: '小零食一次',
    price: 20,
    description: '健康零食，非无限制',
    weeklyLimit: null,
    sortOrder: 2,
  },
  {
    id: 'reward_play_30',
    type: 'experience',
    title: '周末多玩30分钟',
    price: 30,
    description: '户外或游戏时间，建议周末兑换',
    weeklyLimit: 1,
    sortOrder: 3,
  },
  {
    id: 'reward_sticker',
    type: 'physical',
    title: '贴纸或小文具',
    price: 40,
    description: '单价约 15 元以内的小礼物',
    weeklyLimit: null,
    sortOrder: 4,
  },
  {
    id: 'reward_movie',
    type: 'experience',
    title: '家庭电影夜',
    price: 60,
    description: '选一部动画，准备爆米花',
    weeklyLimit: 1,
    sortOrder: 5,
  },
  {
    id: 'reward_outing',
    type: 'experience',
    title: '亲子半日出游',
    price: 100,
    description: '公园、博物馆等',
    weeklyLimit: null,
    sortOrder: 6,
  },
  {
    id: 'reward_wish',
    type: 'physical',
    title: '心愿单礼物',
    price: 150,
    description: '家长预设 3 选 1，避免临时讨价还价',
    weeklyLimit: null,
    sortOrder: 7,
  },
];
