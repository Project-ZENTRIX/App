# 应用壳与导航

这一份只讲应用壳内部的导航和用户交互，不讲业务页面内容。

---

## 1. `app-sidebar.tsx`

文件：[`src/components/app-shell/app-sidebar.tsx`](../../src/components/app-shell/app-sidebar.tsx)

这是侧边栏总装配，负责把三块内容拼起来：

- `TeamSwitcher`
- `NavMain`
- `NavUser`

侧边栏里还定义了团队示例、角色示例和导航数据。它当前做的不是权限校验，而是基于本地角色状态裁剪菜单显示。

---

## 2. `team-switcher.tsx`

文件：[`src/components/app-shell/team-switcher.tsx`](../../src/components/app-shell/team-switcher.tsx)

这是侧边栏里最有状态的模块。

它负责：

- 读取和写入 `localStorage`
- 维护当前团队
- 维护当前角色
- 在切换团队时回退到可用角色
- 通过下拉菜单切换团队和角色

本地存储键：

- `zentrix.active-team`
- `zentrix.active-role`

当前它是本地模拟态，不是正式权限系统。

---

## 3. `nav-main.tsx`

文件：[`src/components/app-shell/nav-main.tsx`](../../src/components/app-shell/nav-main.tsx)

这是主导航渲染器，职责是：

- 渲染一级菜单
- 渲染可折叠分组
- 按角色过滤菜单
- 生成页面链接

它不定义菜单数据，只消费 `app-sidebar.tsx` 传下来的配置。

---

## 4. `nav-user.tsx`

文件：[`src/components/app-shell/nav-user.tsx`](../../src/components/app-shell/nav-user.tsx)

这是用户菜单模块，负责：

- 头像
- 姓名
- 邮箱
- 用户菜单项

其中一些菜单项目前只是界面样板，比如升级、账户、账单、通知、退出。

---

## 5. `nav-projects.tsx`

文件：[`src/components/app-shell/nav-projects.tsx`](../../src/components/app-shell/nav-projects.tsx)

这是一个独立的导航样板，当前没有接入主壳流程。

它展示了：

- 项目列表
- 行内更多操作
- 下拉菜单交互

如果以后需要项目级侧栏，可以参考它，但不要把它误认为当前主业务模块。

---

## 6. 扩展规则

新增导航能力时，优先遵循这条线：

1. 先放到 `app-sidebar.tsx` 的配置层
2. 再决定是否需要新的渲染组件
3. 角色逻辑先走本地裁剪，再考虑接权限后端
4. 能复用 `NavMain` 的结构就不要重写一套
