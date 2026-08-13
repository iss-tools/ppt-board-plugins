# plugin-naiveui

[English](./README.md) | [简体中文](./README.zh-CN.md)

基于 TypeScript 和 Rollup 开发 NPM 包的开箱即用模板。

## 特性

- **TypeScript** - 强类型支持，基于 `tsc` 和 `@rollup/plugin-typescript`。
- **Rollup** - 高效的打包工具。
- **多模块格式** - 支持导出 ESM、CJS 和 UMD 格式的代码。
- **Jest** - 预配置的测试框架，包含 jsdom 支持。
- **Babel** - 集成 Babel 以支持降级编译及更好的浏览器兼容性。
- **PostCSS & Less** - 支持在包中直接编写样式。
- **ESLint & Prettier** - 集成 ESLint、Husky 与 lint-staged 以实现提交前的代码语法检查与格式化。
- **Commitlint** - 强制校验 Commit 遵循 Conventional Commits 规范。
- **自动化发版 (release-it)** - 一键化自动完成版本号升级、打 Git Tag、生成 Changelog 以及 npm 发布。

## 开始使用

首先安装依赖：

```bash
pnpm install
```

## 可用脚本

在项目目录中，你可以运行以下命令：

- `pnpm dev`: 启动本地 Vite 游乐场 (Playground)，用于组件的实时开发与 UI 预览。
- `pnpm clean`: 清理 `lib` 输出目录。
- `pnpm build`: 使用 Rollup 编译并打包用于生产环境的代码。生成的产物会存放在 `lib` 目录。
- `pnpm test`: 运行 Jest 单元测试。
- `pnpm coveralls`: 运行测试并收集测试覆盖率数据。
- `pnpm tsc`: 运行 TypeScript 类型检查（不进行打包）。
- `pnpm lint`: 运行 ESLint 检查代码规范。
- `pnpm release`: 启动 `release-it` 交互式命令行，完成版本升级、打 Tag 和发包流程。

## 开发指南

### 提交规范 (Commit Convention)

本项目使用 `commitlint` 强制推行 [Conventional Commits (约定式提交)](https://www.conventionalcommits.org/zh-hans/) 规范。
在提交代码时，你的 Commit Message 必须以特定的前缀开头，并且冒号后面需要有一个空格。常用的前缀包括：

- `feat: 新增某某功能` (新功能)
- `fix: 修复某某bug` (Bug 修复)
- `chore: 更新相关配置` (构建过程或辅助工具的变动)
- `docs: 更新文档说明` (文档修改)

如果不遵循此格式，Git Hook 会拦截并拒绝你的提交。

## 使用指南

1. 在 `src` 文件夹中编写你的组件代码。
2. 运行 `pnpm dev` 启动 `playground/` 目录下的 Vite 服务，在浏览器中实时可视化开发你的 UI 组件。
3. 在 `__tests__/` 目录下编写组件的单元测试，并使用 `pnpm test` 运行它们。
4. 运行 `pnpm build` 进行编译打包。
5. 产出的文件将位于 `lib` 目录中，准备发布。

## 包发布指南

本项目已默认配置将包发布到官方 NPM 仓库。如果你的本地环境使用了淘宝镜像或 CNPM 等只读镜像源，在发版前请务必显式登录官方 NPM 账号：

```bash
npm login --registry=https://registry.npmjs.org/
pnpm release
```

## 开源协议

[MIT](./LICENSE)
