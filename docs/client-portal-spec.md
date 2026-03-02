# Client Portal — 技术规格

> **版本**: 2.0
> **更新日期**: 2026-02-28

---

## 1. 架构概述

客户门户 (Client Portal) 是系统的第二个独立门户，与管理后台共享同一套后端服务和数据库，但拥有独立的认证体系、tRPC 实例和 UI 设计。门户通过子域名路由（`app.geahr.com`）或路径前缀（`/portal/*`）访问，采用 Apple Liquid Glass 设计语言。

| 维度 | 实现方式 |
|:---|:---|
| 认证 | JWT + 邀请注册（非 Manus OAuth） |
| tRPC 实例 | `server/portal/portalTrpc.ts`（独立于 Admin tRPC） |
| 路由 | `server/portal/routers/`（9 个路由文件） |
| 前端 | `client/src/pages/portal/`（18 个页面） |
| 数据隔离 | `protectedPortalProcedure` 自动注入 `ctx.customerId` |

---

## 2. 认证流程

门户用户存储在 `customer_contacts` 表中，通过 `hasPortalAccess` 字段控制访问权限。认证流程如下：

管理员在 Admin 系统中为客户联系人启用门户访问，点击 "Send Invite" 生成邀请链接。客户联系人点击链接后设置密码完成注册。后续通过邮箱 + 密码登录，服务端签发 JWT（payload 包含 `contactId`、`customerId`、`email`）存储在 HttpOnly Cookie 中。

密码重置流程：用户点击 "Forgot Password" → 输入邮箱 → 系统生成重置令牌（24 小时有效）→ 用户通过链接设置新密码。管理员也可在 Settings > User Management 中为客户门户用户重置密码。

---

## 3. 数据隔离

所有门户查询通过 `protectedPortalProcedure` 中间件强制注入 `ctx.customerId`，确保每个客户只能访问自身数据。后端查询层在 WHERE 条件中始终包含 `customerId` 过滤，前端无法绕过此限制。

---

## 4. 功能模块

| 模块 | 页面文件 | 后端路由 | 功能说明 |
|:---|:---|:---|:---|
| Dashboard | `PortalDashboard.tsx` | `portalDashboardRouter.ts` | KPI 卡片、员工分布图、薪酬趋势、待办事项 |
| Employees | `PortalEmployees.tsx`, `PortalEmployeeDetail.tsx` | `portalEmployeesRouter.ts` | 员工列表、详情、文档查看 |
| Onboarding | `PortalOnboarding.tsx`, `PortalSelfOnboarding.tsx` | `portalEmployeesRouter.ts` | 雇主发起入职、员工自助填写 |
| Payroll | `PortalPayroll.tsx` | `portalPayrollRouter.ts` | 按国家/月份查看已审批薪酬 |
| Invoices | `PortalInvoices.tsx`, `PortalInvoiceDetail.tsx` | `portalInvoicesRouter.ts` | 发票列表、详情、PDF 下载、账户摘要 |
| Leave | `PortalLeave.tsx` | `portalLeaveRouter.ts` | 休假申请、余额查看、审批 |
| Adjustments | `PortalAdjustments.tsx` | `portalAdjustmentsRouter.ts` | 调整项查看 |
| Reimbursements | `PortalReimbursements.tsx` | `portalReimbursementsRouter.ts` | 报销提交、审批、附件上传 |
| Compliance | `PortalCompliance.tsx` | `portalDashboardRouter.ts` | 公共假期日历、合规信息 |
| Settings | `PortalSettings.tsx` | `portalSettingsRouter.ts` | 休假政策、团队管理、公司信息 |
| Help Center | `PortalHelpCenter.tsx` | — | 操作指南、FAQ、术语表 |
| Auth | `PortalLogin.tsx`, `PortalRegister.tsx`, `PortalForgotPassword.tsx`, `PortalResetPassword.tsx` | `portalAuthRouter.ts` | 登录、注册、密码重置 |

---

## 5. 数据流向

| 数据 | Admin 写入 | Portal 读取 | Portal 写入 |
|:---|:---:|:---:|:---:|
| Employees | ✅ (全量 CRUD) | ✅ | ✅ (入职请求) |
| Adjustments | ✅ (锁定/处理) | ✅ | — |
| Leave | ✅ (确认) | ✅ | ✅ (提交/客户审批) |
| Reimbursements | ✅ (确认) | ✅ | ✅ (提交/客户审批) |
| Invoices | ✅ (生成/发送) | ✅ (下载 PDF) | — |
| Leave Policies | ✅ (覆盖) | ✅ | ✅ (配置) |
| Portal Users | ✅ (初始邀请) | ✅ | ✅ (管理) |
