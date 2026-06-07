/**
 * 积分规则模板包
 * 设计依据：docs/points-module-default-rules.md
 *
 * 原则：加分项多、减分项少；理论最大日获得 > 日上限，由 cap 截断；
 * 最大日减分 ≤ 4，与 dailyEarnCapDefault(12) 形成约 3:1。
 */
const DEFAULTS = require('./points-defaults');

function bonus(id, name, value, dailyMax, note, extra) {
  return Object.assign({
    id,
    name,
    value,
    dailyMax: dailyMax == null ? 1 : dailyMax,
    note: note || '',
    enabled: true,
    sortOrder: 0,
    autoTrigger: null,
  }, extra || {});
}

function penalty(id, name, value, dailyMax, note) {
  return {
    id,
    name,
    value,
    dailyMax: dailyMax == null ? 1 : dailyMax,
    note: note || '',
    enabled: true,
    sortOrder: 0,
  };
}

const PRIMARY_DAILY_BONUS = [
  bonus('bonus_study_before_830', '八点半前完成学习', 3, 1,
    '当天全部学习任务在 20:30 前完成；时间可按家庭习惯调整'),
  bonus('bonus_study_extra', '主动加练', 1, 1,
    '必做任务完成后主动加练约 10 分钟'),
  bonus('bonus_school_done', '学校任务完成', 2, 1,
    '老师布置任务当天完成（在校或在家）'),
  bonus('bonus_school_early', '学校任务超前', 1, 1,
    '提前完成明日部分或老师可核实的额外任务'),
  bonus('bonus_care_done', '托管任务完成', 2, 1,
    '托管/晚托布置任务按时完成'),
  bonus('bonus_care_extra', '托管超量完成', 2, 1,
    '除必做外额外完成一项，如错题整理、练字、阅读'),
  bonus('bonus_read_20', '主动阅读20分钟', 1, 1,
    '计时阅读，可亲子共读'),
  bonus('bonus_pack_bag', '自己整理书包', 1, 1,
    '按清单收拾次日书包'),
  bonus('bonus_tidy_room', '整理房间桌面', 1, 1,
    '书桌或床铺整理到位'),
  bonus('bonus_wake_on_time', '按时起床不拖拉', 1, 1,
    '闹钟响后 15 分钟内完成起床洗漱'),
  bonus('bonus_help_home', '主动帮忙家务', 1, 2,
    '摆碗筷、倒垃圾、收衣服等'),
  bonus('bonus_polite', '礼貌沟通', 1, 2,
    '主动问好、好好说话'),
  bonus('bonus_dictation', '听写完成', 2, 1,
    '完成一次听写队列', { enabled: false, autoTrigger: 'dictation_completed' }),
  bonus('bonus_phonics', '音标拼音过关', 2, 1,
    '完成一关过关检查', { enabled: false, autoTrigger: 'phonics_check_completed' }),
  bonus('bonus_review_wrong', '错字认真复习', 1, 1,
    '完成错字本复习', { enabled: false, autoTrigger: 'word_review_completed' }),
];

const PRIMARY_DAILY_PENALTY = [
  penalty('penalty_late_sleep', '拖延睡觉', 1, 1,
    '约定睡觉时间后 30 分钟仍未就寝'),
  penalty('penalty_rude', '顶嘴不礼貌', 1, 1,
    '明知故犯的顶撞、摔门等'),
  penalty('penalty_homework_skip', '作业未完成', 2, 1,
    '当天必做学习任务未完成（当天最多扣 1 次）'),
  penalty('penalty_dishonest', '说谎推责', 2, 1,
    '任务明显未完成却声称完成'),
  penalty('penalty_mess', '乱扔不整理', 1, 1,
    '提醒 1 次后仍不收拾'),
];

const TEMPLATES = {
  primary_daily: {
    id: 'primary_daily',
    title: '小学生日常生活',
    description: '含学校、托管、八点半收工与日常习惯；默认推荐',
    recommended: true,
    dailyEarnCap: DEFAULTS.dailyEarnCapDefault,
    tokenStyle: DEFAULTS.tokenStyleDefault,
    bonus: PRIMARY_DAILY_BONUS.map((r, i) => Object.assign({}, r, { sortOrder: i + 1 })),
    penalty: PRIMARY_DAILY_PENALTY.map((r, i) => Object.assign({}, r, { sortOrder: i + 1 })),
  },

  minimal: {
    id: 'minimal',
    title: '精简三项',
    description: '先试一周：收工、学校任务、阅读',
    recommended: false,
    dailyEarnCap: 8,
    tokenStyle: 'star',
    bonus: [
      bonus('bonus_study_before_830', '八点半前完成学习', 3, 1, PRIMARY_DAILY_BONUS[0].note),
      bonus('bonus_school_done', '学校任务完成', 2, 1, PRIMARY_DAILY_BONUS[2].note),
      bonus('bonus_read_20', '主动阅读20分钟', 1, 1, PRIMARY_DAILY_BONUS[6].note),
    ].map((r, i) => Object.assign({}, r, { sortOrder: i + 1 })),
    penalty: [
      penalty('penalty_late_sleep', '拖延睡觉', 1, 1, PRIMARY_DAILY_PENALTY[0].note),
      penalty('penalty_homework_skip', '作业未完成', 2, 1, PRIMARY_DAILY_PENALTY[2].note),
    ].map((r, i) => Object.assign({}, r, { sortOrder: i + 1 })),
  },

  learning_focus: {
    id: 'learning_focus',
    title: '学习强化',
    description: '假期或冲刺：偏学习项，习惯项减少',
    recommended: false,
    dailyEarnCap: 14,
    tokenStyle: 'star',
    bonus: [
      bonus('bonus_study_before_830', '八点半前完成学习', 3, 1, PRIMARY_DAILY_BONUS[0].note),
      bonus('bonus_school_done', '学校任务完成', 2, 1, PRIMARY_DAILY_BONUS[2].note),
      bonus('bonus_care_done', '托管任务完成', 2, 1, PRIMARY_DAILY_BONUS[4].note),
      bonus('bonus_study_extra', '主动加练', 2, 1, '加练 15 分钟以上'),
      bonus('bonus_dictation', '听写完成', 2, 2, PRIMARY_DAILY_BONUS[12].note, { enabled: true }),
      bonus('bonus_phonics', '音标拼音过关', 2, 2, PRIMARY_DAILY_BONUS[13].note, { enabled: true }),
      bonus('bonus_review_wrong', '错字认真复习', 1, 2, PRIMARY_DAILY_BONUS[14].note, { enabled: true }),
    ].map((r, i) => Object.assign({}, r, { sortOrder: i + 1 })),
    penalty: PRIMARY_DAILY_PENALTY.slice(0, 3).map((r, i) => Object.assign({}, r, { sortOrder: i + 1 })),
  },
};

function getTemplate(id) {
  return TEMPLATES[id] || null;
}

function listTemplates() {
  return Object.values(TEMPLATES).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    recommended: !!t.recommended,
    bonusCount: t.bonus.filter((r) => r.enabled !== false).length,
    penaltyCount: t.penalty.length,
    dailyEarnCap: t.dailyEarnCap,
  }));
}

/** 理论最大日获得（仅启用加分项） */
function calcTheoreticalMax(bonusRules) {
  return bonusRules
    .filter((r) => r.enabled !== false)
    .reduce((sum, r) => sum + r.value * (r.dailyMax || 1), 0);
}

/** 理论最大日减分 */
function calcMaxDailyPenalty(penaltyRules) {
  return penaltyRules
    .filter((r) => r.enabled !== false)
    .reduce((sum, r) => sum + r.value * (r.dailyMax || 1), 0);
}

module.exports = {
  TEMPLATES,
  getTemplate,
  listTemplates,
  calcTheoreticalMax,
  calcMaxDailyPenalty,
  DEFAULT_TEMPLATE_ID: DEFAULTS.defaultTemplateId,
};
