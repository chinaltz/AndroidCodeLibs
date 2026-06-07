# 拼音星球内置音频声明

## 来源

- 名称：汉语拼音(mp3) 本地包
- 默认路径：`/Users/litingzhe/Downloads/汉语拼音(mp3)`
- 项目镜像：`materials/pinyin-audio-pack/`

目录结构：

| 本地目录 | 小程序目录 | 数量 |
|---------|-----------|------|
| `声母/` | `teaching/`（b、f、d…） | 23 |
| `韵母/` | `teaching/`（a、o、eng…） | 24 |
| `所有有拼音/`（整体认读） | `teaching/`（zhi1、yi1…） | 16 |
| `所有有拼音/`（全量） | `syllables/` | 216 |

## 同步

```bash
cd basic-controls/android/basiccontrols/miniprogram
./tools/sync-pinyin-audio.sh
```

仅使用本地包，不再回退其它网络音源。

## 说明

- 声母教学音为字母短音（`f.mp3`），不是带声调整音节（如 fo2）
- 示例音节与拼读组合已按本地包实际文件对齐
