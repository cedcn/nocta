# Android 发布

打包由 `scripts/release-android.sh` 负责，上传 Google Play 由 fastlane 负责。fastlane 不直接调 gradle，而是调用这条脚本，这样签名检查、prebuild、签名校验都不会被绕过。

## 命令

| 命令 | 作用 |
| --- | --- |
| `pnpm keystore:android` | 生成上传签名 keystore（一个应用只跑一次，已存在会拒绝覆盖） |
| `pnpm release:android` | 本地出签名 APK（可直接安装） |
| `pnpm release:android:aab` | 本地出签名 AAB |
| `pnpm play:doctor` | 不构建：验证 Play 凭据，打印各轨道 versionCode 与下一个号 |
| `pnpm play:internal` | 构建并上传内部测试轨 |
| `pnpm play:alpha` | 构建并上传封闭测试轨 |
| `pnpm play:testing` | 同一个包同时上内部测试 + 封闭测试 |
| `pnpm play:production` | 构建并直接上传生产轨 |
| `pnpm play:promote` | 把内部测试轨上最新的包原样推到生产轨，不重新构建 |

更多参数直接调 fastlane：

```bash
bundle exec fastlane android release track:production rollout:0.1   # 分阶段发布 10%
bundle exec fastlane android release aab:android/app/build/outputs/bundle/release/nocta-1.0.0-5-202609231200.aab  # 上传失败后重传，不重新构建
bundle exec fastlane android promote from:alpha to:production version_code:5
```

产物位于 `android/app/build/outputs/{apk,bundle}/release/`，命名为 `nocta-<versionName>-<versionCode>-<时间>.{apk,aab}`。

## 首次准备

### 1. Ruby 依赖

```bash
bundle install   # fastlane 版本锁在 Gemfile
```

### 2. 签名

`release.keystore` 与 `keystore.properties` 放在仓库根目录（都已 gitignore，**务必另外备份**，丢了就无法再更新 Play 上的应用）：

```bash
cp keystore.properties.example keystore.properties   # 填 keyAlias / storePassword / keyPassword
pnpm keystore:android                                # 仅在还没有 release.keystore 时
```

也可以用环境变量 `NOCTA_KEY_ALIAS` / `NOCTA_KEYSTORE_PASSWORD` / `NOCTA_KEY_PASSWORD` 代替。

签名信息缺失时 gradle 插件会静默退回 debug keystore，所以脚本在构建前会检查，缺了直接退出；出 AAB 后还会比对包的证书指纹与 `release.keystore` 是否一致。

### 3. Google Play service account

1. 在 Play 开发者账号关联的 Google Cloud 项目里创建 service account，下载 JSON key
2. Play Console → **用户和权限** → 邀请该 service account 的邮箱，授予 `com.nocta.app` 的发布权限
3. 把 key 放到 `config/play-store/play-store-service-account.json`（已 gitignore）
   - 或 `export GOOGLE_PLAY_JSON_KEY_PATH=/path/to/key.json`
   - CI 上设 `GOOGLE_PLAY_JSON_KEY_DATA` 为 JSON 内容
4. `pnpm play:doctor` 验证

刚授权后出现 403 是权限还没生效（几分钟到几小时），等着就行，不要重新生成 key。`validate_play_store_json_key` 会吞掉自己的异常，所以 doctor 真正的检查是后面的轨道查询。

Google 要求第一个包必须在 Play Console 网页上手动上传，之后 fastlane 才能接管。

## versionCode

不需要手动改。

- **走 fastlane**：查询 Play 上所有轨道的最大 versionCode，与本地记录取较大者 +1，构建成功后写回 `.env.release`
- **本地出包**（`release:android*`）：取 `.env.release` 里上一次用掉的号与 `app.json` 里 `android.versionCode` 的较大者 +1，gradle 成功后写回
- **CI**：`export ANDROID_VERSION_CODE=<构建号>` 原样使用，不写回

号经 `app.config.ts` 在 prebuild 时注入。`app.json` 里的 `versionCode` 只作为日常构建的默认值和下限。`versionName` 改 `app.json` 的 `version`。

## 其他

- 商店文案和截图仍在 Play Console 维护，fastlane 所有 `skip_upload_*` 都打开了，只负责上传二进制
- AAB 不能直接安装，通过内部测试轨的分享链接测试
- 若上传因为有待审核的变更而失败，可给 `upload_to_play_store` 加 `changes_not_sent_for_review: true`
