const defaults = require('../config/tts');
const { signTencentV3 } = require('./tencent-sign');

const STORE_KEY = 'dictation_tts_config';

function getConfig() {
  const local = wx.getStorageSync(STORE_KEY) || {};
  return Object.assign({}, defaults, local);
}

function saveConfig(patch) {
  const next = Object.assign({}, getConfig(), patch || {});
  wx.setStorageSync(STORE_KEY, next);
  return next;
}

function maskSecret(value) {
  const text = String(value || '');
  if (text.length <= 8) return text ? '已填写' : '未填写';
  return `${text.slice(0, 4)}****${text.slice(-4)}`;
}

function requestTencentTts(text, options) {
  const config = Object.assign({}, getConfig(), options || {});
  if (!config.secretId || !config.secretKey) {
    return Promise.reject(new Error('请先配置 TTS SecretId / SecretKey'));
  }
  const host = 'tts.tencentcloudapi.com';
  const payload = JSON.stringify({
    Text: String(text || ''),
    SessionId: `dictation_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    ModelType: 1,
    VoiceType: Number(config.voiceType || defaults.voiceType),
    Codec: config.codec || defaults.codec,
    Speed: Number(config.speed || 0),
    Volume: Number(config.volume || 0),
  });
  const signed = signTencentV3({
    host,
    service: config.service || defaults.service,
    payload,
    secretId: config.secretId,
    secretKey: config.secretKey,
  });

  return new Promise((resolve, reject) => {
    wx.request({
      url: config.endpoint || defaults.endpoint,
      method: 'POST',
      data: payload,
      header: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: signed.authorization,
        Host: host,
        'X-TC-Action': config.action || defaults.action,
        'X-TC-Version': config.version || defaults.version,
        'X-TC-Timestamp': String(signed.timestamp),
        'X-TC-Region': config.region || defaults.region,
      },
      success(res) {
        const response = res.data && res.data.Response;
        if (response && response.Audio) {
          resolve(response.Audio);
          return;
        }
        const message = response && response.Error && response.Error.Message;
        reject(new Error(message || 'TTS 合成失败'));
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

function writeBase64ToTempFile(base64, codec) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    const ext = codec || 'mp3';
    const filePath = `${wx.env.USER_DATA_PATH}/dictation_tts_${Date.now()}.${ext}`;
    fs.writeFile({
      filePath,
      data: base64,
      encoding: 'base64',
      success: () => resolve(filePath),
      fail: reject,
    });
  });
}

function synthesizeToTempFile(text, options) {
  const config = Object.assign({}, getConfig(), options || {});
  return requestTencentTts(text, config).then((base64) => writeBase64ToTempFile(base64, config.codec || defaults.codec));
}

module.exports = {
  getConfig,
  saveConfig,
  maskSecret,
  synthesizeToTempFile,
};
