# Authoring - 编辑态

这里是课包的可编辑源文件区。你的 Client 应该把这里当作写回目标，而不是直接改 `published/`。

---

## 规则

- 所有内容都使用稳定 ID。
- 文件路径只是存储位置，不是身份。
- 编辑时允许局部改动，但发布前要重新生成索引和版本信息。
- 正文优先可读，结构优先稳定。

---

## 主要文件

- `manifest.draft.json`：编辑态课包总入口
- `content-index.draft.json`：内容索引和引用表
- `changelog.md`：变更记录
- `schema/`：校验规则
- `courses/`、`lessons/`、`quizzes/`：内容文件

