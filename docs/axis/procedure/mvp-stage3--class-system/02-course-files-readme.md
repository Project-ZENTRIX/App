# 02 - 课程文件与内容组织

**文档目的**：定义课包内部的课程文件结构，说明课程内容如何脱离数据库行来表达章节、课时、教学步骤、练习、资源和显示信息。

**示例参考**：[`example/authoring/courses/course-001.json`](./example/authoring/courses/course-001.json)、[`example/authoring/courses/course-002.json`](./example/authoring/courses/course-002.json)、[`example/published/courses/course-001.json`](./example/published/courses/course-001.json)

---

## 1. 内容模型原则

- 一门课程是一个独立文件。
- 一个课包由多个课程文件组成。
- 课程文件应该尽量自描述，避免客户端运行时再去拼接大量零散表。
- 教学内容和展示内容分层，便于后续本地客户端复用。

---

## 2. 建议目录

```text
course-pack/
  manifest.json
  courses/
    course-001.json
    course-002.json
  lessons/
    lesson-001.md
    lesson-002.md
  resources/
    image-001.png
    handout-001.pdf
  quizzes/
    quiz-001.json
```

也可以采用“课程文件 + 章节内嵌课时”的模式；如果课程很复杂，建议保持课时拆分文件化，便于局部更新。

---

## 3. 课程文件职责

课程文件主要描述：

- 课程身份
- 所属课包与章节
- 课程标题、摘要和目标
- 课时列表
- 教学流转顺序
- 可选前置条件
- 可选完成条件
- 关联测验或作业
- 关联资源
- 对教师的提示说明

---

## 4. 推荐字段

建议课程文件至少包含：

- `courseId`
- `courseCode`
- `packId`
- `chapterId`
- `title`
- `summary`
- `order`
- `durationMinutes`
- `objective`
- `prerequisites`
- `lessons`
- `resources`
- `checks`
- `teacherNotes`
- `display`
- `sync`

---

## 5. 课时表达方式

课时建议包含以下层次：

- `lessonId`
- `title`
- `type`：讲解、练习、演示、测验、项目
- `contentRef`：正文文件或富文本块引用
- `mediaRefs`：图片、音频、视频、附件
- `actions`：下一步操作
- `estimatedMinutes`
- `completionRule`

课时内容不要依赖数据库拼装字段，而应尽量完整落在文件里。

---

## 6. 正文形式

正文可以有两种路线：

1. JSON 内嵌块
2. Markdown 文件引用

建议优先支持 Markdown 文件引用，因为它更适合：

- 编辑
- 预览
- 本地缓存
- 未来客户端复用

示例：

```json
{
  "lessonId": "lesson_001",
  "title": "什么是提示词",
  "contentRef": "lessons/lesson-001.md",
  "type": "lecture",
  "estimatedMinutes": 8
}
```

---

## 7. 资源引用

资源应使用相对路径或内容 ID，而不是数据库临时主键。

建议资源对象包含：

- `resourceId`
- `type`
- `path`
- `mimeType`
- `size`
- `checksum`
- `alt`
- `caption`
- `license`

这样本地客户端既能离线展示，也能做资源预取。

---

## 8. 显示与教学分离

建议课程文件把“教学内容”与“展示配置”分开：

- 教学内容：目标、步骤、练习、检查点
- 展示配置：封面、卡片样式、缩略图、折叠默认状态

这能让后续不同客户端复用同一套内容，而不绑定单一 UI。

---

## 9. 示例片段

```json
{
  "courseId": "course_001",
  "courseCode": "ai-intro-01",
  "packId": "pack_zentrix_ai_101",
  "chapterId": "ch_01",
  "title": "AI 基础概念",
  "summary": "介绍模型、提示词和工作流的基本概念。",
  "order": 1,
  "durationMinutes": 25,
  "objective": [
    "理解基本术语",
    "区分输入与输出",
    "完成首次练习"
  ],
  "lessons": [
    {
      "lessonId": "lesson_001",
      "title": "概念导入",
      "type": "lecture",
      "contentRef": "lessons/lesson-001.md",
      "estimatedMinutes": 8
    },
    {
      "lessonId": "lesson_002",
      "title": "动手练习",
      "type": "practice",
      "contentRef": "lessons/lesson-002.md",
      "estimatedMinutes": 12
    }
  ],
  "resources": [
    {
      "resourceId": "res_intro_pdf",
      "type": "pdf",
      "path": "resources/handout-001.pdf",
      "mimeType": "application/pdf"
    }
  ],
  "teacherNotes": [
    "建议先讲概念，再让学生做练习。",
    "如果学员基础弱，可以延长引导说明。"
  ]
}
```

---

## 10. 验收标准

- 课程文件可以独立渲染课程大纲。
- 课程文件能直接被本地客户端使用，不依赖数据库行拼接。
- 课程文件的结构可以支持章节、课时、练习和资源扩展。
- 课程文件能与 Manifest 形成稳定引用关系。
