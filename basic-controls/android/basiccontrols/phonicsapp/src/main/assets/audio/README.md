# 音标星球内置音频目录

一期坚持纯单机，不依赖网络，也不从词典、视频、教材 App 或网课中截取音频。

正式音频来源（上架前）：

1. 自录音频。
2. 录音人签署授权：允许本项目永久、免费、可商用地使用、复制、修改、剪辑和分发。
3. 文件随 App 打包进 `assets/audio/`。

开发期占位（当前可内置）：

```bash
cd phonicsapp
./tools/generate_bundled_audio.sh          # 重做 48 个孤立音标（MIT + Edge IPA）
python3 tools/generate_bundled_audio.py --words --force   # 例词需重做时
```

音标音频为**孤立音素**（MIT s5s5/phonics），不是例词整读。详见 `tools/generate_bundled_audio.py`。

目录约定：

```text
assets/audio/
├── phonemes/      # 48 个音标标准音
└── words/         # 每个音标 3 个例词
```

命名约定：

```text
phonemes/ae.mp3
words/cat.mp3
```

当前代码会优先尝试播放内置 asset。文件不存在时只提示“音频待录制”，不会访问网络。
