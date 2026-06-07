/**
 * 积分模块全局默认值与建议系数
 * 依据见 docs/points-module-default-rules.md
 */
module.exports = {
  /** 默认日上限：普通表现日约 6~9 分，表现好接近满额 */
  dailyEarnCapDefault: 12,

  dailyEarnCapMin: 3,
  dailyEarnCapMax: 30,

  /** 默认积分样式：低年级推荐小红花 */
  tokenStyleDefault: 'flower',

  /** 减分确认：默认开启 */
  penaltyNeedConfirmDefault: true,

  /**
   * 正向 / 负向比例设计目标（产品说明用，非硬编码校验）
   * 日上限 12 : 最大减分 4 ≈ 3:1
   */
  ratioGuide: {
    earnCapToMaxPenalty: 3,
    recommendedPositiveNegative: '4:1 ~ 5:1',
  },

  /** 默认收工时刻说明（家长可改规则 note） */
  studyCutoff: {
    label: '八点半前完成学习',
    defaultTime: '20:30',
    note: '当天全部学习任务在 20:30 前完成；时间可按家庭习惯调整',
  },

  goalFactors: {
    /** 周目标 ≈ 日上限 × 5 × 0.7 */
    weeklyDays: 5,
    weeklyRate: 0.7,
    /** 月目标 ≈ 周目标 × 4 × 0.9 */
    monthlyWeeks: 4,
    monthlyRate: 0.9,
    /** 学期目标 ≈ 月目标 × 4.5 */
    semesterMonths: 4.5,
  },

  ruleHealth: {
    looseRatio: 1.3,
    strictRatio: 0.5,
  },

  ledgerMax: 300,

  /** 首次引导默认模板 */
  defaultTemplateId: 'primary_daily',
};
