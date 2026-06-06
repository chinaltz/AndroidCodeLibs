const nav = require('../../utils/nav');
const share = require('../../utils/share');
const storage = require('../../utils/storage');

const PLANETS = [
  {
    key: 'phonics',
    title: '音标星球',
    desc: '48 音标地图、学习、过关检查',
    image: '/assets/images/planets/planet-phonics.png',
    path: '/pages/phonics/index',
    stat: '继续学习',
    badge: '核心',
    accent: '#6C8DFF',
  },
  {
    key: 'words',
    title: '字词星球',
    desc: '错字管理、听写提醒、统计和默写纸',
    image: '/assets/images/planets/planet-words.png',
    path: '/pages/word-planet/index',
    stat: '待复习',
    badge: '听写',
    accent: '#43CFC7',
  },
  {
    key: 'pinyin',
    title: '拼音星球',
    desc: '拼音认读、拼读训练',
    image: '/assets/images/planets/planet-pinyin.png',
    path: '/packages/pinyin/pages/index',
    stat: '开始学习',
    badge: '语文',
    accent: '#FFB648',
  },
  {
    key: 'points',
    title: '积分星球',
    desc: '积分、打卡和奖励',
    image: '/assets/images/planets/planet-points.png',
    coming: true,
    stat: 'Coming soon',
    badge: '奖励',
    accent: '#FF7A90',
  },
  {
    key: 'pet',
    title: '宠物星球',
    desc: '学习养成和宠物成长',
    image: '/assets/images/planets/planet-pet.png',
    coming: true,
    stat: 'Coming soon',
    badge: '养成',
    accent: '#8DDB64',
  },
];

Page({
  data: {
    theme: {},
    child: null,
    childSubtitle: '先添加一个孩子',
    childAvatarPath: '',
    childrenCount: 0,
    selectedAvatar: '',
    nickname: '',
    planets: PLANETS,
    phonicsText: '0/48',
    wordPendingCount: 0,
    dictationTodayCount: 0,
    maxWrongCount: 0,
    todayQuests: [],
    tabs: [],
    statusBarHeight: 20,
    headerHeight: 108,
  },

  onLoad() {
    share.enableShareMenu();
    const info = wx.getSystemInfoSync();
    let navBarHeight = 44;
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect();
      if (rect && rect.height && rect.top) {
        navBarHeight = rect.height + Math.max(0, rect.top - (info.statusBarHeight || 0)) * 2;
      }
    }
    this.setData({
      statusBarHeight: info.statusBarHeight || 20,
      headerHeight: (info.statusBarHeight || 20) + navBarHeight,
    });
  },

  onShow() {
    const app = getApp();
    const theme = app.globalData.theme;
    const child = storage.getCurrentChild();
    const children = storage.getChildren();
    const completed = storage.getCompleted();
    const pinyinCompleted = storage.getPinyinCompleted();
    const wordStats = storage.getWordStats(child && child.id);
    app.globalData.completed = completed;
    this.setData({
      theme,
      child,
      childSubtitle: child ? `${child.nickname} · 本地学习数据` : '先添加一个孩子',
      childAvatarPath: child && child.avatar === 'girl' ? '/assets/images/planets/kid-girl.png' : '/assets/images/planets/kid-boy.png',
      childrenCount: children.length,
      phonicsText: `${completed.length}/48`,
      wordPendingCount: wordStats.pendingCount,
      dictationTodayCount: wordStats.todayCount,
      maxWrongCount: wordStats.maxWrongCount,
      planets: PLANETS.map((planet) => (
        planet.key === 'pinyin'
          ? Object.assign({}, planet, { stat: `${pinyinCompleted.length}/63` })
          : planet
      )),
      todayQuests: [
        { key: 'phonics', title: '音标闯关', desc: `已完成 ${completed.length}/48`, image: '/assets/images/planets/planet-phonics.png', path: '/pages/phonics/index' },
        { key: 'pinyin', title: '拼音拼读', desc: `已完成 ${pinyinCompleted.length}/63`, image: '/assets/images/planets/planet-pinyin.png', path: '/packages/pinyin/pages/index' },
        { key: 'words', title: '字词听写', desc: `${wordStats.todayCount} 个今日建议`, image: '/assets/images/planets/planet-words.png', path: '/pages/word-planet/index' },
      ],
      tabs: [
        { key: 'home', icon: '⌂', label: '首页' },
        { key: 'settings', icon: '⚙', label: '设置' },
      ],
    });
    wx.setNavigationBarColor({
      frontColor: theme.dark ? '#ffffff' : '#000000',
      backgroundColor: theme.pageStart,
    });
  },

  onPickAvatar(e) {
    const avatar = e.currentTarget.dataset.avatar;
    this.setData({
      selectedAvatar: avatar,
      nickname: avatar === 'girl' ? '姐姐' : '小宝',
    });
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  onSaveChild() {
    const nickname = (this.data.nickname || '').trim();
    if (!this.data.selectedAvatar) {
      wx.showToast({ title: '先选择孩子头像', icon: 'none' });
      return;
    }
    if (!nickname) {
      wx.showToast({ title: '请输入孩子昵称', icon: 'none' });
      return;
    }
    storage.createChild({
      nickname,
      avatar: this.data.selectedAvatar,
    });
    this.setData({ selectedAvatar: '', nickname: '' });
    this.onShow();
  },

  goChildren() {
    nav.navigateTo('/pages/children/index');
  },

  onPlanetTap(e) {
    const key = e.currentTarget.dataset.key;
    const planet = PLANETS.find((item) => item.key === key);
    if (!planet) return;
    if (planet.coming) {
      wx.showToast({ title: `${planet.title} Coming soon`, icon: 'none' });
      return;
    }
    nav.navigateTo(planet.path);
  },

  onTabChange(e) {
    if (e.detail.key === 'settings') {
      nav.navigateTo('/pages/settings/index');
    }
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
