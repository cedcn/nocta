# Fastlane Android 发布指南

通过 Fastlane 自动构建并发布 Android 应用到 Google Play。

## 前置条件

- Ruby 环境（macOS 自带）
- Google Play 开发者账号
- 应用已在 Google Play Console 中手动上传过一次（Google 要求首次上传必须通过网页控制台完成）

## 初始化

### 1. 安装依赖

```bash
gem install bundler
bundle install
```

### 2. 配置 Google Play 服务账号

Fastlane 需要一个 Google Cloud 服务账号来调用 Google Play API。

1. 打开 [Google Play Console](https://play.google.com/console) → **设置** → **API 访问权限**
2. 关联或创建一个 Google Cloud 项目
3. 点击 **创建服务账号**，跳转到 Google Cloud Console
4. 创建服务账号，角色选择 **Service Account User**
5. 在服务账号详情页 → **密钥** → **添加密钥** → **创建新密钥** → 选择 JSON 格式下载
6. 回到 Google Play Console，点击 **刷新服务账号**，找到刚创建的账号
7. 点击 **授予访问权限**，权限选择 **管理员** 或 **发布管理员**
8. 将下载的 JSON 密钥文件保存为 `fastlane/google-play-key.json`

> 该文件已加入 `.gitignore`，不会被提交到仓库。

也可以通过环境变量指定密钥路径：

```bash
export GOOGLE_PLAY_JSON_KEY=/path/to/your/key.json
```

### 3. 签名配置

项目已配置好 release 签名，确保以下文件存在：

- `release.keystore` — 项目根目录
- `keystore.properties` — 项目根目录（参考 `keystore.properties.example`）

或者通过环境变量设置：

```bash
export NOCTA_KEY_ALIAS=nocta-release
export NOCTA_KEYSTORE_PASSWORD=your-password
export NOCTA_KEY_PASSWORD=your-password
```

## 发布命令

每个命令会自动执行：`expo prebuild --clean` → Gradle 构建 AAB → 上传到对应 Google Play 轨道。

```bash
# 内部测试（推荐首先使用，仅邀请的测试人员可见）
bundle exec fastlane android internal

# 封闭式测试（Alpha）
bundle exec fastlane android alpha

# 公开测试（Beta）
bundle exec fastlane android beta

# 正式发布
bundle exec fastlane android production
```

如果只想构建不上传：

```bash
bundle exec fastlane android build
```

构建产物位于 `android/app/build/outputs/bundle/release/app-release.aab`。

## 文件说明

```
Gemfile                           # Ruby 依赖声明
fastlane/
├── Appfile                       # 包名 + 服务账号密钥路径
├── Fastfile                      # Lane 定义（构建和发布逻辑）
└── google-play-key.json          # Google Play 服务账号密钥（gitignored）
```

## 版本号管理

发布新版本前需要更新版本号，修改 `android/app/build.gradle` 中的：

- `versionCode` — 每次上传必须递增（整数）
- `versionName` — 用户可见的版本号（如 `1.1.0`）

由于 `android/` 目录由 `expo prebuild` 生成，建议在 `app.json` 中管理版本：

```json
{
  "expo": {
    "version": "1.1.0",
    "android": {
      "versionCode": 2
    }
  }
}
```

## 常见问题

### 首次上传报错

Google Play 要求第一个 AAB/APK 必须通过网页控制台手动上传。完成后 Fastlane 才能管理后续版本。

### 服务账号权限不足

确保在 Google Play Console 中给服务账号授予了足够的权限（至少需要「发布管理员」权限），并且权限已生效（可能需要等待几分钟）。

### versionCode 冲突

每次上传到 Google Play 的 `versionCode` 必须大于之前所有上传过的版本。如果报错，请递增 `app.json` 中的 `android.versionCode`。
