# 业务路由模块

这一份按业务域拆路由，不按页面标题堆在一起。新增页面时，先确认它属于哪个域，再看应该复用什么布局和原语。

---

## 1. 仪表盘

### 文件

- [`src/routes/app/index.tsx`](../../src/routes/app/index.tsx)
- [`src/routes/app/dashboard.tsx`](../../src/routes/app/dashboard.tsx)

### 作用

- 作为 `/app` 入口和总览页
- 显示概览指标
- 提供常用跳转入口
- 展示最近状态

这类页面通常会同时用到 `PageHeader`、`MetricGrid`、`Panel`、`QuickAction`、`TextList`。

---

## 2. 学习模块

### 文件

- [`src/routes/app/learning/index.tsx`](../../src/routes/app/learning/index.tsx)
- [`src/routes/app/learning/courses.tsx`](../../src/routes/app/learning/courses.tsx)
- [`src/routes/app/learning/progress.tsx`](../../src/routes/app/learning/progress.tsx)

### 作用

- 学习工作区首页
- 课程列表
- 进度页

### 页面处理方式

- 首页页偏入口和概览
- 课程页偏表格和状态
- 进度页偏提醒和进度信号

这里当前还是静态样例数据，重点是验证“学习状态怎么展示”，不是执行学习流程。

---

## 3. 内容模块

### 文件

- [`src/routes/app/content/index.tsx`](../../src/routes/app/content/index.tsx)
- [`src/routes/app/content/packages.tsx`](../../src/routes/app/content/packages.tsx)
- [`src/routes/app/content/packages/new.tsx`](../../src/routes/app/content/packages/new.tsx)
- [`src/routes/app/content/library.tsx`](../../src/routes/app/content/library.tsx)
- [`src/routes/app/content/publishing.tsx`](../../src/routes/app/content/publishing.tsx)
- [`src/routes/app/content/review.tsx`](../../src/routes/app/content/review.tsx)

### 作用

- 内容工作台总览
- 内容包列表
- 新建内容包
- 资源库
- 发布队列
- 审核页

### 页面处理方式

- 总览页用指标和表格
- 列表页用 `Panel + SimpleTable`
- 新建页用动作按钮加检查清单

这个模块适合内容团队、教师或编辑角色。

---

## 4. 账户模块

### 文件

- [`src/routes/app/account/index.tsx`](../../src/routes/app/account/index.tsx)
- [`src/routes/app/account/profile.tsx`](../../src/routes/app/account/profile.tsx)
- [`src/routes/app/account/membership.tsx`](../../src/routes/app/account/membership.tsx)
- [`src/routes/app/account/orders.tsx`](../../src/routes/app/account/orders.tsx)
- [`src/routes/app/account/security.tsx`](../../src/routes/app/account/security.tsx)
- [`src/routes/app/account/sessions.tsx`](../../src/routes/app/account/sessions.tsx)
- [`src/routes/app/account/notifications.tsx`](../../src/routes/app/account/notifications.tsx)

### 作用

- 资料查看和编辑
- 会员信息
- 订单查询
- 安全状态
- 会话管理
- 通知设置

### 页面处理方式

- 首页做个人信息总览
- 资料、会员、订单更偏表格
- 安全页和会话页更偏状态列表和设备列表

---

## 5. 管理模块

### 文件

- [`src/routes/app/admin/index.tsx`](../../src/routes/app/admin/index.tsx)
- [`src/routes/app/admin/users.tsx`](../../src/routes/app/admin/users.tsx)
- [`src/routes/app/admin/content.tsx`](../../src/routes/app/admin/content.tsx)
- [`src/routes/app/admin/licenses.tsx`](../../src/routes/app/admin/licenses.tsx)
- [`src/routes/app/admin/system.tsx`](../../src/routes/app/admin/system.tsx)

### 作用

- 管理控制台
- 用户管理
- 内容审核或管理视图
- 授权概览
- 系统状态

### 页面处理方式

管理页更强调密度和状态，适合表格、指标和面板并排使用。

---

## 6. 设置模块

### 文件

- [`src/routes/app/settings/index.tsx`](../../src/routes/app/settings/index.tsx)
- [`src/routes/app/settings/general.tsx`](../../src/routes/app/settings/general.tsx)
- [`src/routes/app/settings/preferences.tsx`](../../src/routes/app/settings/preferences.tsx)

### 作用

- 设置入口聚合
- 通用设置
- 偏好设置

### 页面处理方式

设置页通常比管理页轻，适合用入口卡片加少量表格。

---

## 7. 写新业务页时的规则

1. 先判定业务域
2. 选对应布局
3. 再选 `PageHeader`、`Panel`、`SimpleTable` 之类的原语
4. 最后才补独立组件
5. 如果某页超过一个屏幕还看不出主任务，先把结构拆清楚再写
