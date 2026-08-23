# Project ZENTRIX - Stage 2 数据库迁移计划

**文档目的**：基于当前仓库里的后端实现、Prisma schema 与已有数据库文档，拆解从现有 PostgreSQL + Prisma 架构迁移到 Supabase BaaS 的执行计划。

**适用范围**：

- `apps/api` 里的 NestJS 后端
- `apps/web` 里的前端登录与数据访问链路
- 当前 Prisma schema、迁移文件、种子数据与测试桩
- 未来的 Supabase Auth、RLS、Storage、SQL migrations 与类型生成

---

## 0. 当前结论

- 当前系统已经不是一个“薄薄的数据库层”了，而是一个覆盖 auth、课程、进度、运行、商业化、授权、审计的完整后端。
- 现有实现仍然以 Prisma 为中心，且 `PrismaService` 是 NestJS 里所有数据访问的统一入口。
- 迁移到 Supabase 后，数据库不再只是被 Prisma 驱动，而要变成 Supabase 的一等能力：Auth、RLS、Storage、类型生成和迁移体系都要纳入。
- 对这次迁移，建议采用“分阶段切换、先建新底座、再迁核心写路径”的方式，避免一次性重写整个后端。

---

## 1. 文件结构

- [01-current-state-inventory.md](./01-current-state-inventory.md)：当前后端与数据库内容盘点
- [02-prisma-to-supabase-migration.md](./02-prisma-to-supabase-migration.md)：Prisma 到 Supabase 的迁移方案
- [03-local-dev-and-self-host.md](./03-local-dev-and-self-host.md)：本地开发与 self-host 环境方案
- [04-auth-rls-multitenancy.md](./04-auth-rls-multitenancy.md)：Auth、RLS 与多租户设计
- [05-cutover-validation.md](./05-cutover-validation.md)：切换、验证、回滚与风险控制
- [06-supabase-directory-structure.md](./06-supabase-directory-structure.md)：Supabase 目录结构草案
- [07-sql-migration-drafts.md](./07-sql-migration-drafts.md)：Supabase SQL migration 草案

---

## 2. 建议执行顺序

1. 先完成现状盘点和目标架构冻结，明确哪些表和能力会保留，哪些会被 Supabase 接管。
2. 再落地 Supabase 本地开发环境，让 schema 迁移、seed、类型生成和 RLS 可以在本地跑通。
3. 然后设计 Auth 与多租户的底层约束，优先把身份、租户、权限和 ownership 规则定下来。
4. 接着做 Prisma 到 Supabase 的迁移与兼容层，保证 NestJS 可以逐步接入，而不是一次性推倒重来。
5. 最后做切换验证、数据核对、回滚预案和旧链路下线。

---

## 3. 本次迁移的原则

- Supabase 里的 `auth`、`public`、`storage`、`migrations` 要成为新的事实来源。
- RLS 不是后补安全网，而是未来多租户的默认边界。
- 认证身份和业务资料要分层，不再把所有用户信息都塞进单一 `user` 表。
- 生产可写路径应尽量由服务端控制，客户端只拿最小权限。
- 迁移期间允许保留 Prisma 作为过渡工具，但不再让 Prisma 成为最终架构的中心。

---

## 4. 目标交付物

- 一套可本地启动的 Supabase 开发栈
- 一套 SQL migrations 驱动的数据库 schema
- 一套以 Supabase Auth 为核心的新认证链路
- 一套面向未来多租户的 RLS / tenant 设计
- 一套从 Prisma 平滑过渡到 Supabase 的后端改造方案
- 一套可执行的数据迁移、验证与回滚流程
