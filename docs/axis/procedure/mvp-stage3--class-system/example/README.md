# Example - 可编辑课包示例

这个示例分成两层：

- `authoring/`：编辑态，适合你自己的 Client 修改
- `published/`：发布态，适合客户端稳定读取

根目录下保留少量兼容文件，方便你对比旧结构和新结构。

---

## 目录

```text
example/
  authoring/
    README.md
    manifest.draft.json
    content-index.draft.json
    changelog.md
    schema/
    courses/
    lessons/
    quizzes/
  published/
    README.md
    manifest.json
    content-index.json
    courses/
    lessons/
    quizzes/
  resources/
    README.md
```

---

## 这个结构怎么用

1. 你的 Client 只改 `authoring/`。
2. 保存时更新 `content-index.draft.json` 和 `changelog.md`。
3. 发布时把 `authoring/` 生成到 `published/`。
4. 运行时只读取 `published/`。

---

## 你应该重点检查的点

- 稳定 ID 是否贯穿 `manifest`、`course`、`lesson` 和 `quiz`
- 路径变动时是不是还能靠 `content-index` 找到内容
- `draft` 和 `published` 分层是否足够清楚
- schema 是否已经足够约束 Client 的写回结果

