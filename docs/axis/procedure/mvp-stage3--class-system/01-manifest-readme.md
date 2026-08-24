# 01 - 课包 Manifest 设计

**文档目的**：定义课包内容包的顶层清单文件 `Manifest`。它是课包内容系统的入口，负责描述课包身份、版本、可见性、目录结构、资源清单、权限边界和数据库映射关系。

**示例参考**：[`example/authoring/manifest.draft.json`](./example/authoring/manifest.draft.json)、[`example/published/manifest.json`](./example/published/manifest.json)

---

## 1. 设计定位

`Manifest` 不是数据库行的导出结果，也不是简单的 metadata dump。它是一个面向内容分发的包描述文件，应该满足：

- 可以被后端解析后与数据库元数据对齐。
- 可以被本地客户端直接读取并渲染出完整课包结构。
- 可以作为发布、同步、缓存和校验的基础。
- 可以独立承载数据库没有的教学信息，例如推荐节奏、前置条件、学习目标、适用设备、离线资源策略等。

---

## 2. Manifest 的职责

- 标识一个课包内容包。
- 说明该课包对应的业务实体和发布版本。
- 描述内容树的根目录、课程文件和资源文件。
- 说明兼容的客户端能力和最低版本。
- 提供与数据库字段的映射，但不依赖数据库才能读懂。
- 提供签名、校验和发布信息，支持更新检测。

---

## 3. 建议文件格式

推荐使用 `manifest.json` 作为主文件，必要时允许提供 `manifest.yaml` 作为编辑态辅助格式，但最终发布统一落成 JSON。

建议根目录结构类似：

```text
course-pack/
  manifest.json
  courses/
  quizzes/
  resources/
  assets/
  locales/
```

---

## 4. 顶层字段建议

建议包含以下字段：

- `manifestVersion`：Manifest 规范版本
- `contentPackId`：课包内容包 ID
- `contentPackCode`：课包稳定编码
- `title`：课包标题
- `subtitle`：副标题
- `summary`：简述
- `language`：主语言
- `status`：草稿、已发布、已归档等
- `version`：课包包体版本
- `revision`：同版本内的修订号
- `tenantScope`：租户可见范围
- `databaseRef`：数据库对齐信息
- `outline`：目录结构摘要
- `files`：课程、测验、资源等文件索引
- `tags`：标签
- `audience`：适合人群
- `prerequisites`：前置条件
- `learningGoals`：学习目标
- `delivery`：交付方式与客户端能力要求
- `integrity`：校验信息
- `publishing`：发布时间与发布人

---

## 5. 数据库对齐方式

Manifest 应该和数据库保持可追踪映射，但不要把数据库字段当作内容本体。

建议 `databaseRef` 至少包括：

- `packRowId`：数据库课包记录 ID
- `courseRowIds`：数据库课程记录 ID 列表
- `quizRowIds`：数据库测验记录 ID 列表
- `updatedAt`：数据库最后同步时间
- `source`：来源系统标识

同时允许 Manifest 增加数据库里没有的字段，例如：

- `recommendedPace`
- `difficultyCurve`
- `offlineFriendly`
- `editorNotes`
- `teacherGuidance`

---

## 6. 发布与版本规则

- `version` 表示课包内容主版本。
- `revision` 表示同一主版本的修订。
- 只要课程目录、课时结构、测验模板有破坏性变化，就应提升主版本。
- 纯文本修订、资源替换、说明补充可以只升 `revision`。
- Manifest 必须可回溯到上一版本，便于客户端增量同步。

---

## 7. 校验与签名

建议 Manifest 具备以下校验信息：

- `checksum`：整包摘要
- `fileHashes`：文件级 hash
- `signature`：发布签名
- `signedAt`：签名时间

这样可以支持：

- 本地缓存完整性验证
- 远程同步后的差量比对
- 离线导入后的内容可信判断

---

## 8. 示例结构

```json
{
  "manifestVersion": "1.0",
  "contentPackId": "pack_zentrix_ai_101",
  "contentPackCode": "zentrix-ai-foundation",
  "title": "AI 基础训练营",
  "summary": "面向新手的入门课包，包含课程、练习与测验。",
  "language": "zh-CN",
  "status": "published",
  "version": "1.2.0",
  "revision": 4,
  "tenantScope": {
    "mode": "shared",
    "tenantIds": []
  },
  "databaseRef": {
    "packRowId": "db_pack_001",
    "courseRowIds": ["db_course_001", "db_course_002"],
    "quizRowIds": ["db_quiz_001"],
    "updatedAt": "2026-08-23T00:00:00Z",
    "source": "admin-cms"
  },
  "outline": [
    {
      "chapterId": "ch_01",
      "title": "认识 AI",
      "courseCount": 3
    }
  ],
  "files": {
    "courses": ["courses/ch_01.json"],
    "quizzes": ["quizzes/qz_01.json"],
    "resources": ["resources/intro.pdf"]
  },
  "learningGoals": [
    "理解课包学习路径",
    "完成基础练习",
    "掌握首次测验流程"
  ],
  "integrity": {
    "checksum": "sha256:placeholder"
  }
}
```

---

## 9. 验收标准

- Manifest 单独存在时可读懂课包的基本结构。
- Manifest 可被客户端直接解析出课程目录和资源入口。
- Manifest 可与数据库记录做双向映射。
- Manifest 能支持版本比较和更新检测。
