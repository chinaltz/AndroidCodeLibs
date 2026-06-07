const defaults = require('../config/tts');
const { signTencentV3 } = require('./tencent-sign');

function getConfig() {
  return Object.assign({}, defaults);
}

function normalizeRequestError(err, res) {
  const errMsg = String((err && err.errMsg) || (err && err.message) || '');
  if (/url not in domain list|不在以下 request 合法域名/i.test(errMsg)) {
    return new Error('请求域名未配置：请在小程序后台添加 https://tts.tencentcloudapi.com');
  }
  if (/fail timeout|timed out/i.test(errMsg)) {
    return new Error('网络超时，请检查网络后重试');
  }
  if (errMsg) return new Error(errMsg);

  const response = res && res.data && res.data.Response;
  const apiErr = response && response.Error;
  if (apiErr && apiErr.Message) {
    const code = apiErr.Code ? `（${apiErr.Code}）` : '';
    if (/AuthFailure|InvalidCredential|Signature/i.test(apiErr.Code || '')) {
      return new Error(`TTS 密钥无效${code}，请检查 config/tts.local.js`);
    }
    if (/ResourceInsufficient|InsufficientBalance|FailedOperation/i.test(apiErr.Code || '')) {
      return new Error(`TTS 服务不可用${code}，请检查腾讯云账户余额与 TTS 开通状态`);
    }
    return new Error(`${apiErr.Message}${code}`);
  }
  if (res && res.statusCode && res.statusCode !== 200) {
    return new Error(`TTS 请求失败（HTTP ${res.statusCode}）`);
  }
  return new Error('TTS 合成失败');
}

function buildRequestBody(text, config) {
  return {
    Text: String(text || ''),
    SessionId: `dictation_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    ModelType: 1,
    VoiceType: Number(config.voiceType || defaults.voiceType),
    Codec: config.codec || defaults.codec,
    Speed: Number(config.speed || 0),
    Volume: Number(config.volume || 0),
  };
}

function requestTencentTts(text, options) {
  const config = Object.assign({}, getConfig(), options || {});
  if (!config.secretId || !config.secretKey) {
    return Promise.reject(new Error('TTS 内置配置缺少 SecretId / SecretKey'));
  }
  const host = 'tts.tencentcloudapi.com';
  const body = buildRequestBody(text, config);
  const payload = JSON.stringify(body);
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
      enableHttp2: false,
      header: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: signed.authorization,
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
        reject(normalizeRequestError(null, res));
      },
      fail(err) {
        reject(normalizeRequestError(err));
      },
    });
  });
}

function verifyTempAudio(filePath) {
  const fs = wx.getFileSystemManager();
  try {
    fs.accessSync(filePath);
    const stat = fs.statSync(filePath);
    if (!stat || stat.size < 64) {
      throw new Error('音频文件为空');
    }
    return filePath;
  } catch (err) {
    throw new Error((err && err.message) || '音频文件无法读取');
  }
}

function writeBase64ToTempFile(base64, codec) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    const ext = codec || 'mp3';
    const clean = String(base64 || '').replace(/\s/g, '');
    if (!clean) {
      reject(new Error('TTS 返回空音频'));
      return;
    }
    const filePath = `${wx.env.USER_DATA_PATH}/dictation_tts_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    fs.writeFile({
      filePath,
      data: clean,
      encoding: 'base64',
      success: () => {
        const finalize = () => {
          try {
            resolve(verifyTempAudio(filePath));
          } catch (err) {
            reject(err);
          }
        };
        // Android 真机写入后需短暂等待文件系统同步
        setTimeout(finalize, 80);
      },
      fail(err) {
        reject(new Error((err && err.errMsg) || '音频写入失败'));
      },
    });
  });
}

function synthesizeToTempFile(text, options) {
  const config = Object.assign({}, getConfig(), options || {});
  return requestTencentTts(text, config).then((audioBase64) => writeBase64ToTempFile(audioBase64, config.codec || defaults.codec));
}

module.exports = {
  getConfig,
  synthesizeToTempFile,
};
