# 发布检查清单 · 16-google-io-wwdc-2026-ai-duel

## 审查报告（2026-06-09）

### 总体评分

文章结构完整、来源权威、语气适合普通人。审核中已修正：去掉「昨天」时效措辞、提示词改为国内 AI 优先、删除 ChatGPT 举例、收尾去模板化。

### 各维度检查结果

| 维度 | 结果 | 说明 |
|------|------|------|
| 原则1：人话优先 | ✅ | 管家比喻清晰，术语有解释 |
| 原则2：解决问题优先 | ✅ | 开篇即点「跟我有什么关系」 |
| 原则3：不制造焦虑 | ✅ | 语气平和，无恐慌表述 |
| 原则4：明确边界 | ✅ | 秋季上线、地区限制、英语限制均已说明 |
| 原则5：带走东西 | ✅ | 3 条行动 + 待办清单 + 提示词 |
| 模板结构 | ✅ | 标题、结论、对比表、小结齐全 |
| 语气 | ✅ | 已去掉部分模板句 |
| 敏感词 | ✅ | 使用「特殊网络」「网络加速工具」 |

### 发布状态

| 产出 | 路径 | 状态 |
|------|------|------|
| 正文 Markdown | `index.md` | ✅ |
| 公众号 HTML | `index.html` | ✅（本地图，未上传公网） |
| Word | `*.docx` | ✅ |
| 公网图链版 | `index.published.md` | ⬜ 需配置 `image-upload.config.json` |
| 微信搜一搜 5 图 | `social/wechat-search/wechat-card-*.png` | ✅ |
| 搜一搜发布说明 | `social/wechat-search/UPLOAD.md` | ✅ |

### 发布前待办

- [ ] 公众号后台上传封面（可用 `images/header.png` 或 `wechat-card-01.png`）
- [ ] 打开 `index.html` → 一键复制正文 → 粘贴公众号（图片需在后台逐张上传）
- [ ] 微信搜一搜：按 `social/wechat-search/UPLOAD.md` 上传 5 张图文卡
- [ ] （可选）配置图床后执行 `npm run publish:post -- content/posts/16-google-io-wwdc-2026-ai-duel`
