# 03 - 测验项目模板设计

**文档目的**：定义课包内测验、练习与项目任务的模板体系，让题目结构可以文件化保存，并支持后续本地客户端、教师工具和自动批改能力复用。

**示例参考**：[`example/authoring/quizzes/quiz-001.json`](./example/authoring/quizzes/quiz-001.json)、[`example/published/quizzes/quiz-001.json`](./example/published/quizzes/quiz-001.json)

---

## 1. 设计目标

- 测验内容不要绑定某张数据库表的单行字段。
- 题目、选项、答案、解析、评分规则都应可文件化。
- 不同题型要共享统一的模板头和元数据。
- 本地客户端应可直接渲染和提交测验。
- 教师端应可扩展出批注、难度、知识点与批改规则。

---

## 2. 模板分层

建议将测验拆成三层：

- `Quiz Manifest`：测验入口与元信息
- `Question Template`：单题模板定义
- `Assessment Rule`：评分与通过规则

这样能避免所有逻辑塞进一个大 JSON。

---

## 3. 推荐题型

初期建议支持以下基础题型：

- 单选题
- 多选题
- 判断题
- 填空题
- 简答题
- 排序题
- 匹配题
- 实操项目题

后续如需接入自动评测或 AI 评分，可以在模板层再扩展。

---

## 4. Quiz Manifest 字段

建议每个测验文件包含：

- `quizId`
- `quizCode`
- `packId`
- `courseId`
- `lessonId`
- `title`
- `summary`
- `difficulty`
- `estimatedMinutes`
- `questionTemplates`
- `passingRule`
- `retryPolicy`
- `reviewPolicy`
- `teacherHints`
- `grading`

---

## 5. 题目模板字段

每道题建议包含：

- `questionId`
- `type`
- `prompt`
- `options`
- `answerKey`
- `explanation`
- `points`
- `tags`
- `difficulty`
- `knowledgePoints`
- `shuffle`
- `constraints`

不同题型可以共享字段，也可以在 `constraints` 中放专属规则。

---

## 6. 项目模板

“项目题”更像一个小型任务模板，而不是单一答案题。

建议支持：

- `taskBrief`：任务描述
- `inputSpec`：输入要求
- `outputSpec`：输出要求
- `rubric`：评分量表
- `submissionMode`：文本、文件、代码、链接
- `reviewMode`：自动、人工、混合
- `checkpoints`：中间检查点

这种结构更适合后续扩展到课程作业和挑战任务。

---

## 7. 评分规则

评分规则建议支持：

- 固定分值
- 题目权重
- 部分得分
- 错题不扣分
- 限时加权
- 重试衰减

对项目题，评分建议以量表为主，不要强依赖单一标准答案。

---

## 8. 示例结构

```json
{
  "quizId": "quiz_001",
  "quizCode": "ai-intro-check-01",
  "packId": "pack_zentrix_ai_101",
  "courseId": "course_001",
  "lessonId": "lesson_002",
  "title": "AI 基础小测",
  "summary": "检查学生是否掌握核心概念。",
  "difficulty": "easy",
  "estimatedMinutes": 10,
  "passingRule": {
    "minScore": 80,
    "allowRetry": true,
    "maxAttempts": 3
  },
  "questionTemplates": [
    {
      "questionId": "q_001",
      "type": "single_choice",
      "prompt": "下列哪项最接近提示词的定义？",
      "options": [
        {"id": "a", "text": "模型输入说明"},
        {"id": "b", "text": "图片压缩格式"}
      ],
      "answerKey": ["a"],
      "explanation": "提示词是给模型的输入指令或说明。",
      "points": 20
    }
  ],
  "grading": {
    "mode": "auto",
    "partialCredit": false
  }
}
```

---

## 9. 本地客户端复用考虑

为了方便本地客户端复用，测验模板最好满足：

- 可以脱机渲染题目。
- 可以在本地保存作答草稿。
- 可以在联网后再提交。
- 可以在不同 UI 框架里复用题目结构。

---

## 10. 验收标准

- 测验文件可独立表达完整题目集合。
- 题型模板可被本地客户端直接渲染。
- 项目题可表达非标准答案任务。
- 评分规则和重试规则可以与题目文件一起版本化。
