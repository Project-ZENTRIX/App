# 表单模块

认证页的主要交互都在 `src/components/forms` 下。这里的表单组件目前以结构和文案为主，提交逻辑以后端接通再补。

---

## 1. `login-form.tsx`

文件：[`src/components/forms/login-form.tsx`](../../src/components/forms/login-form.tsx)

包含的内容：

- 标题和说明
- 邮箱输入
- 密码输入
- 登录按钮
- GitHub OAuth 按钮
- 跳转到注册页
- 跳转到找回密码页

这个组件的重点是字段关系和跳转关系，不是校验逻辑。

---

## 2. `signup-form.tsx`

文件：[`src/components/forms/signup-form.tsx`](../../src/components/forms/signup-form.tsx)

包含的内容：

- 标题和说明
- 姓名
- 邮箱
- 密码
- 确认密码
- 注册按钮
- GitHub OAuth 按钮
- 跳转到登录页

它和登录表单共享同一套字段组件，所以视觉和交互结构是一致的。

---

## 3. `forgot-password-form.tsx`

文件：[`src/components/forms/forgot-password-form.tsx`](../../src/components/forms/forgot-password-form.tsx)

包含的内容：

- 标题和说明
- 邮箱输入
- 发送重置动作
- 返回登录页的跳转

它是最短的一类认证表单，目标是把恢复登录入口保持清楚。

---

## 4. `search-form.tsx`

文件：[`src/components/forms/search-form.tsx`](../../src/components/forms/search-form.tsx)

这是侧边栏里的搜索样板，使用 `SidebarInput` 和左侧搜索图标。

当前它更像一个可复用输入模块，不承担真正的全局搜索逻辑。

---

## 5. 认证页表单的通用规则

- 文案统一从 `account-forms` 命名空间取
- 表单组件保持窄宽度，避免堆叠太多视觉元素
- 认证页先把结构固定，再补后端动作
- OAuth 按钮当前是界面占位，别把它当成真实鉴权实现
