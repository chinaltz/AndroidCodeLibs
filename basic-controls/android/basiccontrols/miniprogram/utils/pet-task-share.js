const petReward = require('./pet-reward');

function handle(page, options, eventId, fallback) {
  if (!options || options.from !== 'button' || !eventId) return fallback();
  const result = petReward.claimShareReward(eventId);
  if (result.awarded) {
    page.setData({
      'rewardResult.balance': result.balance,
      shareRewardText: `已获得 ${result.points} 宠物积分`,
    });
  } else if (result.reason === 'already_claimed') {
    page.setData({ shareRewardText: '本次分享奖励已领取' });
  } else if (result.reason === 'daily_limit') {
    page.setData({ shareRewardText: '今日分享奖励已达上限' });
  }
  return petReward.shareMessage(eventId);
}

module.exports = { handle };
