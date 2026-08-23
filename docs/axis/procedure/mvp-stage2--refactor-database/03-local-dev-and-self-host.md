# 03. 本地开发与 self-host 环境方案

## 1. 目标

- 本地可以一键启动 Supabase stack
- 迁移、seed、类型生成和 RLS 校验都能本地完成
- 开发环境和未来 self-host 生产环境共享同一套 migration 资产

---

## 2. 推荐的本地开发方式

Supabase 官方推荐使用 Supabase CLI + Docker runtime 来启动本地 stack。这个 stack 适合开发和测试，但不是生产级 self-host，不能直接暴露到公网。

### 2.1 需要的基础组件

- Docker Desktop 或兼容 Docker API 的运行时
- Supabase CLI
- 本仓库中的 `supabase/` 目录

### 2.2 本地启动步骤

1. `supabase init`
2. `supabase start`
3. 初始化后把生成的配置文件、migration 文件和 seed 文件纳入版本控制
4. 用 `supabase db reset` 验证 migrations + seed 能否从零复建

---

## 3. 仓库中建议新增的 Supabase 目录

- `supabase/config.toml`
- `supabase/migrations/`
- `supabase/seed.sql`
- `supabase/functions/`（后续如需 Edge Function）
- `supabase/tests/`（可选，用于 SQL / policy 测试）

---

## 4. 本地开发流程

### 4.1 schema 开发

1. 修改 migration SQL，不直接改远端数据库。
2. 每次 schema 变更都落到新的 migration 文件。
3. 用 `supabase db reset` 回放全部迁移，验证顺序和约束。

### 4.2 数据种子

- 课程、章节、课时、任务、成就、等级等基础数据放 seed
- demo tenant、demo admin、demo teacher 和测试用户也放 seed
- 本地 seed 只服务开发，不当成生产初始化脚本

### 4.3 类型生成

- 用 `supabase gen types typescript` 生成数据库类型
- 前端和后端都尽量引用生成类型，减少手工 DTO 和 schema 漂移

---

## 5. self-host 生产或准生产环境

如果后续要在自己的基础设施里跑 Supabase，应该把它当成“另一套部署目标”，而不是本地 stack 的简单复制。

### 5.1 推荐方式

- 使用官方 self-host 的 Docker Compose 路线
- 把数据库迁移、环境变量、密钥和备份都纳入基础设施管理
- 仍然复用同一套 `supabase/migrations`

### 5.2 不要混淆的点

- CLI 本地 stack 不是生产环境
- self-host 生产环境需要独立的备份、监控、恢复和安全策略
- 本地开发用的默认凭据和默认配置不能直接搬到生产

---

## 6. 后端与前端的本地联动

### 6.1 前端

- 使用 Supabase 公钥 / anon key + 用户登录态
- 通过 RLS 直接访问适合直连的只读或轻写数据

### 6.2 后端

- 服务端环境变量里保存 service role key
- webhook、管理操作、授权控制和批量任务使用 service role
- 不要把 service role 暴露到浏览器或移动端

### 6.3 迁移期联调

- NestJS API 和 Supabase 本地 stack 同时运行
- 对比 API 路径与直连路径的返回结果，确认不会出现权限偏差

