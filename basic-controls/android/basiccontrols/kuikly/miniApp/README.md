# 音标星球 Kuikly 微信小程序宿主

这是 Kuikly 迁移版的小程序宿主工程，和现有 `miniprogram/` 原生小程序并行存在。

## 构建链路

```bash
cd /Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly
./gradlew :shared:packLocalJsBundleDebug -Pkuikly.useLocalKsp=false
./gradlew :miniApp:jsMiniAppDevelopmentWebpack
```

如果本机 KuiklyUI 源码不在 `/tmp/KuiklyUI`，先指定：

```bash
export KUIKLY_UI_DIR=/path/to/KuiklyUI
```

构建完成后，用微信开发者工具打开：

```text
/Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly/miniApp/dist
```

## 页面映射

- `pages/PhonicsMap/index` -> `pageName: "PhonicsMap"`
- `pages/PhonicsLearn/index` -> `pageName: "PhonicsLearn"`
- `pages/PhonicsCheck/index` -> `pageName: "PhonicsCheck"`

## 当前状态

- 小程序壳、WXML 模板和资源目录已接入。
- 音频资源已复制到 `dist/assets/audio`，后续由 `:miniApp:copyAssets` 同步。
- Gradle 任务解析已通过，`copyAssets` 已验证通过。
- 当前 `nativevue2.js` 构建卡在 Yarn 下载 npm 依赖，需保证 npm registry 可访问后继续。
- 还需要把 `shared` 页面补成正式 Kuikly `@Page` 页面，并打通 `nativevue2.js` 业务 bundle。
