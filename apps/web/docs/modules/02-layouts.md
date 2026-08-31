# 布局层

布局层只负责页面外壳，不负责具体业务内容。当前 Web 子项目里有三层布局最重要：首页背景、认证页布局、应用壳。

---

## 1. `LightfallBackgroundLayout`

文件：[`src/layouts/lightfall-background.tsx`](../../src/layouts/lightfall-background.tsx)

这个布局提供首页和认证页共用的背景容器，结构是：

- 固定全屏的 `Lightfall` 背景层
- 前景内容层
- 轻微模糊处理

适用场景：

- 公开首页
- 登录页
- 注册页
- 找回密码页

不适用场景：

- 应用区高密度管理页面
- 需要强表格密度的工作台

---

## 2. `AccountFormsLayout`

文件：[`src/layouts/account-forms.tsx`](../../src/layouts/account-forms.tsx)

这个布局是认证页的表单壳，结构是左右双栏：

- 左侧：Logo、表单、交互内容
- 右侧：保留区，目前为空

它的核心作用是把表单宽度固定住，避免认证页的视觉噪音扩大。

适用场景：

- 登录
- 注册
- 找回密码

---

## 3. `AppShellLayout`

文件：[`src/layouts/app-shell.tsx`](../../src/layouts/app-shell.tsx)

这是 `/app/*` 的统一壳层，负责：

- 左侧侧边栏
- 顶部栏和面包屑
- 主内容区域

它只定义壳，不直接写业务页面。业务展示都放在对应的路由文件里。

---

## 4. 布局选型规则

新增页面时先判断属于哪一层：

- 品牌和入口页，优先 `LightfallBackgroundLayout`
- 认证流程页，优先 `LightfallBackgroundLayout + AccountFormsLayout`
- 登录后工作台页，优先 `AppShellLayout`

如果页面不属于这三类，先不要硬塞，先判断是否需要新布局模块。
