# 04. Auth、RLS 与多租户设计

## 1. 总体原则

- Supabase Auth 是唯一登录身份来源
- `auth.users` 是认证真相
- `public.profiles`、`public.user_settings`、`public.user_roles`、`public.tenant_memberships` 是业务授权真相
- RLS 从第一天就开启，不等到多租户上线之后再补

---

## 2. 身份分层

### 2.1 认证层

- 负责邮箱 / 密码、OAuth、重置、会话、token
- 由 Supabase Auth 管

### 2.2 资料层

- 负责昵称、头像、简介、偏好、状态
- 由 `public.profiles` 和相关设置表管

### 2.3 授权层

- 负责“这个人能看什么、改什么、属于哪个租户”
- 由 `user_roles`、`tenant_memberships`、RLS policy 管

---

## 3. 建议的新表设计

### 3.1 用户资料

- `profiles`
  - `id uuid primary key references auth.users(id)`
  - `display_name`
  - `avatar_url`
  - `bio`
  - `status`
  - `created_at`
  - `updated_at`

- `notification_preferences`
  - `user_id uuid primary key`
  - `email`
  - `sms`
  - `in_app`

### 3.2 多租户基础表

- `tenants`
  - `id`
  - `slug`
  - `name`
  - `status`
  - `created_by`
  - `created_at`

- `tenant_memberships`
  - `tenant_id`
  - `user_id`
  - `role`
  - `status`
  - `created_at`

### 3.3 兼容当前业务表

建议所有未来会受租户边界保护的表都预留 `tenant_id`，哪怕第一版只有一个默认 tenant。

---

## 4. RLS 设计方法

### 4.1 用户所有权模型

适用于 profile、设备、授权、偏好、进度等“用户自己的数据”。

典型规则：

- `auth.uid() = user_id`
- 或 `exists (...)` 先校验 membership，再允许读写

### 4.2 租户成员模型

适用于课程管理、内容管理、商业化、管理员操作等“团队共享数据”。

典型规则：

- 只要 `tenant_id` 对应的 membership 存在，允许读取
- 写入则进一步限制 `role in ('owner', 'admin', 'teacher')`

### 4.3 公开内容模型

适用于已发布课程、公开商品、营销页所需数据。

典型规则：

- `status = 'published'`
- 未发布内容只允许管理员或编辑角色读取

---

## 5. 不建议的做法

- 不要把 `user_metadata` 当成授权来源
- 不要让前端拿 service role key
- 不要让 RLS 依赖容易被用户修改的字段
- 不要把“是否是管理员”只放在前端状态里

---

## 6. 认证流程建议

### 6.1 注册

1. Supabase Auth 创建 `auth.users`
2. trigger 自动创建 `profiles`
3. 如果需要默认租户，自动写入 `tenant_memberships`
4. 业务设置表用默认值初始化

### 6.2 登录

1. 用户拿到 Supabase session
2. 前端携带 bearer token
3. 直接访问受 RLS 保护的数据，或把 token 转交给后端

### 6.3 退出与失效

- 由 Supabase session 机制处理
- 需要“强制注销”时，结合 server-side revoke 或 token 过期策略

---

## 7. 后端和 RLS 的分工

- 前端直连：适合只读、轻写、天然受 RLS 保护的表
- NestJS 服务端：适合聚合、支付、Webhook、授权、审计、批处理
- service role：只在服务端使用，作为系统级通道

---

## 8. Storage 与附件权限

如果后续把头像、课件、运行产物迁到 Supabase Storage：

- bucket 访问也要通过 RLS / policy 控制
- 公开资源与私有资源要分 bucket
- 文件元数据建议回写到 `content_assets` 或专门的附件表

