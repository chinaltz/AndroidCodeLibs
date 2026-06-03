const SHARE_TITLE = '音标星球';
const HOME_PATH = 'pages/map/index';

function enableShareMenu() {
  if (!wx.showShareMenu) return;
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
  });
}

function appMessage(options = {}) {
  return {
    title: options.title || SHARE_TITLE,
    path: options.path || HOME_PATH,
  };
}

function timeline(options = {}) {
  return {
    title: options.title || SHARE_TITLE,
    query: options.query || '',
  };
}

module.exports = {
  enableShareMenu,
  appMessage,
  timeline,
};
