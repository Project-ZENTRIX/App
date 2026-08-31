# 入口与路由

这一份只讲页面入口和路由结构，不展开布局和业务内容。

---

## 1. 首页路由

文件：[`src/routes/index.tsx`](../../src/routes/index.tsx)

首页是公开区入口，使用 `LightfallBackgroundLayout` 包裹。页面主体是：

- 产品标题
- 动态文案轮播
- 两个入口按钮

这个页面的作用是建立品牌首屏，不承担应用内部功能导航。

---

## 2. 认证路由

文件：

- [`src/routes/auth/login.tsx`](../../src/routes/auth/login.tsx)
- [`src/routes/auth/signup.tsx`](../../src/routes/auth/signup.tsx)
- [`src/routes/auth/forgot-password.tsx`](../../src/routes/auth/forgot-password.tsx)

这三页结构相同：

- 外层 `LightfallBackgroundLayout`
- 中层 `AccountFormsLayout`
- 内层表单组件

页面本身不做复杂状态切换，只负责把表单挂上去，并处理跳转关系。

---

## 3. 应用路由

文件根目录：[`src/routes/app`](../../src/routes/app)

应用区统一由 `AppShellLayout` 承载，所有页面都是 `/app` 下的文件路由。

当前结构分成五个子域：

- 仪表盘：`/app/dashboard`，`/app`
- 学习：`/app/learning/*`
- 内容：`/app/content/*`
- 账户：`/app/account/*`
- 管理：`/app/admin/*`
- 设置：`/app/settings/*`

`/app` 本身是入口页，负责把用户导向更具体的工作区。

---

## 4. 路由实现方式

所有页面都使用 `createFileRoute(...)` 声明。

这意味着：

- 目录结构和 URL 结构保持一致
- 页面文件本身就是路由定义
- 后续新增页面时，优先沿用同样的文件路由写法

如果页面属于某个子域，直接放进对应目录，不要额外造中间层壳。
