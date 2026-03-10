# 15个Client Portal Bug修复方案

本方案综合考虑了用户体验、合规要求和技术实现，对15个Bug进行了详细的修复规划。

## Bug 1: Credit note 错误地显示在 portal invoices 列表中
**问题描述**：客户在Invoices页面看到了Credit Note，容易与应付账单混淆。
**修复方案**：
1. **后端**：在 `server/portal/routers/portalInvoicesRouter.ts` 的 `list` 接口中，默认排除 `credit_note` 和 `deposit_refund` 类型，除非显式请求（如通过 `typeCategory` 过滤）。
2. **前端**：在 `client/src/pages/portal/PortalWallet.tsx` 的交易历史表格中，为 `referenceType === "credit_note"` 的交易添加下载按钮，调用 `/api/portal-invoices/${tx.referenceId}/pdf` 接口，让客户可以在Wallet页面下载退款凭证用于财务账务处理。

## Bug 2: Invoice 详情页缺少 wallet 余额支付功能
**问题描述**：客户在查看Invoice详情时，无法使用Wallet余额进行支付。
**修复方案**：
1. **后端**：在 `server/portal/routers/portalInvoicesRouter.ts` 的 `detail` 接口中，获取当前客户的Wallet余额并返回。
2. **前端**：在 `client/src/pages/portal/PortalInvoiceDetail.tsx` 中，如果发票有未付余额（`balanceDue > 0`）且Wallet有余额，显示"Pay with Wallet"按钮和逻辑，调用支付接口（需确认或添加 `payWithWallet` 接口）。

## Bug 3: Dashboard 只统计 active employees，遗漏 contractors
**问题描述**：Dashboard的"Active Employees" KPI卡片只统计了全职员工，没有包含Contractors。
**修复方案**：
1. **后端**：在 `server/portal/routers/portalDashboardRouter.ts` 的 `stats` 接口中，增加对 `status === "active"` 的 contractors 的统计，并将两者相加作为总的 active workers。
2. **前端**：在 `client/src/pages/portal/PortalDashboard.tsx` 和 `client/src/lib/i18n.ts` 中，将 "Active Employees" (在职员工) 的文案修改为 "Active Workers" (在职人员)，以准确反映包含Contractors的实际情况。

## Bug 4 & 5: Wallet 显示的 invoice number 与实际不一致
**问题描述**：Wallet交易历史中显示的是内部的 `referenceId`（如 #123），而不是客户可见的 `invoiceNumber`（如 INV-2023-001）。
**修复方案**：
1. **后端**：修改 `server/services/walletService.ts`，在创建交易记录时，将 `description` 中的 `Invoice #${invoiceId}` 替换为实际的 `invoiceNumber`。需要在 `transact` 方法调用前查询对应的 invoiceNumber。
2. **历史数据**：在 `server/portal/routers/portalWalletRouter.ts` 的 `listTransactions` 接口中，关联查询 `invoices` 表，将 `referenceId` 转换为 `invoiceNumber` 返回给前端显示。

## Bug 6: "Country" 需改为 "Country/Region"
**问题描述**：出于合规考虑，所有显示"Country"或"国家"的地方需要更新为"Country/Region"或"国家/地区"。
**修复方案**：
1. **前端**：全局搜索 `client/src/lib/i18n.ts`，将所有相关的英文 "Country" 替换为 "Country/Region"，中文 "国家" 替换为 "国家/地区"。特别关注 `portal_self_onboarding`、`portal_dashboard` 等模块的文案。

## Bug 7: Invoice 同时出现在 active 和 history 两个 tab
**问题描述**：状态为 'paid' 的发票同时出现在 Active 和 History 标签页中。
**修复方案**：
1. **后端**：在 `server/portal/routers/portalInvoicesRouter.ts` 的 `list` 接口中，修改 `tab === "active"` 的过滤条件，排除 'paid' 状态（即 `status NOT IN ('cancelled', 'void', 'paid')`），使其只显示未完成支付的发票。

## Bug 8: Adjustments 状态显示原始 i18n key
**问题描述**：Adjustments列表中的状态显示为 `portal_adjustments.status.submitted` 等原始key，而不是翻译后的文本。
**修复方案**：
1. **前端**：在 `client/src/lib/i18n.ts` 中，补充与数据库实际状态值完全匹配的翻译键值对：`submitted` (待审核), `client_approved` (客户已批), `client_rejected` (客户驳回), `admin_approved` (平台已批), `admin_rejected` (平台驳回), `locked` (已锁定)。

## Bug 9: AOR onboarding 错误显示 EOR 雇主信息字段
**问题描述**：AOR（Contractor）的邀请流程中，错误地显示了EOR特有的字段（如 Employment Type）。
**修复方案**：
1. **前端**：在 `client/src/pages/portal/PortalOnboarding.tsx` 的 `renderInviteEmployerInfo` 函数中，增加对 `isAor` 的判断，隐藏 `employmentType`（雇佣类型）等EOR专属字段。

## Bug 10 & 11: AOR/EOR 发送 invite 时 SQL insert 报错
**问题描述**：Drizzle ORM 在插入数据时，如果显式传递了 `id: undefined`，会导致 SQL 插入 NULL 报错。
**修复方案**：
1. **后端**：在 `server/portal/routers/portalEmployeesRouter.ts` 的 `sendOnboardingInvite` 和 `submitOnboarding` 接口中，以及 `server/services/db/contractorService.ts` 的 `createContractor` 方法中，确保不传递 `id` 字段，或者使用解构剔除 `id`。
2. **后端**：在 AOR self-onboarding 提交时，确保正确生成 `contractorCode`。

## Bug 12: 缺少 leave policy 自动初始化功能
**问题描述**：客户在Portal中无法自动初始化法定假期政策。
**修复方案**：
1. **后端**：在 `server/portal/routers/portalSettingsRouter.ts` 中，暴露 `initializeFromStatutory` 接口给 Portal Admin 角色。
2. **前端**：在 `client/src/pages/portal/PortalSettings.tsx` 的 Leave Policies 标签页中，如果某个国家没有配置政策，显示 "Initialize from Statutory" 按钮，允许客户一键导入法定假期标准。

## Bug 13: Portal leave 缺少半天假选项
**问题描述**：员工在Portal申请请假时，无法选择半天假。
**修复方案**：
1. **前端**：在 `client/src/pages/portal/PortalLeave.tsx` 的请假表单中，添加 `isHalfDay` Checkbox。当勾选时，自动将 `days` 计算结果减半（如 1 天变 0.5 天）。
2. **后端**：在 `server/portal/routers/portalLeaveRouter.ts` 的 `create` 接口中，接收并保存 `isHalfDay` 字段到 `leaveRecords` 表。

## Bug 14: RBAC 角色权限需要验证
**问题描述**：Portal的Viewer角色可能越权访问了Admin或HR的功能。
**修复方案**：
1. **后端**：检查 `server/portal/portalTrpc.ts` 中的过程定义，确保修改类操作（如 `create`, `update`, `delete`, `approve`）使用 `portalHrProcedure` 或 `portalAdminProcedure`，而不是基础的 `protectedPortalProcedure`。

## Bug 15: Admin resend invite 未能复制链接到剪贴板
**问题描述**：在Admin后台点击Resend Invite时，提示复制成功，但实际剪贴板为空。
**修复方案**：
1. **后端**：在 `server/routers/userManagement.ts` 的 `resendInvite` 接口中，确保返回新生成的 `inviteUrl`。
2. **前端**：在 `client/src/pages/Settings.tsx` 中，接收返回的 `inviteUrl`，并使用兼容性更好的剪贴板复制方法（如创建临时 textarea 元素作为 fallback），确保在非 HTTPS 环境下也能复制成功。
