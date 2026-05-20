---
name: sync-context
description: 变更 plan/*.md 或发布相关 SKILL 后自动双向同步。默认执行，无需用户提醒。
---

# 上下文同步

## 何时触发

- 用户变更发布平台、梯队、同步工具、品牌介绍
- Agent 修改了 `plan/` 或 `.Codex/skills/publish-*`、`publish-workflow`
- 完成操作后 **默认执行**，除非用户说「只改这一处、不要同步」

## 执行步骤

1. 打开根目录 `CONTEXT.md`，定位变更类型
2. 更新所有列出的 MD
3. 更新所有列出的 SKILL（路径均在 `.Codex/skills/`）
4. MD 与 SKILL 中平台名、数量、URL、梯队须一致
5. 回复末尾列出已同步文件路径

## 默认映射（速查）

| 变更 | MD | SKILL |
|------|-----|-------|
| 平台/梯队 | `plan/01_内容平台清单.md` | `publish-platforms/SKILL.md` |
| 注册追踪 HTML | `plan/平台注册进度追踪.html` | `publish-platforms/SKILL.md` |
| 同步工具方案 | `plan/02_全平台同步发布方案.md` | `publish-workflow/SKILL.md` |
| 品牌介绍 | `plan/03_技趣星球_博客介绍.md` | 视情况 `draft-post/SKILL.md` |

## 禁止

- 不要把账号密码写入 SKILL 或 git 内的 MD
- 不要只更新 HTML 而不同步 `01_内容平台清单.md`
- 不要跳过 SKILL 只更新 MD（或反之）

## 扩展

新文档类型先更新 `CONTEXT.md`，再按表同步。
