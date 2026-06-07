const share = require('./share');
const petReward = require('./pet-reward');
const petTaskShare = require('./pet-task-share');

function complete(page, unit) {
  page.taskEventId = petReward.createEventId('pinyin', unit.id);
  page.setData({
    taskEventId: page.taskEventId,
    shareRewardText: `分享学习成果 +${petReward.SHARE_POINTS} 宠物积分`,
    rewardResult: petReward.grantTaskReward({
      eventId: page.taskEventId,
      moduleId: 'pinyin',
      title: `拼音 ${unit.symbol} 过关`,
    }),
  });
}

function onShare(page, options) {
  return petTaskShare.handle(page, options, page.taskEventId, () => share.appMessage());
}

module.exports = { complete, onShare };
