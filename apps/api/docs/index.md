# ZENTRIX API 文档索引

这是一组按模块拆开的 API 规划文档。先看这里，再进入对应模块。

## 模块列表

- [总体说明](modules/00-overview.md)
- [Supabase 基础层](modules/01-supabase-foundation.md)
- [身份与认证](modules/02-auth-identity.md)
- [多租户与权限](modules/03-tenancy-permissions.md)
- [领域数据模型](modules/04-domain-models.md)
- [API 资源与接口面](modules/05-api-surface.md)
- [写入流程与事务边界](modules/06-write-flows.md)
- [Webhooks、异步任务与 Storage](modules/07-webhooks-async-storage.md)
- [管理、运维与发布](modules/08-admin-ops-deployment.md)

## 读法

- 想先知道 API 层的边界和原则，看“总体说明”。
- 想看 Supabase 怎么接入，看“Supabase 基础层”。
- 想看登录、会话和资料怎么处理，看“身份与认证”。
- 想看多租户、角色和 RLS 怎么设计，看“多租户与权限”。
- 想看具体实体和表结构方向，看“领域数据模型”。
- 想看模块级接口规划，看“API 资源与接口面”。
- 想看写入时事务、幂等和状态流转，看“写入流程与事务边界”。
- 想看支付回调、后台任务和文件上传，看“Webhooks、异步任务与 Storage”。
- 想看管理、审计、监控和部署，看“管理、运维与发布”。
