# Project ZENTRIX — API 设计草案

**文档目的**：根据 `proposal.md`、`responsibility.md`、`technicals.md`、`database.md` 与 `web-ui.md` 的范围，设计 Project ZENTRIX 可能需要的 API 领域、资源划分、核心接口与状态模型，作为后续后端实现的接口蓝图。

---

## 1. API 设计目标

API 是 ZENTRIX 的唯一业务与数据权威，承担以下职责：

- 账户体系、会话与权限管理
- 课包、课程、章节、课时与内容资产的下发
- 购买、订单、支付与订阅状态管理
- Desktop 端授权、设备绑定与授权事件管理
- 学习进度、成就、等级与勋章数据的存储与计算
- 审计、限流、通知与基础运维能力

API 不直接承担 Web 页面渲染职责，也不把学习执行逻辑下放给 Web 或 Desktop 端自行裁决。

---

## 2. 设计原则

- **单一权威**：核心业务状态以 API 为准，前端只负责展示和触发请求。
- **领域分层**：按认证、账号、内容、学习、商业化、授权、展示、运维拆分资源。
- **事件与结果分离**：提交、运行、支付、授权等过程事件和最终结果分别建模。
- **只读优先**：Web 端大部分接口以查询为主，写操作集中在账户、购买、绑定、配置类场景。
- **状态显式化**：所有关键对象都返回标准化状态字段，避免前端自行推断。
- **可演进**：为第三方内容入驻、会员扩展、AI 辅助预留扩展字段和版本信息。

---

## 3. 资源总览

### 3.1 认证与会话

- `users`
- `sessions`
- `accounts`
- `verifications`
- `auth-tokens`（如重置密码、邮箱验证、设备绑定等短期令牌）

### 3.2 用户与个人中心

- `profiles`
- `preferences`
- `notifications`
- `audit-logs`

### 3.3 内容与课包

- `courses`
- `chapters`
- `lessons`
- `tasks`
- `content-assets`
- `course-versions`
- `course-releases`

### 3.4 学习过程

- `enrollments`
- `lesson-progress`
- `task-submissions`
- `progress-events`

### 3.5 运行与判题

- `runs`
- `run-logs`
- `judgements`
- `sandbox-jobs`

### 3.6 商业化

- `products`
- `orders`
- `order-items`
- `payments`
- `payment-events`
- `subscriptions`

### 3.7 成就与等级

- `achievements`
- `user-achievements`
- `levels`
- `user-level-progress`

### 3.8 授权与设备

- `desktop-licenses`
- `devices`
- `device-bindings`
- `license-events`

### 3.9 运维与集成

- `feature-flags`
- `integration-clients`
- `audit-logs`

---

## 4. API 分层建议

建议按以下领域划分路由前缀：

- `/api/auth`
- `/api/me`
- `/api/users`
- `/api/courses`
- `/api/products`
- `/api/orders`
- `/api/payments`
- `/api/subscriptions`
- `/api/licenses`
- `/api/devices`
- `/api/progress`
- `/api/achievements`
- `/api/levels`
- `/api/runs`
- `/api/judgements`
- `/api/admin`
- `/api/webhooks`

其中 `me` 面向当前登录用户，`admin` 面向运营与管理角色，`webhooks` 面向外部支付与集成回调。

---

## 5. 认证与会话 API

### 5.1 主要场景

- 注册
- 登录
- 退出登录
- 找回密码
- 重置密码
- 邮箱验证
- 会话刷新
- 当前会话查询
- 第三方账号绑定 / 解绑

### 5.2 建议接口

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/refresh`
- `GET /api/auth/session`
- `GET /api/auth/providers`
- `POST /api/auth/link-account`
- `POST /api/auth/unlink-account`

### 5.3 返回重点

- `user`
- `session`
- `needsEmailVerification`
- `mfaRequired`（如后续启用）
- `expiresAt`
- `providerBindings`

---

## 6. 当前用户与个人中心 API

### 6.1 主要场景

- 拉取当前用户资料
- 更新个人资料
- 修改密码
- 管理偏好设置
- 查看通知偏好
- 查询审计与登录记录

### 6.2 建议接口

- `GET /api/me`
- `PATCH /api/me/profile`
- `PATCH /api/me/password`
- `GET /api/me/preferences`
- `PATCH /api/me/preferences`
- `GET /api/me/notifications`
- `PATCH /api/me/notifications`
- `GET /api/me/audit-logs`
- `GET /api/me/sessions`
- `DELETE /api/me/sessions/:sessionId`

### 6.3 返回重点

- 基础资料：昵称、头像、邮箱、简介、验证状态
- 安全状态：登录方式、最近登录时间、设备数量
- 偏好状态：通知开关、主题偏好、语言偏好

---

## 7. 课包与内容 API

### 7.1 主要场景

- 浏览课包市场
- 查看课包详情
- 查询课程目录
- 查看章节、课时、任务结构
- 拉取内容版本与发布状态
- 查询内容资源元数据

### 7.2 建议接口

- `GET /api/courses`
- `GET /api/courses/:courseId`
- `GET /api/courses/:courseId/chapters`
- `GET /api/chapters/:chapterId/lessons`
- `GET /api/lessons/:lessonId`
- `GET /api/tasks/:taskId`
- `GET /api/content-assets/:assetId`
- `GET /api/courses/:courseId/releases`
- `GET /api/courses/:courseId/versions`

### 7.3 常用查询参数

- `keyword`
- `category`
- `language`
- `difficulty`
- `status`
- `sort`
- `page`
- `pageSize`

### 7.4 返回重点

- 课包标题、封面、简介、标签、难度、价格
- 是否已购买、是否可学习、是否已下架
- 内容目录预览与解锁范围
- 关联商品与版本号

---

## 8. 购买、订单与支付 API

### 8.1 主要场景

- 创建课包订单
- 创建会员订单
- 查询订单列表
- 查看订单详情
- 继续支付
- 取消订单
- 查询支付状态
- 接收支付回调

### 8.2 建议接口

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:orderId`
- `POST /api/orders/:orderId/cancel`
- `POST /api/orders/:orderId/pay`
- `GET /api/orders/:orderId/payment-status`
- `GET /api/products`
- `GET /api/products/:productId`
- `POST /api/payments`
- `GET /api/payments/:paymentId`
- `POST /api/webhooks/payments`

### 8.3 订单响应重点

- `orderId`
- `orderNo`
- `orderType`
- `status`
- `amount`
- `currency`
- `items`
- `paymentStatus`
- `expiresAt`
- `canPay`
- `canCancel`

### 8.4 支付状态建议

- `initiated`
- `processing`
- `succeeded`
- `failed`
- `reversed`

---

## 9. 会员与订阅 API

### 9.1 主要场景

- 查看当前会员状态
- 查询会员方案
- 创建订阅订单
- 续费
- 取消自动续费（若支持）
- 查看订阅历史

### 9.2 建议接口

- `GET /api/subscriptions/current`
- `GET /api/subscriptions`
- `POST /api/subscriptions`
- `POST /api/subscriptions/:subscriptionId/renew`
- `POST /api/subscriptions/:subscriptionId/cancel-autorenew`
- `GET /api/subscriptions/:subscriptionId`

### 9.3 返回重点

- 会员档位
- 生效时间与到期时间
- 自动续费状态
- 权益列表
- 关联订单信息

---

## 10. 授权与设备 API

### 10.1 主要场景

- 查看桌面端授权状态
- 绑定设备
- 解绑设备
- 查询设备列表
- 查询授权历史
- 处理授权异常

### 10.2 建议接口

- `GET /api/licenses/current`
- `POST /api/licenses/activate`
- `POST /api/licenses/deactivate`
- `GET /api/licenses/events`
- `GET /api/devices`
- `GET /api/devices/:deviceId`
- `POST /api/devices/bind`
- `POST /api/devices/:deviceId/unbind`
- `GET /api/device-bindings`

### 10.3 返回重点

- `licenseStatus`
- `licenseScope`
- `deviceLimit`
- `boundDevices`
- `lastActivatedAt`
- `expiresAt`
- `bindingCode`
- `bindingExpiresAt`

---

## 11. 学习进度 API

### 11.1 主要场景

- Web 控制台展示只读进度
- Desktop 上报进度事件
- 查询课程、章节、课时维度进度
- 查询最近同步记录

### 11.2 建议接口

- `GET /api/progress/overview`
- `GET /api/progress/enrollments`
- `GET /api/progress/courses/:courseId`
- `GET /api/progress/lessons/:lessonId`
- `POST /api/progress/events`
- `GET /api/progress/events`

### 11.3 返回重点

- `notStarted`
- `inProgress`
- `submitted`
- `passed`
- `failed`
- `completed`
- `completionRate`
- `lastSyncedAt`
- `lastUpdatedAt`

### 11.4 事件写入说明

- Desktop 端负责上报进度事件
- API 负责校验、聚合与最终落库
- Web 端只读取聚合结果，不直接写进度

---

## 12. 成就与等级 API

### 12.1 主要场景

- 查询成就列表
- 查询用户成就
- 查询等级定义
- 查询用户等级进度
- 查询勋章墙展示数据

### 12.2 建议接口

- `GET /api/achievements`
- `GET /api/achievements/:achievementId`
- `GET /api/me/achievements`
- `GET /api/levels`
- `GET /api/me/level-progress`

### 12.3 返回重点

- 成就名称、图标、说明、稀有度
- 是否已解锁、达成时间
- 当前等级、经验值、下一等级目标
- 勋章展示顺序与分组

---

## 13. 运行与判题 API

### 13.1 主要场景

- Desktop 发起运行请求
- API 创建沙箱任务
- 查询运行日志
- 查询判题结果
- 上报提交记录

### 13.2 建议接口

- `POST /api/runs`
- `GET /api/runs`
- `GET /api/runs/:runId`
- `GET /api/runs/:runId/logs`
- `POST /api/submissions`
- `GET /api/submissions`
- `GET /api/submissions/:submissionId`
- `GET /api/judgements/:judgementId`
- `POST /api/webhooks/sandbox`

### 13.3 返回重点

- `runId`
- `submissionId`
- `sandboxJobId`
- `status`
- `stdout`
- `stderr`
- `result`
- `score`
- `durationMs`
- `resourceUsage`

---

## 14. 管理与运维 API

### 14.1 主要场景

- 管理课包、商品、内容版本
- 查看审计日志
- 管理功能开关
- 管理外部集成

### 14.2 建议接口

- `GET /api/admin/courses`
- `POST /api/admin/courses`
- `PATCH /api/admin/courses/:courseId`
- `GET /api/admin/products`
- `PATCH /api/admin/products/:productId`
- `GET /api/admin/audit-logs`
- `GET /api/admin/feature-flags`
- `PATCH /api/admin/feature-flags/:flagKey`
- `GET /api/admin/integration-clients`

### 14.3 权限要求

- 仅管理员或运营角色可访问
- 所有写操作必须记录审计日志
- 所有敏感配置变更应保留操作者与时间戳

---

## 15. Webhook 与回调 API

### 15.1 场景

- 支付结果回调
- 订单状态更新
- 授权状态同步
- 第三方集成事件接收

### 15.2 建议接口

- `POST /api/webhooks/payments`
- `POST /api/webhooks/licenses`
- `POST /api/webhooks/integrations/:clientKey`

### 15.3 设计要求

- 需要签名校验
- 需要幂等处理
- 需要保留原始事件与处理结果
- 需要支持重放与排障

---

## 16. 通用响应模型

建议统一使用以下响应风格：

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

### 16.1 错误响应建议

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ORDER_ALREADY_PAID",
    "message": "订单已支付",
    "details": {}
  },
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

### 16.2 分页响应建议

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "total": 0
  },
  "error": null,
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

---

## 17. 状态模型建议

### 17.1 认证状态

- `anonymous`
- `authenticated`
- `sessionExpired`
- `emailUnverified`

### 17.2 订单状态

- `pending`
- `paid`
- `failed`
- `cancelled`
- `refunded`

### 17.3 订阅状态

- `active`
- `grace`
- `expired`
- `cancelled`

### 17.4 授权状态

- `active`
- `suspended`
- `revoked`
- `expired`

### 17.5 设备状态

- `bound`
- `unbound`
- `inactive`
- `blocked`

### 17.6 进度状态

- `not_started`
- `in_progress`
- `submitted`
- `passed`
- `failed`
- `completed`

---

## 18. 与 Web UI 的对应关系

Web 端页面所需数据基本都能映射到以下 API 族：

- 登录 / 注册 / 找回密码：`/api/auth`
- 控制台与个人中心：`/api/me`
- 课包市场与详情：`/api/courses`、`/api/products`
- 我的课包：`/api/me`、`/api/progress`
- 会员中心：`/api/subscriptions`
- 订单中心：`/api/orders`、`/api/payments`
- 设备与授权：`/api/licenses`、`/api/devices`
- 成就与进度：`/api/achievements`、`/api/levels`、`/api/progress`

这样可以保证 Web 端 UI 结构和后端接口边界保持一致，不会出现页面需要的数据散落在多个不相关接口里的情况。

---

## 19. 待进一步明确的事项

- 是否继续沿用现有自实现认证接口，还是在项目层再包一层统一认证 API
- 课包与商品的边界是否固定为一层或可多对多映射
- Desktop 授权是否需要离线宽限期、设备上限和撤销冷却期
- 支付接入爱发电后能稳定提供哪些回调与查询能力
- 进度事件是否需要细化到步骤级或检查点级
- 成就与等级是否在 MVP 阶段就开放全部读接口
- 管理端接口是否与 Web 公共接口分包维护

---

_本文档为 API 设计草案，后续将根据具体实现、鉴权方案与支付接入能力继续补充。_
