# 领域数据模型

这份文档描述 MVP 里应该由 API 管住的核心数据域。它不是完整数据库迁移稿，但要先把域边界切开。

---

## 1. 用户域

核心对象：

- `profiles`
- `user_preferences`
- `notification_preferences`
- `user_audit_logs`
- `user_sessions_snapshot`

职责：

- 个人资料
- 设置
- 通知
- 审计
- 会话视图

---

## 2. 内容域

核心对象：

- `content_packs`
- `courses`
- `chapters`
- `lessons`
- `tasks`
- `content_assets`
- `content_versions`
- `content_releases`

职责：

- 课包目录
- 课程结构
- 发布版本
- 素材和附件
- 发布状态

这个域里既有只读查询，也有编辑和发布写入。

---

## 3. 学习域

核心对象：

- `enrollments`
- `lesson_progress`
- `task_progress` 或等价进度表
- `progress_events`
- `task_submissions`

职责：

- 用户学到哪了
- 某节课是否完成
- 某个任务是否提交
- 进度事件怎么聚合

MVP 里重点是“可展示、可上报、可聚合”，不是一上来就做很复杂的学习引擎。

---

## 4. 商业化域

核心对象：

- `products`
- `orders`
- `order_items`
- `payments`
- `payment_events`
- `subscriptions`

职责：

- 课包购买
- 会员订阅
- 支付状态
- 订单状态流转
- 订阅续费和到期

---

## 5. 授权与设备域

核心对象：

- `licenses`
- `devices`
- `device_bindings`
- `license_events`

职责：

- Desktop 授权
- 设备绑定
- 设备解绑
- 授权状态和历史

---

## 6. 运行与提交域

核心对象：

- `runs`
- `run_logs`
- `judgements`
- `submissions`
- `sandbox_jobs`

职责：

- 代码运行请求
- 运行日志
- 判题结果
- 提交历史
- 沙箱任务状态

---

## 7. 成就与等级域

核心对象：

- `achievements`
- `user_achievements`
- `levels`
- `user_level_progress`

职责：

- 成就展示
- 等级成长
- 进度汇总

这部分可以在 MVP 中先保留表和接口位，不一定一次性做满。

---

## 8. 运维与审计域

核心对象：

- `audit_logs`
- `feature_flags`
- `integration_clients`
- `system_events`

职责：

- 管理操作留痕
- 功能开关
- 外部集成
- 系统事件记录

---

## 9. 设计要求

所有会受租户约束的数据，尽量都带：

- `tenant_id`
- `created_at`
- `updated_at`

所有会受用户所有权约束的数据，尽量都带：

- `user_id`
- `tenant_id`，如属于租户范围

这样后面在 RLS、API 过滤和审计里都容易统一。
