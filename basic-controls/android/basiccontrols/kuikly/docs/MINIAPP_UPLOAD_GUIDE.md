# Kuikly 微信小程序构建与上传流程

本文档面向音标星球 Kuikly 迁移版小程序，说明从 Kuikly 构建产物到微信公众平台上传代码的完整步骤。

## 1. 当前目录约定

```text
basic-controls/android/basiccontrols/
└── kuikly/
    ├── shared/                 # Kuikly 业务代码，生成 nativevue2.js
    ├── miniApp/                # 微信小程序宿主
    │   └── dist/               # 最终给微信开发者工具打开/上传的目录
    ├── gradlew                 # 独立 Gradle 7.6.3 wrapper
    └── settings.gradle.kts
```

小程序项目目录固定为：

```bash
/Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly/miniApp/dist
```

微信开发者工具只打开和上传 `dist`，不要打开 `kuikly/` 根目录。

## 2. 上传前准备

### 2.1 微信侧准备

1. 微信公众平台创建小程序并拿到 AppID。
2. 当前项目的 `project.config.json` 已配置：

```json
{
  "appid": "wx13ea27fa3e736c61",
  "projectname": "phonics-planet-kuikly"
}
```

3. 上传账号需要是该小程序的管理员、项目成员，或有上传权限的开发者。
4. 如果使用命令行自动上传，需要在微信公众平台进入：

```text
开发管理 -> 开发设置 -> 小程序代码上传
```

下载“代码上传密钥”，保存为本机私钥文件，例如：

```text
~/.wechat-miniprogram/private.wx13ea27fa3e736c61.key
```

私钥文件不要提交到 Git。

### 2.2 本机工具准备

1. 安装微信开发者工具。
2. 如果使用微信开发者工具 CLI，需要在开发者工具里打开：

```text
设置 -> 安全设置 -> 服务端口
```

3. macOS 常见 CLI 路径：

```bash
/Applications/wechatwebdevtools.app/Contents/MacOS/cli
```

本机如果安装在外置盘，可能是：

```bash
/Volumes/outmount/Applications/wechatwebdevtools.app/Contents/MacOS/cli
```

4. 如果使用 `miniprogram-ci`，需要 Node.js 环境。

## 3. Kuikly 构建步骤

### 3.1 确认 KuiklyUI 源码位置

当前工程默认使用 `/tmp/KuiklyUI` 作为 KuiklyUI 源码依赖。如果源码在其他目录，先设置：

```bash
export KUIKLY_UI_DIR=/path/to/KuiklyUI
```

### 3.2 进入 Kuikly 子工程

```bash
cd /Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly
```

### 3.3 同步资源

```bash
./gradlew :miniApp:copyAssets
```

这一步会把：

```text
shared/src/commonMain/assets
```

同步到：

```text
miniApp/dist/assets
```

### 3.4 构建业务 Bundle

Debug：

```bash
./gradlew :shared:packLocalJSBundleDebug -Pkuikly.useLocalKsp=false
```

Release：

```bash
./gradlew :shared:packLocalJSBundleRelease -Pkuikly.useLocalKsp=false
```

目标产物是：

```text
shared/build/dist/js/developmentExecutable/nativevue2.js
shared/build/dist/js/productionExecutable/nativevue2.js
```

### 3.5 构建小程序渲染 Bundle

Debug：

```bash
./gradlew :miniApp:jsMiniAppDevelopmentWebpack
```

Release：

```bash
./gradlew :miniApp:jsMiniAppProductionWebpack
```

目标产物会进入：

```text
miniApp/dist/lib/miniprogramApp.js
miniApp/dist/business/nativevue2.js
```

### 3.6 构建成功后的 dist 应包含

```text
miniApp/dist/
├── app.js
├── app.json
├── project.config.json
├── base.wxml
├── lib/miniprogramApp.js
├── business/nativevue2.js
├── assets/audio/...
└── pages/
    ├── PhonicsMap/index.*
    ├── PhonicsLearn/index.*
    └── PhonicsCheck/index.*
```

缺少 `lib/miniprogramApp.js` 或 `business/nativevue2.js` 时，不要上传，先修构建。

## 4. 本地预览检查

### 4.1 用微信开发者工具打开

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 项目目录选择：

```text
/Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly/miniApp/dist
```

4. AppID 使用 `project.config.json` 中的 AppID。
5. 编译，确认首页可打开。

### 4.2 必查功能

上传前至少检查：

1. 首页音标地图能显示。
2. 点击音标只播放，不跳页。
3. 点击“开始学习”进入学习页。
4. 学习页正确播放音标和例词。
5. 过关检查能逐题进行。
6. 录音权限弹窗、录音、回放流程可用。
7. 顶部导航和底部区域不遮挡真机状态栏、安全区。
8. 设置页主题和语言切换生效。
9. 真机预览没有白屏和控制台红色错误。

## 5. 上传方式一：开发者工具手动上传

这是最稳的方式，适合首次上传和调试阶段。

1. 用微信开发者工具打开 `miniApp/dist`。
2. 点击顶部工具栏“上传”。
3. 填写版本号，例如：

```text
0.1.0
```

4. 填写项目备注，例如：

```text
Kuikly 迁移版：音标地图、学习页、过关检查基础链路
```

5. 上传成功后，进入微信公众平台：

```text
版本管理 -> 开发版本
```

6. 设置体验版，扫码真机验证。
7. 确认无问题后，由管理员提交审核。

## 6. 上传方式二：微信开发者工具 CLI

适合本地自动化，但依赖开发者工具登录态和服务端口。

### 6.1 检查登录状态

```bash
/Applications/wechatwebdevtools.app/Contents/MacOS/cli islogin
```

外置盘安装示例：

```bash
/Volumes/outmount/Applications/wechatwebdevtools.app/Contents/MacOS/cli islogin
```

如果未登录，先打开微信开发者工具扫码登录。

### 6.2 打开项目

```bash
/Applications/wechatwebdevtools.app/Contents/MacOS/cli open \
  --project /Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly/miniApp/dist
```

### 6.3 预览

```bash
/Applications/wechatwebdevtools.app/Contents/MacOS/cli preview \
  --project /Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly/miniApp/dist
```

### 6.4 上传

```bash
/Applications/wechatwebdevtools.app/Contents/MacOS/cli upload \
  --project /Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly/miniApp/dist \
  --version 0.1.0 \
  --desc "Kuikly 迁移版：音标地图、学习页、过关检查基础链路"
```

如果 CLI 无响应，优先检查：

1. 微信开发者工具是否已登录。
2. 安全设置里的服务端口是否开启。
3. `project.config.json` 是否在 `dist` 根目录。
4. AppID 是否正确。

## 7. 上传方式三：miniprogram-ci

适合 CI/CD。优点是不依赖开发者工具 GUI 登录态；缺点是要维护上传私钥。

### 7.1 安装依赖

建议在 `kuikly/miniApp` 下单独维护上传脚本：

```bash
cd /Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly/miniApp
npm init -y
npm install miniprogram-ci --save-dev
```

### 7.2 新增上传脚本

示例文件：`tools/upload-miniapp.js`

```js
const ci = require('miniprogram-ci')

const appid = process.env.WX_APPID || 'wx13ea27fa3e736c61'
const version = process.env.WX_VERSION || '0.1.0'
const desc = process.env.WX_DESC || 'Kuikly 迁移版上传'
const privateKeyPath = process.env.WX_PRIVATE_KEY_PATH

if (!privateKeyPath) {
  throw new Error('缺少 WX_PRIVATE_KEY_PATH')
}

const project = new ci.Project({
  appid,
  type: 'miniProgram',
  projectPath: `${__dirname}/../dist`,
  privateKeyPath,
  ignores: [
    'node_modules/**/*',
    '.DS_Store'
  ],
})

ci.upload({
  project,
  version,
  desc,
  setting: {
    es6: false,
    minify: false,
  },
  robot: 1,
}).then((result) => {
  console.log('上传成功:', result)
}).catch((error) => {
  console.error('上传失败:', error)
  process.exit(1)
})
```

### 7.3 执行上传

```bash
cd /Volumes/outmount/code/AndroidCodeLibs/basic-controls/android/basiccontrols/kuikly/miniApp

WX_PRIVATE_KEY_PATH=~/.wechat-miniprogram/private.wx13ea27fa3e736c61.key \
WX_VERSION=0.1.0 \
WX_DESC="Kuikly 迁移版：音标学习基础链路" \
node tools/upload-miniapp.js
```

### 7.4 CI 中的注意点

1. 私钥用 CI Secret 管理，不提交到仓库。
2. 开启 IP 白名单时，CI 机器出口 IP 必须加入微信公众平台白名单。
3. 版本号必须唯一，建议用 `主版本.次版本.构建号`。
4. 上传成功只进入“开发版本”，仍需管理员在公众平台提交审核。

## 8. 发布检查清单

上传前：

- [ ] `:miniApp:copyAssets` 成功。
- [ ] `:shared:packLocalJSBundleRelease` 成功。
- [ ] `:miniApp:jsMiniAppProductionWebpack` 成功。
- [ ] `miniApp/dist/business/nativevue2.js` 存在。
- [ ] `miniApp/dist/lib/miniprogramApp.js` 存在。
- [ ] 微信开发者工具编译无白屏。
- [ ] 真机预览无关键报错。
- [ ] 录音权限和播放权限验证完成。
- [ ] 包体积符合微信小程序限制。
- [ ] 版本号和上传备注已确认。

上传后：

- [ ] 微信公众平台能看到开发版本。
- [ ] 设置体验版并扫码验证。
- [ ] 产品确认主要流程。
- [ ] 管理员提交审核。
- [ ] 审核通过后发布线上版本。

## 9. 常见问题

### 9.1 `business/nativevue2.js` 不存在

说明业务 bundle 没构建成功，先跑：

```bash
./gradlew :shared:packLocalJSBundleRelease -Pkuikly.useLocalKsp=false
```

再跑：

```bash
./gradlew :miniApp:jsMiniAppProductionWebpack
```

### 9.2 `lib/miniprogramApp.js` 不存在

说明 miniApp 渲染 bundle 没构建成功，先跑：

```bash
./gradlew :miniApp:jsMiniAppProductionWebpack
```

### 9.3 Yarn/npm 依赖下载失败

当前项目已提供 `.yarnrc`：

```text
registry "https://registry.npmmirror.com"
```

如果仍失败，检查本机网络或临时改回官方源：

```bash
yarn config set registry https://registry.npmjs.org
```

### 9.4 微信开发者工具 CLI 无响应

通常是服务端口没开或登录态失效：

```text
微信开发者工具 -> 设置 -> 安全设置 -> 服务端口
```

然后重新登录开发者工具。

### 9.5 上传后公众平台看不到版本

检查：

1. AppID 是否是目标小程序。
2. 上传账号是否有权限。
3. CLI 或 `miniprogram-ci` 是否使用了正确项目目录。
4. 是否上传到了第三方平台/插件项目，而不是小程序项目。

## 10. 推荐流程

当前迁移阶段建议采用：

```text
本地构建 -> 微信开发者工具打开 dist -> 真机预览 -> 手动上传 -> 设置体验版
```

等 Kuikly 构建稳定后，再切换到：

```text
CI 构建 -> miniprogram-ci 上传 -> 自动生成体验版 -> 人工验收 -> 提交审核
```

