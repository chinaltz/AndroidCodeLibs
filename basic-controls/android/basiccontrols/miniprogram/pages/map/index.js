const nav = require('../../utils/nav');
const share = require('../../utils/share');
const storage = require('../../utils/storage');
const petService = require('../../utils/pet-service');
const petRoutes = require('../../utils/pet-routes');

function measureHeader() {
  const info = wx.getSystemInfoSync();
  const statusBarHeight = info.statusBarHeight || 20;
  let navBarHeight = 44;

  try {
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect();
      if (rect && rect.height > 0) {
        const topGap = rect.top > 0 ? Math.max(0, rect.top - statusBarHeight) : 0;
        navBarHeight = rect.height + topGap * 2;
      }
    }
  } catch (err) {
    // iPad / devtools may fail on menu button metrics.
  }

  return {
    statusBarHeight,
    headerHeight: statusBarHeight + navBarHeight,
    pageHeight: info.windowHeight || info.screenHeight || 667,
  };
}

Page({
  data: {
    theme: {},
    child: null,
    childSubtitle: '先添加一个孩子',
    childAvatarPath: '',
    childrenCount: 0,
    phonicsText: '0/48',
    pinyinText: '0/63',
    wordPendingCount: 0,
    dictationTodayCount: 0,
    maxWrongCount: 0,
    petPoints: 0,
    todayQuests: [],
    enabledModules: { phonics: true, pinyin: true, words: true },
    enabledModuleCount: 3,
    tabs: [],
    statusBarHeight: 20,
    headerHeight: 108,
    pageHeight: 667,
    showSwitchSheet: false,
    sheetChildren: [],
  },

  onLoad() {
    share.enableShareMenu();
    this.setData(measureHeader());
  },

  onShow() {
    const app = getApp();
    const theme = app.globalData.theme;
    const child = storage.getCurrentChild();
    if (!child) {
      wx.redirectTo({
        url: '/pages/children/index?mode=first',
        fail: () => wx.showToast({ title: '添加孩子页面打开失败', icon: 'none' }),
      });
      return;
    }
    const children = storage.getChildren();
    const completed = storage.getCompleted();
    const pinyinCompleted = storage.getPinyinCompleted();
    const wordStats = storage.getWordStats(child && child.id);
    const childModules = child && child.modules && child.modules.length
      ? child.modules
      : ['phonics', 'pinyin', 'words'];
    const enabledModules = childModules.reduce((result, key) => {
      result[key] = true;
      return result;
    }, {});
    const learningQuests = [
      { key: 'phonics', title: '音标闯关', desc: `已完成 ${completed.length}/48`, image: '/assets/icons/module-phonics.png', path: '/packages/phonics-media/pages/phonics/index' },
      { key: 'pinyin', title: '拼音拼读', desc: `已完成 ${pinyinCompleted.length}/63`, image: '/assets/icons/module-pinyin.png', path: '/packages/pinyin/pages/index' },
      { key: 'words', title: '字词听写', desc: `${wordStats.pendingCount} 个错字待练`, image: '/assets/icons/module-words.png', path: '/pages/word-planet/index' },
    ].filter((quest) => childModules.indexOf(quest.key) >= 0);
    const petState = petService.state();
    const todayQuests = learningQuests.concat([
      {
        key: 'daily-todo',
        title: '每日任务',
        desc: '今天的小目标 · 打勾打卡',
        image: '/assets/icons/module-daily-todo.png',
        path: '/pages/daily-todo/index',
      },
      {
        key: 'pomodoro',
        title: '番茄钟',
        desc: '番茄君陪你 · 专注一会儿',
        image: '/assets/icons/module-pomodoro.png',
        path: '/pages/pomodoro/index',
      },
      {
        key: 'pet',
        title: '电子宠物',
        desc: petState.adopted
          ? `${petState.profile.name} Lv.${petState.level} · ${petState.points} 积分`
          : '领养一位蓝色学习伙伴',
        image: '/assets/icons/module-pet.png',
        path: petState.adopted ? petRoutes.home : petRoutes.adopt,
      },
    ]);
    app.globalData.completed = completed;
    this.setData(Object.assign({
      theme,
      child,
      childSubtitle: child ? `${child.nickname} · 本地学习数据` : '先添加一个孩子',
      childAvatarPath: child && child.avatar === 'girl' ? '/assets/images/planets/kid-girl.png' : '/assets/images/planets/kid-boy.png',
      childrenCount: children.length,
      phonicsText: `${completed.length}/48`,
      pinyinText: `${pinyinCompleted.length}/63`,
      wordPendingCount: wordStats.pendingCount,
      dictationPendingCount: wordStats.pendingCount,
      totalWrongCharCount: wordStats.totalCount,
      maxWrongCount: wordStats.maxWrongCount,
      petPoints: petState.points,
      todayQuests,
      enabledModules,
      enabledModuleCount: childModules.length,
      tabs: [
        {
          key: 'home',
          iconSrc: '/assets/icons/nav-home.png',
          activeIconSrc: '/assets/icons/nav-home-active.png',
          label: '首页',
        },
        {
          key: 'settings',
          iconSrc: '/assets/icons/nav-settings.png',
          activeIconSrc: '/assets/icons/nav-settings-active.png',
          label: '设置',
        },
      ],
    }, measureHeader()));
    wx.setNavigationBarColor({
      frontColor: theme.dark ? '#ffffff' : '#000000',
      backgroundColor: theme.pageStart,
    });
  },

  openSwitchSheet() {
    const currentChildId = storage.getCurrentChildId();
    const children = storage.getChildren();
    this.setData({
      showSwitchSheet: true,
      sheetChildren: children.map((child) => Object.assign({}, child, {
        isCurrent: child.id === currentChildId,
        avatarPath: child.avatar === 'girl' ? '/assets/images/planets/kid-girl.png' : '/assets/images/planets/kid-boy.png',
      })),
    });
  },

  closeSwitchSheet() {
    this.setData({ showSwitchSheet: false });
  },

  onSheetSwitchChild(e) {
    const id = e.currentTarget.dataset.id;
    if (id === storage.getCurrentChildId()) {
      this.setData({ showSwitchSheet: false });
      return;
    }
    storage.switchChild(id);
    getApp().syncThemeAfterChildChange();
    getApp().globalData.completed = storage.getCompleted();
    this.setData({ showSwitchSheet: false });
    this.onShow();
  },

  onSheetAddChild() {
    this.setData({ showSwitchSheet: false });
    nav.navigateTo('/pages/children/index?mode=add');
  },

  goChildren() {
    nav.navigateTo('/pages/child-list/index');
  },

  onQuestTap(e) {
    const path = e.currentTarget.dataset.path;
    if (!path) {
      wx.showToast({ title: '入口暂不可用', icon: 'none' });
      return;
    }
    nav.navigateTo(path);
  },

  onTabChange(e) {
    if (e.detail.key === 'settings') {
      wx.redirectTo({
        url: '/pages/settings/index',
        fail: () => wx.showToast({ title: '设置页面打开失败', icon: 'none' }),
      });
    }
  },

  onShareAppMessage() {
    return share.appMessage();
  },

  onShareTimeline() {
    return share.timeline();
  },
});
