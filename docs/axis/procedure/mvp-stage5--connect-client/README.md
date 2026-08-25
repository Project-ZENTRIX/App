# Project ZENTRIX - Stage 5 连接客户端与系统总览

**文档目的**：把当前的 `apps/desktop`、Web 登录链路、授权验证、课包内容、本地缓存与 Rust 后端职责组装成一套可执行的接入计划。

**当前阶段目标**：让 Desktop 成为真正的学习执行端，而不是一个只显示静态页面的壳子。

---

## 1. 文档分工

- [01-client-assembly-plan.md](./01-client-assembly-plan.md)：客户端组装顺序、模块边界与集成优先级
- [02-ui-system-consistency.md](./02-ui-system-consistency.md)：Web / Desktop 统一 UI 体系、视觉约束与组件复用原则
- [03-auth-and-verification-flow.md](./03-auth-and-verification-flow.md)：Web 登录、Device Flow / Auth Code Flow 到 Desktop 的验证链路
- [04-local-course-pack-mechanism.md](./04-local-course-pack-mechanism.md)：本地课包机制、缓存、更新与离线可用策略
- [05-rust-backend-implementation.md](./05-rust-backend-implementation.md)：Tauri Rust 后端命令、状态、存储与系统集成逻辑
- [06-quality-and-validation.md](./06-quality-and-validation.md)：验收标准、测试策略、回归边界与风险控制

---

## 2. 当前结论

- `apps/desktop` 已经存在基础 Tauri + React 壳层，但目前只具备最小入口和静态客户端框架。
- Web 端已经承担账户、授权、课包浏览与设备相关管理，适合作为登录与发证入口。
- API 端已经有现成的认证、会话、设备绑定与许可证相关能力，适合作为 Desktop 验证和授权的权威后端。
- 这一阶段的核心不是再做一个独立客户端，而是把 Web、Desktop、API 和本地内容包接成同一条学习链路。
- 本地课包不能只是下载文件，必须有索引、版本、校验、更新和离线恢复能力。

---

## 3. 建议实施顺序

1. 先冻结 Desktop 与 Web 的职责边界，明确哪些交互必须发生在 Web，哪些必须留在 Desktop。
2. 再统一 UI 体系，保证两个端的视觉语义、状态表达和组件命名一致。
3. 然后打通 Web 登录到 Desktop 授权的验证链路，优先定义 Device Flow / Auth Code Flow。
4. 接着落地本地课包机制，让 Desktop 可以离线加载、缓存和更新课包。
5. 最后补齐 Rust 后端命令、文件系统访问、持久化与同步逻辑。

---

## 4. 目标交付物

- 一套可执行的 Web -> Desktop 验证与授权方案
- 一套统一的桌面端 UI 基线
- 一套本地课包缓存与更新方案
- 一套 Tauri Rust 后端的职责清单和实现边界
- 一组能支撑联调和回归验证的测试与验收标准

_本文档作为 stage5 的总入口，后续内容按独立子文档持续展开。_