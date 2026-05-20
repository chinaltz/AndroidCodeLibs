# 技趣星球 · 上下文同步索引

> **约定**：变更 `plan/` 或发布相关 SKILL 时，Agent 必须同步更新下表对应的 MD 与 SKILL。无需用户提醒。

## 文件 ↔ Skill 映射

| 用户操作 / 变更类型 | 必更 MD | 必更 SKILL |
|---------------------|---------|------------|
| 增删改发布平台、梯队 | `plan/01_内容平台清单.md` | `.claude/skills/publish-platforms/SKILL.md` |
| 改注册追踪表（HTML 平台行） | `plan/01_内容平台清单.md` + `plan/平台注册进度追踪.html` | `.claude/skills/publish-platforms/SKILL.md` |
| 同步工具、发布方案 | `plan/02_全平台同步发布方案.md` | `.claude/skills/publish-workflow/SKILL.md` |
| 博客品牌、口号、定位 | `plan/03_技趣星球_博客介绍.md` | `.claude/skills/draft-post/SKILL.md`（若影响写作模板） |
| 发布流水线步骤变更 | — | `.claude/skills/publish-workflow/SKILL.md` |
| 新增专用能力 | 本文件 `CONTEXT.md` | `.claude/skills/<新skill名>/SKILL.md` |

## 目录结构

```
├── CONTEXT.md                          ← 本文件
├── plan/
│   ├── 01_内容平台清单.md
│   ├── 02_全平台同步发布方案.md
│   ├── 03_技趣星球_博客介绍.md
│   ├── 平台注册进度追踪.html
│   └── 头像图标.html
└── .claude/skills/                     ← 全部 Skills（9 个）
    ├── draft-post / improve-style / …
    ├── publish-workflow
    ├── publish-platforms
    └── sync-context
```

## 当前状态快照（2026-05-20）

- **主平台**：第一梯队 4 + 第二梯队 9 = **13** 个
- **第一梯队**：微信公众号、知乎、掘金、CSDN
- **第二梯队**：简书、今日头条、百家号、思否、博客园、小红书、网易号、抖音、快手
