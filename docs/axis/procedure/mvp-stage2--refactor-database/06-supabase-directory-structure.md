# 06. Supabase 目录结构草案

## 1. 目标

这部分用于定义未来在仓库里真正落地 Supabase 时的目录边界。它不是“理论目录”，而是建议直接照着建的结构。

---

## 2. 推荐目录

```text
supabase/
  config.toml
  seed.sql
  migrations/
    0001_bootstrap.sql
    0002_auth_profiles.sql
    0003_content_catalog.sql
    0004_learning_and_progress.sql
    0005_execution_domain.sql
    0006_commerce_and_subscription.sql
    0007_devices_and_licenses.sql
    0008_admin_and_audit.sql
    0009_rls_helpers.sql
    0010_rls_policies.sql
  functions/
    notify-webhook/
    grant-default-profile/
  tests/
    rls/
    migrations/
  types/
    database.types.ts
```

---

## 3. 目录职责

- `config.toml`：本地开发参数、端口和服务开关
- `seed.sql`：基础数据、演示账号和初始 tenant
- `migrations/`：唯一 schema 来源
- `functions/`：后续需要服务端边缘函数时再启用
- `tests/`：policy 和 migration 的回归验证
- `types/`：生成的 TS 类型，供前后端共享

---

## 4. 迁移分层

### 4.1 第 1 层：基础设施

- 扩展
- 枚举
- helper function
- 通用触发器

### 4.2 第 2 层：身份与资料

- `profiles`
- `notification_preferences`
- `user_roles`
- `tenants`
- `tenant_memberships`

### 4.3 第 3 层：业务域

- 内容
- 学习
- 执行
- 商业化
- 授权
- 审计

### 4.4 第 4 层：RLS 与函数

- `auth.uid()` / `exists` 辅助函数
- tenant 作用域 helper
- 各表 RLS policy

---

## 5. 落地建议

- 不要把所有表混在一个超大的 migration 里。
- 每个 migration 都应该按“可独立回放”来设计。
- `0010_rls_policies.sql` 之前，数据库应该已经可以在无 RLS 的情况下完整创建并导入 seed。

