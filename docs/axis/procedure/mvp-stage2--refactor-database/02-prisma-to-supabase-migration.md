# 02. Prisma 到 Supabase 的迁移方案

## 1. 目标架构

推荐的最终形态是：

- `auth` schema：由 Supabase Auth 接管身份、登录、会话、重置和 OAuth
- `public` schema：存放业务表、配置表、tenant 表和应用层 profile 表
- `storage` schema：存放资源元数据与文件访问控制
- `supabase/migrations`：作为数据库 schema 的唯一版本来源
- `supabase gen types`：作为 TS 类型生成来源

Prisma 不是长期目标；它可以作为过渡期工具，但不应再作为最终 schema 的“定义者”。

---

## 2. 迁移原则

1. 先迁 schema，再迁数据，再迁调用方。
2. 先把 Supabase 里的表、索引、约束和 RLS 搭起来，再切写路径。
3. 优先保留现有业务 ID 和历史数据，不为了“统一风格”强行大规模改主键。
4. 认证域先切，业务域后切。
5. 高风险写路径优先保留在 NestJS 服务端，由服务端通过 Supabase service role 或 RPC 进入数据库。

---

## 3. Prisma 迁出路径

### 3.1 短期：Prisma 作为桥接层

- 继续保留 `PrismaService`，用于迁移期间的后台服务读取和写入。
- 不再把新的数据库结构只写在 `schema.prisma` 中。
- 所有新的表结构变更改为先写 Supabase migration SQL，再反推类型或兼容层。

### 3.2 中期：Supabase 成为 schema source of truth

- `supabase/migrations` 成为唯一 schema 来源。
- `schema.prisma` 只保留到兼容阶段结束，之后逐步删掉或降级为只读参考。
- 业务代码中凡是能直接用 Supabase client 或 RPC 的地方，逐步替换 Prisma 调用。

### 3.3 长期：Prisma 退场

- 读取类逻辑尽量使用 Supabase client + RLS。
- 复杂写入、强一致流程和 webhook 继续保留在 NestJS 后端。
- 如果某些复杂 join 仍然需要 ORM，优先改写为 SQL view / RPC，而不是把 Prisma 永久留在新底座上。

---

## 4. 当前模型到 Supabase 的映射建议

### 4.1 身份域

| 当前 Prisma | Supabase 目标 | 处理建议 |
|---|---|---|
| `User` | `auth.users` + `public.profiles` | `auth.users` 管登录，`profiles` 管展示资料和业务状态 |
| `Session` | `auth.sessions` | 不再由应用层保存 session 主数据 |
| `Account` | `auth.identities` / Supabase Auth 内部结构 | 密码和第三方登录转交 Supabase |
| `Verification` | Supabase Auth 邮箱 / 重置流程 | 不再自己实现主流程 |
| `RefreshToken` | Supabase Auth session / refresh 机制 | 迁移后移除主路径 |

### 4.2 业务域

| 当前 Prisma | Supabase 目标 | 处理建议 |
|---|---|---|
| `Course`, `Chapter`, `Lesson`, `Task` | `public` 业务表 | 保留，但补 tenant / owner / published 约束 |
| `TestCase` | `public` 题目测试表 | 仅服务端或教师可写 |
| `ContentAsset` | `public` 元数据表 + `storage` bucket | 文件真正进 Storage，数据库只存元数据 |
| `Enrollment`, `LessonProgress`, `ProgressEvent` | `public` 学习域表 | 加 RLS，后续准备 tenant 维度 |
| `TaskSubmission`, `Run`, `RunLog`, `Judgement`, `SandboxJob` | `public` 执行域表 | 由服务端或 RPC 写入 |
| `Product`, `Order`, `Payment`, `Subscription` | `public` 商业域表 | 订单和支付尽量服务端写 |
| `DesktopLicense`, `Device`, `DeviceBinding`, `LicenseEvent` | `public` 授权域表 | 保留现有业务语义，逐步改成 service role / RPC 控制 |
| `Achievement`, `Level`, `UserAchievement`, `UserLevelProgress` | `public` 成长域表 | 读多写少，适合 RLS |
| `AuditLog`, `IntegrationClient`, `FeatureFlag` | `public` 运维域表 | 默认只给服务端与管理员写 |

---

## 5. 具体迁移步骤

### 5.1 冻结现状

1. 固定当前 Prisma schema 和迁移版本。
2. 列出所有已存在的表、字段、约束和 seed 数据。
3. 明确哪些字段是历史兼容字段，哪些字段会直接迁到 Supabase。

### 5.2 建立 Supabase schema

1. 用 `supabase init` 建立项目结构。
2. 把现有表结构翻译成 `supabase/migrations/*.sql`。
3. 先创建公共基础表、索引、外键、枚举和必要的默认值。
4. 再补 view、trigger、函数和 RLS policy。

### 5.3 迁移 auth

1. 先引入 Supabase Auth。
2. 新用户注册不再写 `user` + `account` + `session`，而是写入 `auth.users`。
3. 通过 trigger 在 `public.profiles` 中补一条业务资料记录。
4. 由 Supabase 负责登录、会话、邮箱验证、重置和第三方身份。

### 5.4 迁移业务调用

1. 前端只读场景优先改为 Supabase client 直连。
2. 后端保留写入和复杂业务编排。
3. 对于需要绕过 RLS 的后台任务，统一使用 service role。
4. 对于应该受 RLS 约束的用户请求，不再在后端“手工替代”权限逻辑。

### 5.5 迁移数据

1. 先迁移只读主数据：课程、章节、课时、任务、成就、等级。
2. 再迁移用户态数据：profile、偏好、授权、设备、学习进度。
3. 再迁移交易态数据：订单、支付、订阅、事件。
4. 最后迁移执行态数据：run、submission、log、judgement、sandbox job。

---

## 6. 建议的代码改造顺序

1. 先把数据库访问从“到处注入 Prisma”整理成少量 repository / service 边界。
2. 再为 Supabase client 抽一层统一工厂，区分 anon client、SSR client、service role client。
3. 然后逐步把只读接口替换成 Supabase 查询或 RPC。
4. 最后让 NestJS 只保留需要业务编排的写路径。

