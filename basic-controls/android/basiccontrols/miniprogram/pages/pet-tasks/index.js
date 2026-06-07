const nav = require('../../utils/nav');
const petService = require('../../utils/pet-service');

const LEARN_MODULE_IDS = ['phonics', 'pinyin'];

function isToday(time) {
  const date = new Date(time);
  return petService.todayKey() === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

Page({
  data: { theme: {}, tasks: [], completedCount: 0, progressStyle: 'width:0%;' },
  onShow() {
    const state = petService.state();
    const todayTasks = state.ledger.filter((item) => item.type === 'task' && isToday(item.createdAt));
    const modules = {};
    todayTasks.forEach((item) => { modules[item.moduleId] = true; });
    const learnTasks = todayTasks.filter((item) => LEARN_MODULE_IDS.indexOf(item.moduleId) >= 0);
    const learnDone = learnTasks.length > 0;
    const taskData = [
      {
        id: 'learn',
        title: '完成 1 个学习关卡',
        desc: learnDone ? `已完成：${learnTasks[0].title}` : '音标、拼音任选',
        done: learnDone,
        reward: '+5 XP / +5 ★',
        path: '/pages/map/index',
      },
      {
        id: 'dictation',
        title: '完成 1 组字词听写',
        desc: modules.dictation ? '今天已经完成听写' : '完成听写并保存批改结果',
        done: !!modules.dictation,
        reward: '+5 XP / +5 ★',
        path: '/pages/word-planet/index',
      },
      {
        id: 'cross',
        title: '学习两个不同模块',
        desc: `当前完成 ${Object.keys(modules).length}/2 个模块`,
        done: Object.keys(modules).length >= 2,
        reward: '+10 XP / +8 ★',
        path: '/pages/map/index',
      },
    ];
    const completedCount = taskData.filter((item) => item.done).length;
    this.setData({
      theme: getApp().globalData.theme,
      tasks: taskData,
      completedCount,
      progressStyle: `width:${Math.round(completedCount / 3 * 100)}%;`,
    });
  },
  onBack() { nav.navigateBack({ fallbackUrl: '/pages/pet-home/index' }); },
  goTask(e) {
    if (e.currentTarget.dataset.done) return;
    wx.reLaunch({ url: e.currentTarget.dataset.path });
  },
});
