# 旧版 UI 清单

本文件记录了在第 6 阶段清理过程中被移除的 UI 界面。

## 已移除的 Web UI 界面

这些界面位于 `apps/web/app/app/` 目录下，属于经过身份验证的产品界面。

| 路由 | 用途说明 |
| --- | --- |
| `/app` | 主身份验证仪表盘落地页。展示已登录用户信息、快捷链接、进度亮点、成就以及最近活动。 |
| `/app/admin` | 管理员工作区入口。为特权用户提供仅限管理员的操作界面及路由切换功能。 |
| `/app/content-packs` | 内容包目录。列出可发布的课程包，并为教师与运营人员展示快照式元数据。 |
| `/app/content-packs/[contentPackCode]` | 内容包详情页。展示单个内容包的清单、角色计划及相关支持元数据。 |
| `/app/courses` | 课程目录页。供学习者浏览课程产品、按可用性筛选并查看课程卡片。 |
| `/app/courses/[courseId]` | 课程详情页。展示单个课程的结构、章节、发布版本、版本信息及包含的资源。 |
| `/app/devices` | 设备与许可证界面。展示已绑定设备、许可证状态及重新加载操作。 |
| `/app/devices/[deviceId]` | 设备详情页。展示单个设备的绑定状态及与许可证关联的状态。 |
| `/app/library` | 学习者资料库页面。展示已拥有及可学习的课程包。 |
| `/app/membership` | 会员中心。汇总当前有效的订阅或会员状态。 |
| `/app/orders` | 订单中心。列出购买历史及订单状态。 |
| `/app/orders/[orderId]` | 订单详情页。展示单个订单的支付状态及可执行操作。 |
| `/app/progress` | 进度与成就页面。汇总学习进度、成就状态及同步相关指标。 |
| `/app/settings/profile` | 个人资料设置。用于编辑姓名、头像及简介信息。 |
| `/app/settings/notifications` | 通知偏好设置。用于切换电子邮件、短信及应用内通知选项。 |
| `/app/settings/security` | 安全设置。处理密码及账户安全相关操作。 |
| `/app/settings/sessions` | 会话管理。列出活跃会话并支持撤销操作。 |
| `/app/student` | 学生仪表盘变体。聚焦于面向学习者的入口及账户摘要。 |
| `/app/student/courses` | 学生课程市场。面向学习者的目录，用于浏览并打开课程详情。 |
| `/app/student/courses/[courseId]` | 学生课程详情页。展示单个课程的学习状态及章节预览。 |
| `/app/student/devices` | 学生设备视图。展示学习者已绑定设备及许可证上下文。 |
| `/app/student/devices/[deviceId]` | 学生设备详情页。展示单个设备面向学习者的状态。 |
| `/app/student/library` | 学生资料库页面。列出已拥有及可访问的学习包。 |
| `/app/student/membership` | 学生会员页面。展示学习者订阅及续费相关信息。 |
| `/app/student/orders` | 学生订单历史。展示学习者的购买记录及订单摘要。 |
| `/app/student/orders/[orderId]` | 学生订单详情页。展示单笔学习者购买的详细信息。 |
| `/app/student/progress` | 学生进度页面。汇总学习者成就及完成状态。 |
| `/app/student/settings/profile` | 学生个人资料设置。用于编辑学习者身份相关字段。 |
| `/app/student/settings/notifications` | 学生通知设置。控制学习者的通知偏好。 |
| `/app/student/settings/security` | 学生安全设置。处理学习者密码及会话相关操作。 |
| `/app/student/settings/sessions` | 学生会话设置。列出学习者会话以供查看或撤销。 |
| `/app/teacher` | 教师仪表盘变体。提供面向教师的入口及班级内容访问功能。 |
| `/app/teacher/content-packs` | 教师内容包工作区。列出创作或发布中的内容包。 |
| `/app/teacher/content-packs/[contentPackCode]` | 教师内容包详情页。展示单个内容包的教学侧快照信息。 |

## 已移除的桌面端 UI 界面

这些界面位于 `apps/desktop/src/components/` 目录下，构成桌面客户端的应用内屏幕栈。

| 界面 | 用途说明 |
| --- | --- |
| `startup` | 连接与启动屏幕。处理 Web 登录、设备流 / 授权码流交接、本地缓存恢复以及设备绑定检查。 |
| `pack-selection` | 本地内容包浏览器。展示已缓存的内容包、更新可用性及离线就绪状态。 |
| `workspace` | 学习工作区。整合课程上下文、编辑器区域、运行状态、输出结果及提交操作。 |
| `lesson-details` | 课程与验证界面。展示当前课程的目标、先决条件及完成检查项。 |
| `runs-and-submissions` | 执行与提交历史。集中展示近期运行记录、提交内容及结果。 |
| `sync-cache` | 同步与离线状态界面。管理本地内容、待同步数据以及与设备/许可证关联的缓存状态。 |
| `settings` | 设备与配置界面。处理主题、编辑器、诊断、访问权限及通知类设置。 |

## 备注

- `apps/web/app/(non-app)/` 与 `apps/web/app/account/` 下的公开账户入口点予以保留。
- 桌面端外壳及共享数据管道保持不变；仅将页面界面本身视为已退役的 UI。