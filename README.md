# GEA EOR SaaS Admin

**GEA — Global Employment Advisors** 是一套企业级 Employer of Record (EOR) 全球雇佣管理系统，为 EOR 服务商提供从客户签约、员工入职、多国薪酬处理到发票结算的端到端数字化解决方案。系统采用 TypeScript 全栈架构，前后端类型安全，支持中英双语，覆盖 126 个国家和地区。

> **管理后台**: [admin.geahr.com](https://admin.geahr.com)
> **客户门户**: [app.geahr.com](https://app.geahr.com)
> **员工门户**: [worker.geahr.com](https://worker.geahr.com)
> **代码仓库**: [github.com/ziqingding-max/geaplatform_trae](https://github.com/ziqingding-max/geaplatform_trae)

---

## 系统架构

系统由三个独立的门户组成，共享同一套后端服务和数据库，通过严格的权限隔离确保数据安全。

| 门户 | 目标用户 | 认证方式 | 访问路径 |
|------|---------|---------|---------|
| **管理后台 (Admin Portal)** | 客户经理、运营经理、财务经理 | JWT + bcrypt + HttpOnly Cookie | `admin.geahr.com` |
| **客户门户 (Client Portal)** | 客户 HR、财务联系人 | JWT + bcrypt + 邀请注册 | `app.geahr.com` |
| **员工门户 (Worker Portal)** | 员工、承包商 | JWT + bcrypt + 邀请注册 | `worker.geahr.com` |

```
┌──────────────────────────────────────────────────────────────┐
│           阿里云马来西亚 (ap-southeast-3)                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Docker Compose + Nginx + Certbot SSL                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │  │
│  │  │  Vite    │  │  tRPC    │  │  Portal / Worker   │   │  │
│  │  │  Static  │  │  /api/   │  │  tRPC Endpoints    │   │  │
│  │  └──────────┘  └──────────┘  └────────────────────┘   │  │
│  │       │              │               │                 │  │
│  │       ▼              ▼               ▼                 │  │
│  │  ┌───────────────────────────────────────────────────┐ │  │
│  │  │           Drizzle ORM + SQLite (libsql)           │ │  │
│  │  └───────────────────────────────────────────────────┘ │  │
│  │       │              │               │                 │  │
│  │  ┌────▼────┐  ┌──────▼─────┐  ┌──────▼──────┐        │  │
│  │  │ 阿里云  │  │   Cron     │  │  DashScope  │        │  │
│  │  │  OSS    │  │   Jobs     │  │  AI 服务    │        │  │
│  │  └─────────┘  └────────────┘  └─────────────┘        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | React 19 + TypeScript + Vite | SPA 架构，HMR 热更新 |
| **UI 组件** | Shadcn/UI + Radix UI + Tailwind CSS 4 | 无障碍访问，响应式设计 |
| **图表** | Recharts | Dashboard 数据可视化 |
| **路由** | Wouter | 轻量级路由，支持子域名分发 |
| **国际化** | Zustand-based i18n (`@/lib/i18n.ts`) | 中英双语实时切换，`useI18n()` + `t("key")` |
| **API 层** | tRPC 11 + SuperJSON | 端到端类型安全，零手写 API Schema |
| **后端运行时** | Node.js 22 + Express 4 | 稳定高效的服务端 |
| **ORM** | Drizzle ORM | TypeScript-first，Schema 即代码 |
| **数据库** | SQLite via libsql | 48 张业务表，`@libsql/client` + `drizzle-orm/libsql` |
| **认证** | JWT + bcrypt (全部三个门户) | HS256 签名 via `jose`，HttpOnly Cookie，互不干扰 |
| **文件存储** | 阿里云 OSS (S3-compatible API) | 员工文档、发票 PDF、报销凭证 |
| **AI 服务** | 阿里云 DashScope | AI Gateway 统一路由，支持 qwen-turbo/qwen-max 等模型 |
| **智能助手** | Trae Copilot | 全局悬浮助手，支持上下文感知与快捷操作 |
| **定时任务** | node-cron | 员工自动激活、薪酬生成、汇率抓取等 |
| **自动化测试** | Playwright + Shell Scripts | 夜间自动回归测试，HTML 报告生成 |
| **测试** | Vitest | 单元与集成测试，633+ 测试用例 |
| **构建** | esbuild + Vite | 前端 Vite 构建，后端 esbuild 打包 |
| **包管理** | pnpm | 高效依赖管理 |
| **部署** | Docker Compose + Nginx + Certbot SSL | 阿里云马来西亚 (ap-southeast-3)，完全自托管 |

---

## 功能模块

### 管理后台 (Admin Portal)

管理后台提供完整的 EOR 业务管理能力，按角色划分为以下功能模块。

**客户与员工管理** 涵盖客户公司全生命周期管理（签约、定价、合同、联系人），以及跨 126 国的员工入职、合同签署、状态流转（`pending_review → onboarding → documents_incomplete → contract_signed → active → on_leave → offboarding → terminated`）。系统支持客户门户邀请、一键生成邀请链接，并通过自助入职表单让员工自行填写个人信息。

**薪酬处理** 以国家为维度组织薪酬批次（Payroll Run），支持自动填充（Auto-Fill）从调整项和休假记录聚合数据，按工作日比例计算入职/离职月份的 Pro-rata 薪资。每月 5 日自动创建当月薪酬批次，4 日截止上月数据录入，支持管理员手动覆盖截止日期限制。

**发票与财务** 支持 7 种发票类型（月度 EOR/Visa EOR/AOR、押金、签证服务费、贷记单、押金退还），自动从已审批薪酬生成发票，按客户 × 国家 × 服务类型 × 币种分组。发票支持多币种（本地货币 + 结算货币），自动获取汇率并加收 Markup。贷记单支持全额/部分冲红，可抵扣至待审核发票。发票 PDF 导出包含 Billing Entity Logo、银行信息和 VAT 明细。

**汇率管理** 集成 ExchangeRate-API（主）和 Frankfurter/ECB（备），每日自动抓取 166 种货币汇率，支持全局 Markup 百分比配置和管理员手动覆盖。

**供应商与成本** 管理供应商信息和账单，支持 AI 智能解析上传的 PDF/图片账单（通过阿里云 DashScope 自动识别供应商、金额、行项目），成本分配到具体员工和发票，生成利润与亏损报告（P&L）。

**合规与审计** 内置 125 国法定假期数据（1,312 条公共假期记录）、法定年假天数、试用期、通知期等合规信息。完整的审计日志记录所有关键操作，支持按用户、操作类型、时间范围筛选。

**仪表盘** 提供五个维度的数据看板（Overview、Operations、Finance、HR & Leave、Activity Log），包含月度趋势图表、收入分析、合同到期预警等，按角色控制可见性。

### 智能助手 (Trae Copilot)
Trae Copilot 是嵌入在系统右下角的全局智能助手，通过 AI Gateway 路由到阿里云 DashScope 模型（如 qwen-turbo、qwen-max），提供以下核心能力：

- **全局悬浮入口**：随时唤起，不打断当前工作流。
- **上下文感知**：自动识别当前页面（如"员工详情页"、"发票列表页"），提供针对性的操作建议（"分析该员工薪资历史"、"解释当前发票状态"）。
- **快捷操作 (Quick Actions)**：一键执行系统功能（如"创建新员工"、"生成本月报表"），无需记忆复杂菜单路径。
- **文件智能分析**：支持拖拽上传 PDF/Excel/图片，自动解析内容并回答相关问题（如"提取简历中的关键技能"、"解释合同条款"）。
- **智能预测**：基于历史数据预测下月薪酬支出趋势或潜在合规风险。

### 通知与自动化 (Notifications & Automation)

系统内置了企业级多渠道通知引擎，支持 **Email**（带 PDF 附件）和 **In-App**（站内信）双通道发送。管理员可在 Settings > Notifications 中可视化配置通知规则和多语言模板。

- **发票发送**：财务点击发送发票时，自动生成 PDF 并发送邮件给客户财务联系人。
- **逾期催款**：每日自动检测逾期发票，向客户发送催款通知。
- **工资单提醒**：每月薪酬草稿生成后，自动通知运营经理进行审核。
- **入职通知**：客户提交新员工入职申请时，实时通知运营团队。
- **夜间自动化测试**：每晚 23:30 自动运行全量端到端测试，覆盖销售、入职、薪酬、发票等核心流程，并在 00:01 自动清理测试数据，生成详细的 HTML 测试报告。

### 客户门户 (Client Portal)

客户门户采用 Apple Liquid Glass 设计语言，为客户提供自助服务能力。

**员工入职** 支持雇主发起入职和员工自助填写两种模式，多步骤向导引导完成个人信息、雇佣条款、薪酬和文档上传。**员工管理** 展示客户名下所有员工的状态、合同和文档信息。**薪酬查看** 按国家和月份浏览已审批的薪酬明细和员工薪资单。**发票与财务** 包含发票列表、账户摘要（应付/已付/贷记余额）、PDF 下载。**休假与调整** 客户可为员工提交休假申请和报销单，经客户审批后流转至管理员确认。**合规中心** 提供各国公共假期日历和雇佣合规信息。**钱包** 客户预付款管理，支持充值、消费和余额查询。

### 员工门户 (Worker Portal)

员工门户为员工和承包商提供自助服务能力，包含以下功能模块：

**个人资料管理** 员工可查看和更新个人信息、联系方式和银行账户。**合同查看** 查看当前雇佣合同条款和历史合同记录。**薪资单与发票** 下载每月薪资单和承包商发票。**里程碑追踪** 查看入职进度、合同续签等关键节点。**自助入职** 新员工通过邀请链接完成注册和个人信息填写。

---

## 权限控制 (RBAC)

系统实现了细粒度的基于角色的访问控制。`admin` 和 `user` 为互斥角色；`operations_manager`、`finance_manager`、`customer_manager` 可组合分配。

| 模块 | Admin | Operations Manager | Finance Manager | Customer Manager |
|------|:-----:|:-----------------:|:---------------:|:---------------:|
| Dashboard（全部 Tab） | ✅ | 部分 | 部分 | 部分 |
| Employees（增删改查） | ✅ | ✅ | 只读 | 只读 |
| Payroll（审批/编辑） | ✅ | ✅ | 只读 | — |
| Leave / Adjustments | ✅ | ✅ | — | — |
| Invoices（生成/编辑） | ✅ | 只读 | ✅ | — |
| Billing Entities | ✅ | — | ✅ | — |
| Settings（汇率/用户） | ✅ | — | — | — |
| Vendors / P&L | ✅ | — | ✅ | — |
| Sales CRM | ✅ | — | — | ✅ |

完整的权限矩阵详见 [docs/rbac-matrix.md](docs/rbac-matrix.md)。

---

## 数据库模型

系统包含 48 张业务表，核心实体关系如下：

```
customers ──┬── customer_contacts
            ├── customer_pricing
            ├── customer_contracts
            ├── customer_leave_policies
            ├── customer_wallets ── wallet_transactions
            └── employees ──┬── employee_contracts
                            ├── employee_documents
                            ├── leave_balances
                            ├── leave_records
                            ├── adjustments
                            ├── reimbursements
                            └── payroll_items ── payroll_runs

billing_entities ── invoices ──┬── invoice_items
                               └── credit_note_applications

vendors ── vendor_bills ──┬── vendor_bill_items
                          └── bill_invoice_allocations

countries_config ──┬── leave_types
                   ├── public_holidays
                   ├── country_social_insurance_items
                   └── country_guide_chapters

users (admin)    exchange_rates    audit_logs    system_config    system_settings
sales_leads ──┬── sales_activities
              └── sales_documents
onboarding_invites    quotations    salary_benchmarks    notifications

ai_provider_configs ── ai_task_policies ── ai_task_executions
knowledge_items ── knowledge_sources
knowledge_feedback_events    knowledge_marketing_events
```

完整的数据字典详见 [docs/data-dictionary.md](docs/data-dictionary.md)。

---

## 定时任务
系统通过 `server/cronJobs.ts` 注册以下自动化任务：

| 任务 | 执行时间 (UTC+8) | 说明 |
|------|-------------------|------|
| 员工自动激活 | 每日 00:01 | `contract_signed` 且 `startDate ≤ today` → `active`，自动加入当月薪酬 |
| 休假状态同步 | 每日 00:01 | 休假开始 → `on_leave`；休假结束 → `active` |
| 发票逾期检测 | 每日 01:00 | `sent` 且 `dueDate < today` → `overdue` |
| 夜间自动化测试 | 每日 23:30 | 全量端到端测试，覆盖 6 大核心模块 |
| 测试数据清理 | 每日 00:01 | 清理测试产生的临时数据 |
| 汇率自动抓取 | 每日 17:00 CET | 从 ExchangeRate-API 获取 USD 基准汇率 |
| 数据自动锁定 | 每月 5 日 00:00 | 锁定上月已提交的调整项和休假记录 |
| 薪酬批次生成 | 每月 5 日 00:01 | 为有活跃员工的国家自动创建当月薪酬批次 |

---

## 项目结构

```
gea-eor-saas-admin/
├── client/                     # 前端代码
│   ├── public/                 # 静态资源
│   └── src/
│       ├── components/         # 可复用组件 (Shadcn UI + 自定义)
│       ├── hooks/              # useAuth, usePortalAuth, useWorkerAuth, useMobile 等
│       ├── lib/                # tRPC 客户端, 格式化工具, CSV 导出, i18n (Zustand store)
│       ├── pages/              # 管理后台页面 (25 个页面)
│       │   ├── portal/         # 客户门户页面 (23 个页面)
│       │   └── worker/         # 员工门户页面 (8 个页面)
│       ├── App.tsx             # 主路由 (子域名分发: admin/portal/worker)
│       └── main.tsx            # 入口文件 (tRPC Provider)
├── server/
│   ├── _core/                  # 框架层 (tRPC, Express, Auth, Vite)
│   │   ├── adminAuth.ts        # Admin JWT 认证 (HS256 via jose)
│   │   └── authRoutes.ts       # Admin 登录/注册路由
│   ├── portal/                 # 客户门户后端
│   │   ├── routers/            # 12 个门户路由
│   │   ├── portalAuth.ts       # Portal JWT 认证
│   │   └── portalTrpc.ts       # 门户 tRPC 实例
│   ├── worker/                 # 员工门户后端
│   │   ├── routers/            # 7 个员工路由
│   │   ├── workerAuth.ts       # Worker JWT 认证
│   │   └── workerTrpc.ts       # 员工 tRPC 实例
│   ├── routers/                # 31 个管理后台路由
│   ├── services/               # 业务服务层
│   │   └── db/                 # 数据库查询服务
│   ├── utils/                  # 工具函数 (截止日期, 格式化等)
│   ├── cronJobs.ts             # 定时任务
│   └── storage.ts              # 阿里云 OSS 文件存储 (S3-compatible API)
├── drizzle/
│   ├── schema.ts               # 数据库 Schema (48 表)
│   ├── relations.ts            # 表关系定义
│   └── migrations/             # 迁移文件
├── shared/                     # 前后端共享代码
│   ├── const.ts                # 常量 (Cookie 名称, 错误消息等)
│   ├── roles.ts                # 多角色解析工具
│   └── types.ts                # 共享类型
├── docs/                       # 项目文档
│   ├── ARCHITECTURE.md         # 系统架构文档
│   ├── PRODUCT.md              # 产品文档
│   ├── DEPLOYMENT.md           # 部署文档
│   ├── data-dictionary.md      # 数据字典
│   ├── rbac-matrix.md          # 权限矩阵
│   └── ...                     # 其他技术文档
├── docker-compose.prod.yml     # 生产环境 Docker Compose
├── Dockerfile                  # Docker 构建文件
├── nginx.conf                  # Nginx 配置
├── README.md                   # 本文件
├── CHANGELOG.md                # 变更日志
├── AGENTS.md                   # AI 辅助开发规则
├── package.json                # 依赖与脚本
├── vite.config.ts              # Vite 配置
├── drizzle.config.ts           # Drizzle 配置 (dialect: "sqlite")
├── vitest.config.ts            # 测试配置
└── tsconfig.json               # TypeScript 配置
```

---

## 快速开始

### 环境要求

| 组件 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 18.x | 22.x LTS |
| pnpm | 8.x | 9.x |

> **注意**: 数据库使用 SQLite (libsql)，无需额外安装数据库服务。

### 安装与启动
```bash
# 1. 克隆仓库
git clone https://github.com/ziqingding-max/geaplatform_trae.git
cd geaplatform_trae

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 JWT_SECRET、数据库路径和其他配置

# 4. 数据库迁移
pnpm db:push

# 5. 初始化种子数据 (可选)
node seed.mjs

# 6. 启动开发服务器
pnpm dev
```

启动后访问 `http://localhost:3000` 即可使用系统。

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（前后端同时启动） |
| `pnpm build` | 构建生产版本 |
| `pnpm test` | 运行全部测试 |
| `pnpm db:push` | 生成并执行数据库迁移 |
| `pnpm format` | 格式化代码 |

### 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|:----:|
| `DATABASE_URL` | SQLite 数据库路径 (如 `file:./data/dev.db`) | ✅ |
| `JWT_SECRET` | JWT 签名密钥 (Admin/Portal/Worker 共用) | ✅ |
| `ADMIN_BOOTSTRAP_EMAIL` | 初始管理员邮箱 | ✅ |
| `ADMIN_BOOTSTRAP_PASSWORD` | 初始管理员密码 | ✅ |
| `ADMIN_BOOTSTRAP_NAME` | 初始管理员姓名 | ✅ |
| `ADMIN_APP_URL` | 管理后台 URL (如 `https://admin.geahr.com`) | ✅ |
| `PORTAL_APP_URL` | 客户门户 URL (如 `https://app.geahr.com`) | ✅ |
| `WORKER_APP_URL` | 员工门户 URL (如 `https://worker.geahr.com`) | ✅ |
| `OSS_ACCESS_KEY_ID` | 阿里云 OSS Access Key | 可选 |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 OSS Secret Key | 可选 |
| `OSS_REGION` | 阿里云 OSS 区域 (如 `oss-cn-hangzhou`) | 可选 |
| `OSS_BUCKET` | 阿里云 OSS Bucket 名称 | 可选 |
| `OSS_ENDPOINT` | 阿里云 OSS Endpoint | 可选 |
| `EMAIL_SMTP_HOST` | SMTP 邮件服务器地址 | 可选 |
| `EMAIL_SMTP_PORT` | SMTP 端口 (默认 465) | 可选 |
| `EMAIL_SMTP_USER` | SMTP 用户名 | 可选 |
| `EMAIL_SMTP_PASS` | SMTP 密码 | 可选 |
| `DASHSCOPE_API_KEY` | 阿里云 DashScope API Key (AI 功能) | 可选 |

完整的环境变量说明和部署指南详见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

---

## 开发指南

### 添加新功能的标准流程

1. **Schema**: 在 `drizzle/schema.ts` 中定义或修改表结构，运行 `pnpm db:push`
2. **DB 查询**: 在 `server/services/db/` 中添加数据库查询函数
3. **Router**: 在 `server/routers/` 中创建 tRPC Procedure（选择 `publicProcedure` 或 `protectedProcedure`）
4. **前端**: 在 `client/src/pages/` 中通过 `trpc.*.useQuery / useMutation` 调用后端
5. **测试**: 在 `server/*.test.ts` 中编写 Vitest 测试用例
6. **i18n**: 在 `client/src/lib/i18n.ts` 中添加中英文翻译

### 代码规范

系统遵循以下约定以保持一致性：

- **日期存储**: 所有业务时间戳以 UTC 毫秒级 Unix 时间戳存储，前端展示时转换为用户本地时区
- **日期显示**: 统一使用 `DD MMM YYYY` 格式（如 `28 Feb 2026`），通过 `client/src/lib/format.ts` 集中管理
- **金额格式**: 通过 `formatAmount` 统一处理千分位分隔符和小数精度（KRW/VND/IDR 为 0 位小数，其他 2 位）
- **状态标签**: 所有状态显示通过 `statusLabels` 对象映射，而非直接 `.replace("_", " ")`
- **角色检查**: 使用 `shared/roles.ts` 的 `hasRole / hasAnyRole` 进行多角色判断
- **i18n**: 所有页面使用 `useI18n()` hook 获取 `t` 函数，翻译 key 统一在 `client/src/lib/i18n.ts` 中维护

### 测试

项目包含 40 个测试文件，633+ 测试用例，覆盖核心业务逻辑、权限控制、财务计算和数据隔离。

```bash
# 运行全部测试
pnpm test

# 运行特定测试文件
npx vitest run server/finance-phase1.test.ts

# 监听模式
npx vitest watch
```

所有测试文件均包含 `afterAll` 清理逻辑，确保不会在数据库中残留测试数据。

---

## 文档索引

| 文档 | 说明 |
|------|------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 系统架构文档 |
| [docs/PRODUCT.md](docs/PRODUCT.md) | 产品功能文档 |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 部署架构与运维指南 |
| [docs/data-dictionary.md](docs/data-dictionary.md) | 数据字典（48 张表完整字段说明） |
| [docs/rbac-matrix.md](docs/rbac-matrix.md) | RBAC 权限矩阵 |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | 代码规范与约定 |
| [docs/BUSINESS-RULES.md](docs/BUSINESS-RULES.md) | 业务规则文档 |
| [docs/TESTING.md](docs/TESTING.md) | 测试策略与指南 |
| [docs/EXTERNAL-DEPENDENCIES.md](docs/EXTERNAL-DEPENDENCIES.md) | 外部依赖说明 |
| [docs/finance-module-requirements.md](docs/finance-module-requirements.md) | 财务模块需求与公式 |
| [docs/audit-log-inventory.md](docs/audit-log-inventory.md) | 审计日志清单 |
| [docs/exchange-rate-api-comparison.md](docs/exchange-rate-api-comparison.md) | 汇率 API 对比 |
| [docs/copilot-ai-routing-spec.md](docs/copilot-ai-routing-spec.md) | Copilot 与 AI 路由技术方案 |
| [docs/client-portal-spec.md](docs/client-portal-spec.md) | 客户门户技术规格 |
| [CHANGELOG.md](CHANGELOG.md) | 版本变更日志 |
| [AGENTS.md](AGENTS.md) | AI 辅助开发规则 |

---

## 许可证

本项目为 GEA (Global Employment Advisors) 专有软件，未经授权不得复制、分发或修改。
