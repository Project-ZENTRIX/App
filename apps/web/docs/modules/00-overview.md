# 总体说明

本文档描述 `apps/web` 的整体边界和启动链路。这里不讲每个页面怎么画，只讲 Web 子项目由哪些层组成，以及这些层之间如何衔接。

---

## 1. 子项目边界

`apps/web` 是 ZENTRIX 的前端 Web 应用，当前包含三类界面：

- 公开首页 `/`
- 认证流程 `/auth/*`
- 登录后应用区 `/app/*`

技术栈以 Vite + React 19 + TanStack Router + TypeScript 为主，页面层配合 `@shared/ui`、`@shared/i18n`、`next-themes`、`lucide-react` 和少量本地模块完成。

页面中的很多数据仍是静态样例，主要用于固定布局、状态和文案结构，不应视为后端已接通的真实业务值。

---

## 2. 目录总览

最重要的目录是：

- `src/main.tsx`：浏览器入口
- `src/router.tsx`：路由器
- `src/routes`：文件路由
- `src/layouts`：页面布局
- `src/components`：页面级组件和表单
- `src/lib`：页面原语
- `src/assets`：本地样式

`tsconfig.json` 里把 `$/` 指到 `src/`，所以内部导入会大量使用 `$/layouts/...`、`$/lib/...` 这种写法。

---

## 3. 启动链路

### 3.1 `src/main.tsx`

这里完成三件事：

1. 初始化 i18n
2. 挂载 React 根节点
3. 渲染路由器

应用先调用 `initI18n("zh-CN")`，再把 `RouterProvider` 挂到 `#root`。

### 3.2 `src/router.tsx`

这里创建 TanStack Router 实例，负责：

- 接收生成好的 `routeTree`
- 开启 `defaultPreload: "intent"`
- 打开 `scrollRestoration`
- 暴露路由类型注册

这一层不包含页面逻辑，只负责路由器设置。

### 3.3 `src/routes/__root.tsx`

这是全局根壳，负责注入：

- `ThemeProvider`
- `I18nextProvider`
- `TooltipProvider`
- 开发环境下的 `TanStackRouterDevtools`

如果将来要加全局级别能力，优先看这里，而不是塞到具体页面里。

---

## 4. 文档拆分原则

后续如果想找某个具体内容，不要在一份长文里翻。直接按模块找：

- 入口和路由，看 [入口与路由](01-entry-router.md)
- 布局，看 [布局层](02-layouts.md)
- 侧边栏和顶部壳，看 [应用壳与导航](03-app-shell.md)
- 登录注册，看 [表单模块](04-form-modules.md)
- 通用卡片、表格和标题，看 [页面原语](05-page-primitives.md)
- 某个业务页，看 [业务路由模块](06-feature-routes.md)
- 主题、翻译和样式，看 [国际化、主题与样式](07-i18n-theme-styles.md)
