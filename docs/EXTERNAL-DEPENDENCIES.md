# GEA EOR SaaS — 外部依赖与系统级 API 清单

> **版本**: v1.0 | **更新日期**: 2026-02-28
>
> 本文档列出系统运行所依赖的全部外部 API、平台服务和数据源。
> 在将系统改版为其他公司系统时，必须逐项确认每个依赖是否已正确配置。

---

## 一、依赖总览

| 序号 | 依赖名称 | 类型 | 是否需要 API Key | 用途 | 关键程度 |
|------|----------|------|-----------------|------|----------|
| 1 | ExchangeRate-API | 外部免费 API | 否 | 汇率自动抓取（主源） | **关键** |
| 2 | Frankfurter API (ECB) | 外部免费 API | 否 | 汇率抓取（备用源） | 中等 |
| 3 | Manus LLM (invokeLLM) | 平台内置服务 | 自动注入 | 供应商发票 PDF 智能解析 | 中等 |
| 4 | Manus S3 Storage (storagePut) | 平台内置服务 | 自动注入 | 文件上传存储（发票、收据、文档） | **关键** |
| 5 | Manus Notification (notifyOwner) | 平台内置服务 | 自动注入 | 系统通知（逾期发票、异常告警） | 中等 |
| 6 | Manus OAuth | 平台内置服务 | 自动注入 | 管理后台用户认证 | **关键** |
| 7 | CJK 字体 CDN | 静态资源 | 否 | 发票 PDF 中文字符渲染 | 低 |
| 8 | Nager.Date API | 外部免费 API | 否 | 公共假期数据（schema 预留，**尚未实现自动抓取**） | 待实现 |

---

## 二、详细说明

### 1. 汇率自动抓取服务

这是系统中**最核心的外部 API 依赖**，直接影响发票金额计算。

**实现文件**: `server/services/exchangeRateFetchService.ts`

**双源容灾架构**:

| 属性 | 主源: ExchangeRate-API | 备用源: Frankfurter API |
|------|----------------------|----------------------|
| URL | `https://open.er-api.com/v6/latest/{BASE}` | `https://api.frankfurter.dev/v1/latest?from={BASE}&to={CURRENCIES}` |
| 覆盖范围 | 166 种货币 | 30 种货币（ECB 参考汇率） |
| API Key | 不需要 | 不需要 |
| 更新频率 | 每日 | 每日（ECB 16:00 CET 发布） |
| 超时设置 | 15 秒 | 10 秒 |

**调用方式**:
- **自动**: Cron Job 每日 00:05 北京时间执行 `fetchAndStoreExchangeRates()`
- **手动**: Admin 通过 `exchangeRates.triggerFetch` tRPC mutation 触发
- **实时查询**: `exchangeRates.liveRate` 端点直接调用 ExchangeRate-API 获取实时汇率（不存储）

**业务逻辑**:
- 所有汇率以 **USD → XXX** 方向存储
- 自动应用全局 markup（默认 2%），可在系统设置中调整
- 主源失败自动降级到备用源
- 汇率存入 `exchange_rates` 表，含 `rawRate`（原始汇率）和 `rate`（含 markup 汇率）

**改版注意**: 如果新系统的基础货币不是 USD，需要修改 `exchangeRateFetchService.ts` 中的 base currency 逻辑。

---

### 2. Manus LLM 服务（invokeLLM）

**实现文件**: `server/routers/pdfParsing.ts`

**用途**: 供应商发票 PDF 智能解析，使用 AI 从上传的 PDF/图片中提取结构化数据。

**调用场景**:
- `pdfParsing.parseVendorInvoices` — 多文件批量解析，交叉验证供应商账单
- `pdfParsing.parseVendorInvoice` — 单文件快速解析

**工作流程**:
1. 前端上传文件到 S3（通过 `storagePut`）
2. 将文件 URL 和系统上下文（员工列表、客户列表、现有发票）发送给 LLM
3. LLM 返回结构化 JSON（供应商名称、发票号、行项目、金额等）
4. 前端展示解析结果，用户确认后创建 Vendor Bill

**依赖配置**: 通过 `BUILT_IN_FORGE_API_URL` 和 `BUILT_IN_FORGE_API_KEY` 环境变量自动注入，无需手动配置。

**改版注意**: 如果脱离 Manus 平台部署，需要替换为 OpenAI API 或其他 LLM 服务，修改 `server/_core/llm.ts` 中的调用逻辑。

---

### 3. Manus S3 文件存储（storagePut / storageGet）

**实现文件**: `server/storage.ts`

**使用场景**（共 10+ 个上传点）:

| 模块 | 文件类型 | 存储路径模式 |
|------|----------|-------------|
| 客户管理 | 合同、文档 | `customers/{customerId}/documents/` |
| 员工管理 | 护照、合同、证件 | `employees/{employeeId}/documents/` |
| 薪酬调整 | 收据凭证 | `adjustments/{adjustmentId}/receipts/` |
| 报销管理 | 报销凭证 | `reimbursements/{reimbursementId}/receipts/` |
| 账单实体 | 公司 Logo | `billing-entities/{entityId}/logo/` |
| 供应商发票 | PDF 原件 | `vendor-bills/uploads/` |
| 客户门户 | 员工文档、调整凭证、报销凭证 | 同上（通过 Portal 路由） |

**依赖配置**: 通过 Manus 平台自动注入 AWS S3 凭证，无需手动配置。

**改版注意**: 如果脱离 Manus 平台，需要自行配置 AWS S3 Bucket 并设置环境变量 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_REGION`、`S3_BUCKET`。

---

### 4. Manus 通知服务（notifyOwner）

**实现文件**: `server/_core/notification.ts`（平台内置）

**触发场景**:

| 触发点 | 文件位置 | 通知内容 |
|--------|----------|----------|
| 逾期发票检测 | `server/cronJobs.ts:592` | 每日扫描发现逾期发票时通知 Owner |
| 发票状态变更 | `server/routers/invoices.ts:573,606` | 发票被标记为已支付或已取消时通知 |
| 贷记单创建 | `server/routers/invoices.ts:1004` | 创建贷记单时通知 |

**改版注意**: 如果脱离 Manus 平台，需要替换为邮件通知（如 SendGrid、Resend）或企业微信/Slack Webhook。

---

### 5. Manus OAuth 认证

**实现文件**: `server/_core/oauth.ts`、`server/_core/authRoutes.ts`、`server/_core/context.ts`

**认证架构**:

| 门户 | 认证方式 | 说明 |
|------|----------|------|
| Admin 后台 (admin.geahr.com) | Manus OAuth + 密码登录 | 双模式认证，OAuth 用于 Manus 用户，密码用于独立部署 |
| 客户门户 (app.geahr.com) | 邀请链接 + JWT Token | 客户通过管理员生成的邀请链接注册，使用密码 + JWT 认证 |

**关键环境变量**:
- `VITE_APP_ID` — Manus OAuth 应用 ID
- `OAUTH_SERVER_URL` — Manus OAuth 后端 URL
- `VITE_OAUTH_PORTAL_URL` — Manus 登录门户 URL
- `JWT_SECRET` — Session Cookie 签名密钥

**改版注意**: Admin 后台已内置密码登录（`server/_core/authRoutes.ts`），可以完全脱离 Manus OAuth 独立运行。客户门户完全独立于 Manus OAuth，无需修改。

---

### 6. CJK 字体 CDN

**实现文件**: `server/services/invoicePdfService.ts`

**URL**: `https://files.manuscdn.com/user_upload_by_module/session_file/310519663378930055/BicAsHhoridCdJUF.ttf`

**用途**: 发票 PDF 生成时，如果发票内容包含中文/日文/韩文字符，需要下载 Noto Sans SC 字体。首次下载后缓存到 `.font-cache/` 目录。

**改版注意**: 这个 URL 是 Manus CDN 上的字体文件。如果脱离 Manus 平台，需要将字体文件上传到自己的 CDN 或 S3，并更新 `CJK_FONT_URL` 常量。

---

### 7. 公共假期数据（Nager.Date API — 待实现）

**当前状态**: 数据库 schema 已创建（`public_holidays` 表），`source` 字段默认值为 `nager_api`，但**自动抓取功能尚未实现**。

**现有实现**:
- 数据库表 `public_holidays` 已有 97 条记录（手动或通过 SQL 导入）
- `server/db.ts` 提供了 CRUD 函数（`listPublicHolidays`、`createPublicHoliday`、`deletePublicHolidaysByCountryYear`）
- 客户门户 `PortalCompliance.tsx` 有假期日历展示 UI
- **缺失**: 没有从 Nager.Date API 自动抓取的 Service 或 Cron Job

**推荐实现方案**:

```
API: https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}
方法: GET
无需 API Key
返回: [{ date, localName, name, countryCode, fixed, global, types }]
```

建议创建 `server/services/holidayFetchService.ts`，参考 `exchangeRateFetchService.ts` 的双源容灾模式，并添加 Cron Job 每年 1 月 1 日自动抓取当年所有运营国家的假期数据。

---

## 三、定时任务（Cron Jobs）清单

所有定时任务定义在 `server/cronJobs.ts`，时区统一为 `Asia/Shanghai`（北京时间）。

| 执行时间 | 任务名称 | 函数 | 说明 |
|----------|----------|------|------|
| 每日 00:01 | 员工自动激活 | `runEmployeeAutoActivation()` | 将到达入职日期的 pending 员工自动转为 active |
| 每日 00:02 | 假期状态转换 | `runLeaveStatusTransition()` | 自动将员工状态在 active ↔ on_leave 之间切换 |
| 每日 00:03 | 逾期发票检测 | `runOverdueInvoiceDetection()` | 扫描已过 due_date 的未付发票，标记为 overdue 并通知 |
| 每日 00:05 | 汇率自动抓取 | `fetchAndStoreExchangeRates()` | 从 ExchangeRate-API / Frankfurter 抓取最新汇率 |
| 每月 1 日 00:10 | 假期余额累计 | `runMonthlyLeaveAccrual()` | 为新员工按 pro-rata 计算并累计年假余额 |
| 每月 5 日 00:00 | 数据自动锁定 | `runAutoLock()` | 锁定上月已提交的薪酬调整和假期数据 |
| 每月 5 日 00:01 | 薪酬单自动创建 | `runAutoCreatePayrollRuns()` | 基于锁定数据自动创建当月薪酬单 |

**改版注意**: 这些 Cron Job 使用 `node-cron` 库，在服务器进程内运行。如果部署到无状态环境（如 Vercel Serverless），需要迁移到外部调度服务（如 AWS EventBridge、Vercel Cron）。

---

## 四、Seed 数据与初始化

### 默认管理员账户

**实现文件**: `server/seedAdmin.ts`

服务器首次启动时自动创建默认管理员：

| 字段 | 值 |
|------|-----|
| 邮箱 | `simon.ding@bestgea.com` |
| 密码 | `BestGEA2026~~` |
| 姓名 | Simon Ding |
| 角色 | admin |

**改版注意**: 改版时**必须修改**此文件中的默认管理员信息（邮箱、密码、姓名），否则会创建错误的管理员账户。

### 国家配置数据

`countries_config` 表存储各国的劳动法参数（试用期、通知期、法定年假、EOR 费率等）。这些数据通过 Admin 后台的"Countries"页面手动管理，没有自动 seed 脚本。

**改版注意**: 新系统需要手动配置运营国家数据，或编写 seed 脚本批量导入。

---

## 五、改版检查清单

将系统改版为其他公司系统时，按以下顺序逐项确认：

| 序号 | 检查项 | 文件位置 | 操作 |
|------|--------|----------|------|
| 1 | 修改默认管理员信息 | `server/seedAdmin.ts` | 改邮箱、密码、姓名 |
| 2 | 确认汇率 API 可用 | `server/services/exchangeRateFetchService.ts` | 验证 ExchangeRate-API 和 Frankfurter 在部署区域可访问 |
| 3 | 配置 S3 存储 | `server/storage.ts` | Manus 平台自动注入；独立部署需配置 AWS 凭证 |
| 4 | 配置 LLM 服务 | `server/_core/llm.ts` | Manus 平台自动注入；独立部署需配置 OpenAI API Key |
| 5 | 配置通知服务 | `server/_core/notification.ts` | Manus 平台自动注入；独立部署需替换为邮件/Webhook |
| 6 | 配置认证方式 | `server/_core/oauth.ts` | Admin 密码登录已内置；Portal 完全独立 |
| 7 | 替换 CJK 字体 URL | `server/services/invoicePdfService.ts` | 将字体上传到自己的 CDN |
| 8 | 导入国家配置 | Admin 后台 → Countries | 手动配置或编写 seed 脚本 |
| 9 | 导入公共假期 | 数据库 `public_holidays` 表 | 手动导入或实现 Nager API 自动抓取 |
| 10 | 验证 Cron Jobs | `server/cronJobs.ts` | 确认时区设置和执行频率符合业务需求 |
| 11 | 更新品牌信息 | `shared/const.ts`、i18n、Logo | 替换公司名称、Logo、邮件模板 |
