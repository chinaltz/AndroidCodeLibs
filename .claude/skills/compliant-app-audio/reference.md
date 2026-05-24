# 合规 App 内置音频 · 参考细节

与 `.agents/skills/compliant-app-audio/reference.md` 内容同步。

## phonicsapp 音标缺口（建议自录）

v_short /ʌ/, o_short /ɒ/, er_long /ɜː/, ou /əʊ/, ia /ɪə/, ea /eə/, ua /ʊə/, zh /ʒ/

## 检测 Edge-TTS 痕迹

```bash
ffprobe -hide_banner file.mp3 2>&1 | grep -i encoder
```

## 推荐安装（国内）

```bash
python3 -m pip install --user piper-tts -i https://pypi.tuna.tsinghua.edu.cn/simple
python3 tools/setup_piper_voice.py   # voice 走 hf-mirror
python3 tools/generate_compliant_audio.py --force
```

完整文档：`basic-controls/android/basiccontrols/phonicsapp/docs/AUDIO_PRODUCTION.md`
