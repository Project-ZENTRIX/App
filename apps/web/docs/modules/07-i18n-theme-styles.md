# 国际化、主题与样式

这一份讲 Web 子项目里和外观有关的公共层：翻译、主题、少量本地样式和补充组件。

---

## 1. 国际化

当前页面文本主要分成三个命名空间：

- `app-shell`
- `app-pages`
- `account-forms`

### 1.1 `app-shell`

用于侧边栏、顶部栏、团队切换、用户菜单等壳层文案。

### 1.2 `app-pages`

用于应用区业务页面的标题、指标、状态和按钮文案。

### 1.3 `account-forms`

用于登录、注册、找回密码这些认证表单文本。

### 1.4 使用方式

组件里通过 `useTranslation(...)` 取文案，不把大量固定文本散在 JSX 中。

---

## 2. 主题

文件：[`src/components/theme-provider.tsx`](../../src/components/theme-provider.tsx)

它只是对 `next-themes` 的一层封装，当前做的事情是：

- 用 `class` 属性驱动主题
- 默认跟随系统主题
- 开启系统主题支持
- 切换主题时禁用过渡抖动

这一层的职责很窄，只负责把主题能力挂到全局。

---

## 3. 本地样式

文件：[`src/assets/custom.css`](../../src/assets/custom.css)

当前本地 CSS 很少，只补了两项：

- 普通图片禁止拖拽和选中
- `animate-blink` 动画

这说明页面视觉主要依赖共享 UI 的基础样式和 utility，而不是本地写一大堆特效 CSS。

---

## 4. 图标和辅助模块

### 4.1 `iconify-icon.tsx`

文件：[`src/components/iconify-icon.tsx`](../../src/components/iconify-icon.tsx)

它把 `@iconify/react` 的 `Icon` 再包了一层，方便在本地用更简单的接口传图标名和额外属性。

### 4.2 `blink.tsx`

文件：[`src/components/utils/blink.tsx`](../../src/components/utils/blink.tsx)

这是一个轻量的闪烁强调组件，用 CSS 变量控制动画时长、延迟和透明度。

它适合做：

- 菜单强调
- 小范围高亮
- 轻量提示

不适合拿来承担真正的业务动画系统。

---

## 5. 视觉约束

当前 Web 页面有几个明确倾向：

- 高密度信息优先
- 表格和面板优先
- 文案依赖翻译命名空间
- 页面层不自己发明一套样式系统

后续如果需要改视觉风格，先检查共享 UI 层和已有 token，而不是先在本地 CSS 里堆覆盖。
