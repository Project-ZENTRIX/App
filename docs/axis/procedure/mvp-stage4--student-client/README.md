# Project ZENTRIX - Stage 4 学生客户端设计总览

**文档目的**：把学生客户端拆成独立文档管理，先定客户端定位，再定 Tauri App 子应用初始化、工作台结构、离线同步与验收收口。

**当前选型**：Tauri App + React + TypeScript，作为新的 Desktop 学生客户端子 app。

---

## 1. 文档分工

- [01-client-positioning.md](./01-client-positioning.md)：客户端定位、职责边界、目标与约束
- [02-tauri-app-bootstrap.md](./02-tauri-app-bootstrap.md)：如何在 monorepo 中初始化新的 Tauri 子 app
- [03-learning-workspace.md](./03-learning-workspace.md)：学习工作台、目录、编辑器、运行与提交
- [04-sync-offline-state.md](./04-sync-offline-state.md)：本地缓存、离线、同步与恢复
- [05-quality-and-validation.md](./05-quality-and-validation.md)：验收标准、测试策略与风险控制
- [06-ui-system.md](./06-ui-system.md)：学生客户端 UI 系统、颜色、字体、布局和状态

---

## 2. 当前结论

- 学生客户端是学习执行端，不是 Web 门户的镜像。
- 课包内容从 `Manifest` 和文件系统进入，运行态和进度态以 API 为准。
- 客户端需要优先解决“打开课包、写代码、运行、提交、看反馈、同步进度”这一条主线。
- Tauri App 适合作为桌面壳层，React 负责界面和交互，TypeScript 负责类型与跨端共享约束。

---

## 3. 建议实施顺序

1. 先初始化新的 Tauri 子 app。
2. 再冻结客户端定位和不做什么。
3. 然后搭学习工作台主布局。
4. 接着补离线缓存与同步恢复。
5. 最后做验收标准和回归边界。

---

## 4. 当前边界

本组文档只描述学生客户端，不覆盖 Web 管理门户，也不替代 API 的权威设计。

_本文档作为 stage4 的总入口，后续内容按独立子文档持续展开。_
