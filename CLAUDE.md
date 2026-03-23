# CLAUDE.md

- expo/react-native 项目

## 代码规范

- 大多数清晰的代码不要添加注释
- 仅在代码难以理解的地方写注释，说明 why
- 注释使用英文
- 不可以直接修改生成的 ios/android 目录下的任何文件

## npm add

- 优先选择 expo 的包
- 不要使用太老的包，检查最后更新时间
- 使用 npx expo install 来安装，保证兼容性

## 工作方式

- 仅仅修改代码、运行 lint、typecheck
- npm run ios/prebuild 这些命令，不要自作主张执行，但如果我主动要求则照做
