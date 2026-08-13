# Project ZENTRIX — 数据库设计（Database）

**文档版本**：初始版
**日期**：2026-08-06
**状态**：草案

本文档描述 Project ZENTRIX 的数据库设计原则、核心实体、关系约束与演进方向，聚焦于 PostgreSQL + Prisma 连接的数据建模方式，不展开具体 SQL 实现。

---

## 1. 设计目标

- 支撑 `proposal.md` 定义的学习型产品目标与商业化路径。
- 服务 `responsibility.md` 中定义的三端职责边界，确保 API 是唯一业务与数据权威。
- 与 `technicals.md` 中的 NestJS + PostgreSQL + Prisma 连接技术选型一致。
- 为后续内容扩展、第三方内容入驻、桌面端授权与判题演进预留空间。

---

## 2. 设计原则

- **单一权威**：所有核心业务状态都由 API 写入与裁决，前端不直接改写数据库。
- **领域分层**：账号、内容、学习、运行、商业化、授权、审计分组建模，避免表结构互相缠绕。
- **强约束优先**：优先使用外键、唯一约束、检查约束与枚举状态，减少依赖应用层兜底。
- **事件与结果分离**：提交、运行、判题、支付等过程数据与最终结果分开存储，便于追踪与重放。
- **可演进**：内容版本化、商品版本化、授权策略可扩展，避免第一版锁死业务形态。
- **审计可追溯**：关键状态变更保留时间戳、操作者与来源信息。

---

## 3. 核心实体总览

### 3.1 账号与权限

- `user`：用户主表，采用项目自实现 Auth 的用户结构。
- `session`：登录会话表。
- `account`：第三方账号、密码凭据与提供方绑定表。
- `verification`：邮箱验证、重置令牌等短期验证记录。
- `user_profiles`：用户扩展资料。
- `roles`、`user_roles`：角色与角色绑定。
- `devices`：用户设备信息。

### 3.2 内容与课包

- `courses`：课程主实体。
- `chapters`：课程章节。
- `lessons`：课时或学习单元。
- `tasks` / `exercises`：练习、题目或需要提交的学习任务。
- `test_cases`：判题用测试数据。
- `content_assets`：静态资源、附件与元数据。

### 3.3 学习过程

- `enrollments`：用户与课包或课程的学习关系。
- `lesson_progress`：课时维度进度。
- `task_submissions`：提交记录。
- `progress_events`：学习过程事件流。

### 3.4 运行与判题

- `runs`：代码运行请求。
- `run_logs`：运行日志。
- `judgements`：判题结果。
- `sandbox_jobs`：沙箱任务与状态机信息。

### 3.5 商业化

- `products`：售卖商品。
- `orders`：订单主表。
- `order_items`：订单明细。
- `subscriptions`：会员或订阅关系。
- `payments`：支付流水。
- `payment_events`：支付回调与状态变化事件。

### 3.6 成就与授权

- `achievements`：成就定义。
- `user_achievements`：用户成就达成记录。
- `levels`：等级定义。
- `user_level_progress`：等级进度。
- `desktop_licenses`：桌面端授权记录。
- `device_bindings`：设备绑定关系。
- `license_events`：授权变化历史。

### 3.7 运维与审计

- `audit_logs`：审计日志。
- `integration_clients`：外部集成客户端。
- `feature_flags`：功能开关。

---

## 4. 领域模型

### 4.1 账号与权限

账号体系以项目自实现 Auth 的 `user`、`session`、`account`、`verification` 四张表为基础，其中：

- `user` 保存用户主身份信息，包含名称、邮箱、头像与邮箱验证状态。
- `session` 保存登录会话、过期时间与客户端上下文。
- `account` 保存外部身份提供方绑定信息，以及密码凭据等认证数据。
- `verification` 保存一次性验证记录，例如邮箱验证与重置流程。

`user_profiles` 保存展示型资料，`roles` 与 `user_roles` 支持后续权限扩展。会话类数据与用户主表分离，便于失效、撤销与多设备登录控制。设备信息单独建模，避免把终端属性塞进用户主表。

### 4.2 内容与课包

内容建议以 `courses -> chapters -> lessons -> tasks` 的层级组织。

- `courses` 定义课程集合与发布状态。
- `chapters` 和 `lessons` 负责内容结构。
- `tasks` 或 `exercises` 负责需要编写、运行、提交的学习单元。
- `test_cases` 独立存放判题用例，便于复用与版本演进。

课包与课程内容应解耦。售卖单元不必强绑定唯一课程树，而应通过版本化关联内容快照，方便后续开放第三方内容入驻。

### 4.3 学习过程

学习关系与学习状态应分开：

- `enrollments` 表示用户已获得某个课包或课程的学习资格。
- `lesson_progress` 记录课时级推进状态。
- `task_submissions` 保存每一次提交，不覆盖历史。
- `progress_events` 记录可追溯的状态变化，用于回放、分析与排查。

这样可以把“当前进度”和“历史行为”分离，避免后期做统计时只能依赖快照值。

### 4.4 运行与判题

运行与判题建议按流程拆开：

- `runs` 记录一次运行或提交触发的执行请求。
- `sandbox_jobs` 记录沙箱任务状态、重试、排队与资源限制信息。
- `run_logs` 保存执行输出。
- `judgements` 保存最终判题结论。

执行过程不应直接覆盖提交记录。提交是事实，运行和判题是围绕事实产生的后续结果。

### 4.5 商业化

商业化建议采用“商品 - 订单 - 支付 - 订阅”分层：

- `products` 表达可售卖对象。
- `orders` 是业务单据。
- `order_items` 记录订单中具体买了什么。
- `payments` 记录支付流水。
- `payment_events` 保留外部支付回调与状态流转。
- `subscriptions` 记录持续性权益，例如会员。

订单与支付分离后，才能兼容“创建订单成功但支付失败”这类常见情况。

### 4.6 成就与授权

成就、等级与授权都建议采用“定义表 + 用户结果表”的方式。

- `achievements`、`levels` 保存规则定义。
- `user_achievements`、`user_level_progress` 保存用户结果。
- `desktop_licenses`、`device_bindings`、`license_events` 管理桌面端授权。

授权与设备绑定不要混在用户表里，否则后续撤销、换机、离线宽限期都会变复杂。

### 4.7 审计与运维

`audit_logs` 用于记录关键操作，`integration_clients` 管理外部集成访问，`feature_flags` 支撑灰度和阶段性开关。

---

## 5. 关键关系与约束

- `user` 是全局主实体，所有核心业务表都应通过 `user_id` 回指它。
- `session`、`account`、`verification` 是认证域的基础表，应与业务域解耦。
- `courses`、`chapters`、`lessons`、`tasks` 形成层级外键链，父级删除策略应谨慎处理。
- `task_submissions`、`runs`、`judgements` 应允许多次历史记录，不能只保留最后一次。
- `orders` 与 `order_items` 采用一对多关系，`payments` 可对应一个或多个支付事件。
- `subscriptions` 应与 `users`、`products` 或 `orders` 建立明确关联，避免权益来源不清。
- `desktop_licenses` 与 `device_bindings` 必须可追溯到具体用户和时间点。

建议在 PostgreSQL 层显式使用以下约束：

- 唯一约束：邮箱、外部身份标识、认证 token、订单号、支付流水号、设备标识等。
- 外键约束：核心业务关系必须落库约束，而不是只靠代码检查。
- 检查约束：状态枚举、数量范围、时间先后关系等。
- 索引：所有高频查询键都应显式建索引，特别是 `user_id`、`course_id`、`order_id`、`task_id`、`status`、`created_at`。

---

## 6. 状态机建议

### 6.1 学习进度状态

- `not_started`
- `in_progress`
- `submitted`
- `passed`
- `failed`
- `completed`

### 6.2 订单状态

- `pending`
- `paid`
- `failed`
- `cancelled`
- `refunded`

### 6.3 支付状态

- `initiated`
- `processing`
- `succeeded`
- `failed`
- `reversed`

### 6.4 沙箱任务状态

- `queued`
- `running`
- `succeeded`
- `failed`
- `timeout`
- `cancelled`

### 6.5 授权状态

- `active`
- `suspended`
- `revoked`
- `expired`

---

## 7. 版本与历史策略

- 课程内容、课包和测试用例建议版本化，避免发布后直接覆盖历史数据。
- 订单、支付、提交、运行和审计数据不做硬覆盖，优先追加历史记录。
- 对于规则可能变化的模块，保留生效版本号或规则快照，便于复盘历史行为。

---

## 8. 索引与性能建议

- 高频读取路径围绕用户、课包、课程、任务、订单和提交展开，应优先建复合索引。
- 长表如提交记录、运行日志、支付事件、审计日志建议按时间字段分区或预留归档策略。
- JSONB 只适合放扩展字段，不建议承载核心查询路径。
- 所有大对象文件应走独立资源表或对象存储引用，不直接把二进制内容塞入主业务表。

---

## 9. 与 NestJS 的映射建议

- 数据访问层应以仓储或服务边界封装 Prisma 调用，避免业务层散落 SQL。
- 事务应围绕订单、支付、进度推进、判题结果写入等强一致场景明确划分。
- 领域事件适合用于 `progress_events`、`payment_events`、`audit_logs` 这类可追溯数据。
- 数据库迁移与种子数据应与后端项目同步管理，避免表结构与代码版本漂移。

---

## 10. 待进一步明确的事项

- 认证方案已确定为项目自实现 Auth 的 `user`、`session`、`account`、`verification` 结构，后续只需明确是否扩展设备与 refresh token 表。
- 课包与课程的售卖单元边界是否固定在某一层级。
- 学习进度是否需要细化到步骤级或检查点级。
- 沙箱执行是否需要更细的资源配额、重试与并发控制字段。
- 支付接入爱发电后能获取哪些订单与回调信息。
- Desktop 授权是否需要离线宽限期、设备上限与撤销机制。
- 第三方内容入驻是否需要在第一版就纳入所有权与分账字段。

---

_本文档为数据库设计草案，后续将根据内容模型、支付接入与授权方案继续补全。_
