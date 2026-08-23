# 01. 当前后端与数据库内容盘点

## 1. 后端模块现状

当前 `apps/api/src` 里的后端模块已经覆盖了完整业务链路：

| 模块 | 现有文件 | 主要职责 | 主要数据库域 |
|---|---|---|---|
| auth | `auth-core.service.ts`, `auth-license.service.ts`, `auth-session.ts`, `me.controller.ts` | 注册、登录、当前用户、资料、会话、偏好、授权 | `user`, `session`, `account`, `verification`, `userProfile`, `notificationPreference`, `refreshToken` |
| courses | `courses.service.ts`, `courses.seed.ts`, `courses.mappers.ts` | 课程目录与内容展示 | `Course`, `Chapter`, `Lesson`, `Task`, `TestCase`, `ContentAsset` |
| progress | `progress.service.ts` | 学习进度与事件流 | `Enrollment`, `LessonProgress`, `ProgressEvent` |
| submissions / runs | `submissions.service.ts`, `runs.service.ts` | 提交、运行、日志、判题 | `TaskSubmission`, `Run`, `RunLog`, `Judgement`, `SandboxJob` |
| commerce | `commerce.service.ts`, `webhooks.service.ts` | 商品、订单、支付、订阅与回调 | `Product`, `Order`, `OrderItem`, `Payment`, `PaymentEvent`, `Subscription` |
| devices / licenses | `devices.controller.ts`, `licenses.controller.ts`, `auth-license.service.ts` | 桌面端授权、设备绑定与解绑 | `DesktopLicense`, `Device`, `DeviceBinding`, `LicenseEvent` |
| achievements | `achievements.service.ts` | 成就与等级 | `Achievement`, `UserAchievement`, `Level`, `UserLevelProgress` |
| admin | `admin.service.ts` | 管理能力 | `AuditLog`, `IntegrationClient`, `FeatureFlag` |

---

## 2. 当前数据访问方式

- 当前 NestJS 后端通过 `PrismaService` 直接访问 PostgreSQL。
- 当前登录态是后端自管理会话，不是 Supabase Auth。
- 当前 `Authorization: Bearer <token>` 会被 `getSessionFromAuthorizationHeader()` 解析为应用层 session。
- 这意味着现在的认证、授权、会话失效和设备授权都由应用层和数据库共同承担，而不是交给 Supabase 原生能力。

---

## 3. 当前 Prisma schema 的特点

### 3.1 已经具备的领域

- 账号与权限
- 内容与课包
- 学习过程
- 运行与判题
- 商业化
- 成就与授权
- 运维与审计

### 3.2 值得保留的设计

- 业务域拆分是清楚的，适合继续沿用到 Supabase 的 `public` schema。
- 事件表和结果表分离得比较早，适合未来做审计、重放和分析。
- `deletedAt` / `archivedAt` / `revokedAt` 这类软删除和归档语义已经存在，迁移时可以原样保留。

### 3.3 迁移时需要调整的地方

- 当前 `user` 仍然是应用层主身份表，后续应从 Supabase `auth.users` 派生。
- 当前 `session`、`account`、`verification` 和 `refreshToken` 是自实现 auth 的核心表，迁移后大部分不应继续作为主路径。
- 当前很多 ID 是 CUID 字符串，Supabase Auth 的用户 ID 是 UUID，迁移时需要明确主键和外键边界。
- 当前 schema 里已经出现较多“业务派生字段”，例如课程计数、是否可学习、是否购买，这些字段迁到 Supabase 后要明确是否仍由数据库保存，还是改为视图 / 聚合字段。

---

## 4. 现有数据库文档与真实 schema 的差异

当前 `docs/axis/database.md` 仍然把系统描述为“PostgreSQL + Prisma”的传统架构，但实际 schema 已经比最初草案更丰富，尤其体现在：

- 课程目录字段更完整
- 桌面端授权链路已经成型
- 订单、支付、订阅、事件流等商业化数据已经落表
- 管理与审计表也已经在 schema 中出现

所以这次 stage2 不是“补一点 Supabase”，而是要把数据库底座整体升级成 Supabase BaaS。

---

## 5. 迁移前必须先定的边界

- 哪些表以后由 Supabase Auth 接管，哪些表继续由应用层保存
- 哪些表允许客户端直连，哪些表只能由服务端或 RPC 写入
- 哪些数据是全局内容，哪些数据未来会变成 tenant-scoped
- 哪些字段是历史事实，哪些字段只是缓存或派生值

