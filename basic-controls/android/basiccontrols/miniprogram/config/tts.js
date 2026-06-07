let local = {};
try {
  local = require('./tts.local');
} catch (err) {
  // tts.local.js 为本地密钥文件（gitignore），缺失时听写 TTS 不可用
  local = {};
}

module.exports = Object.assign({
  provider: 'tencent',
  endpoint: 'https://tts.tencentcloudapi.com/',
  service: 'tts',
  version: '2019-08-23',
  action: 'TextToVoice',
  region: 'ap-guangzhou',
  voiceType: 101001,
  codec: 'mp3',
  speed: 0,
  volume: 0,
}, local);
