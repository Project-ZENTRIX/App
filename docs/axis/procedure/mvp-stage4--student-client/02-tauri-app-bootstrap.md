# 02 - Tauri App 子应用初始化

**文档目的**：说明如何在当前 monorepo 中初始化新的 Tauri 学生客户端子 app，并把它接入共享包、开发脚本和后续构建流程。

**选型**：Tauri App + React + TypeScript。

---

## 1. 初始化目标

新的桌面端不应直接塞进现有 Web 项目里，而应作为独立子 app 放进 `apps/desktop`。

这样做的好处是：

- 桌面壳层、前端页面和 Rust 侧配置可以独立演进
- 开发脚本和构建脚本不会污染 Web
- 后续可以单独接入桌面插件、文件系统能力和本地存储
- shared packages 仍可复用 `packages/ui`、类型定义和工具函数

---

## 2. 推荐目录

```text
apps/
  api/
  web/
  desktop/
    src/
    src-tauri/
    package.json
    vite.config.ts
    tsconfig.json
```

其中：

- `src/` 放 React 前端界面
- `src-tauri/` 放 Tauri Rust 壳层与配置
- `package.json` 负责桌面端脚本
- `vite.config.ts` 负责前端开发服务器和构建配置

---

## 3. 初始化方式

### 3.1 新建目录

先在仓库里创建桌面端目录：

```bash
mkdir -p apps/desktop
cd apps/desktop
```

### 3.2 使用 create-tauri-app 初始化

Tauri 官方推荐使用 `create-tauri-app` 作为起步方式。初始化时选择：

- frontend language: TypeScript / JavaScript
- package manager: pnpm
- UI template: React
- UI flavor: TypeScript

可直接使用官方脚本启动交互式初始化：

```bash
sh <(curl https://create.tauri.app/sh)
```

如果当前环境不方便交互式创建，也可以先用前端脚手架建壳，再执行 Tauri CLI 手动初始化。

### 3.3 手动初始化路径

如果我们希望更严格地控制 monorepo 目录结构，建议采用“先建前端，再补 Tauri 后端”的方式：

```bash
pnpm create vite@latest .
```

随后安装 Tauri CLI，并初始化 Tauri：

```bash
pnpm add -D @tauri-apps/cli@latest
npx tauri init
```

初始化时重点填写：

- app name
- window title
- frontend dist or dev server url
- frontend dev command
- frontend build command

---

## 4. 开发脚本建议

桌面端 `package.json` 建议至少具备这些脚本：

- `dev`：启动前端开发服务器
- `tauri:dev`：启动桌面开发窗口
- `build`：构建前端产物
- `tauri:build`：打包桌面应用
- `lint`：检查前端代码
- `typecheck`：类型检查

示意：

```json
{
  "scripts": {
    "dev": "vite",
    "tauri:dev": "tauri dev",
    "build": "vite build",
    "tauri:build": "tauri build",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 5. 开发联动

Tauri 官方开发流程要求前端开发服务器与桌面壳层联动。

建议在 Tauri 配置里明确：

- `build.devUrl` 指向前端 dev server
- `build.beforeDevCommand` 指向前端启动命令

示意：

```json
{
  "build": {
    "devUrl": "http://127.0.0.1:3000",
    "beforeDevCommand": "pnpm dev"
  }
}
```

如果前端已经由 Vite 或同类工具接管，这一层配置应该只负责把桌面窗口挂到前端 dev server 上，而不是另起一套前端启动逻辑。

---

## 6. 与共享包的关系

桌面端应优先复用：

- `packages/ui`：基础组件和视觉规范
- `packages/typescript-config`：TypeScript 基础配置
- `packages/eslint-config`：代码风格
- 未来的共享 types、api client、content schema 包

原则上，桌面端只拥有自身特有的窗口壳层、Tauri 配置和本地能力封装。

---

## 7. Rust 侧边界

`src-tauri` 只负责：

- 窗口启动和生命周期
- 权限、文件系统和原生能力桥接
- 插件注册
- 打包与平台配置

业务逻辑、学习状态、内容渲染和页面交互仍留在 React 侧或共享 TypeScript 层。

---

## 8. 初始化验收

- `apps/desktop` 成为独立子 app，不和 `apps/web` 混用。
- `pnpm dev` / `pnpm tauri:dev` 有明确职责。
- Tauri 壳层能正常拉起前端页面。
- 能在桌面窗口中看到 React 页面并继续做后续开发。

_本文档冻结新桌面子 app 的起步方式，后续工作台和同步设计都以此为基础。_
