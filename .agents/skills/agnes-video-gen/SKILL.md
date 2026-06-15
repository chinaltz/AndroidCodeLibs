---
name: agnes-video-gen
description: 使用 Agnes-Video-v2.0 模型生成视频。支持文生视频、图生视频，原生音画同出。免费无限量调用。
argument-hint: "[视频场景描述，可附图片URL进行图生视频]"
---

# Agnes Video 生成器

使用 Agnes-Video-v2.0 模型通过 API 生成视频。该模型免费无限量，支持文生视频和图生视频，**原生音画同出**（自动生成配乐，无需额外配音）。

## API 配置

- **Endpoint**: `https://apihub.agnes-ai.com/v1/video/generations`
- **Model**: `agnes-video-v2.0`（注意：是 `v2.0` 不是 `2.0`）
- **API Key**: 从环境变量 `AGNES_API_KEY` 读取，或使用用户提供的 Key
- **认证方式**: Bearer Token
- **生成方式**: 异步（提交任务 → 轮询状态 → 获取视频URL）

## 使用方式

### 第一步：提交视频生成任务

**文生视频：**
```bash
curl -s https://apihub.agnes-ai.com/v1/video/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGNES_API_KEY" \
  -d '{
    "model": "agnes-video-v2.0",
    "prompt": "视频场景描述",
    "duration": 5
  }'
```

**图生视频（附加参考图片）：**
```bash
curl -s https://apihub.agnes-ai.com/v1/video/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AGNES_API_KEY" \
  -d '{
    "model": "agnes-video-v2.0",
    "prompt": "基于图片的视频描述",
    "image": "图片URL",
    "duration": 5
  }'
```

**参数说明：**
- `duration`: 视频时长（秒），支持 5 或 10
- `image`: 可选，用于图生视频的参考图片 URL

**提交成功响应：**
```json
{
  "task_id": "task_xxxxx",
  "video_id": "video_xxxxx",
  "status": "queued",
  "seconds": "5.0",
  "size": "1280x704"
}
```

### 第二步：轮询任务状态

```bash
curl -s "https://apihub.agnes-ai.com/v1/video/generations/{task_id}" \
  -H "Authorization: Bearer $AGNES_API_KEY"
```

**状态说明：**
- `queued` / `NOT_START`: 排队中，继续等待
- `processing`: 生成中，进度在 `progress` 字段
- `completed` / `SUCCESS`: 完成，`data` 中有视频下载 URL
- `failed`: 失败，查看 `fail_reason`

### 第三步：获取视频

任务完成后，响应中会包含视频下载 URL。

## 执行流程

1. 确认用户需求：文生视频 or 图生视频
2. 优化提示词（加入镜头语言、配乐风格等描述）
3. 提交任务，获取 task_id
4. 每隔 30 秒轮询一次状态（最多轮询 10 次，约 5 分钟）
5. 任务完成后返回视频 URL
6. 如果超时未完成，给用户提供手动查询命令

## 提示词优化建议

视频提示词结构：
```
[场景主体] + [运动/动作] + [镜头语言] + [光影氛围] + [配乐风格]
```

**镜头语言关键词：**
- 远景、中景、近景、特写
- 推拉摇移、跟镜头
- 航拍、低角度、俯拍
- 慢镜头、延时摄影

**配乐风格关键词（模型会自动生成配乐）：**
- 电影感、史诗感
- 轻快、悠扬
- 紧张、悬疑
- 安静、ASMR

**高质量提示词示例：**
```
一场GT3赛车比赛，晴天日间，一辆88号红色法拉利领跑，远景、中景、特写来回切换，电影质感，引擎轰鸣和赛道观众欢呼的音效
```

```
一杯咖啡从壶中缓缓倒入白色陶瓷杯，液面泛起细腻泡沫，升起袅袅热气，背景是柔和晨光，ASMR风格慢镜头，轻柔的背景音乐
```

## 注意事项

- API Key: `sk-fOUhHg4nDplF8Pk6PCMZIk20S753kHSWfUp2LjRhBl9kMjge`
- **模型ID是 `agnes-video-v2.0`**（带 v），不是 `agnes-video-2.0`
- 视频生成是异步的，通常需要 2-5 分钟
- 免费模型排队可能较长，高峰期耐心等待
- 输出分辨率为 1280×704
- 支持 5 秒和 10 秒时长
- 原生音画同出，不需要单独配音
- 支持中英文提示词
