# GEA EOR SaaS Admin — 测试计划

> **版本**: 2.0
> **更新日期**: 2026-02-28

---

## 1. 测试策略

系统采用分层测试策略，以 Vitest 自动化测试为核心，辅以手动浏览器验证。

| 层级 | 类型 | 工具 | 覆盖范围 | 执行方式 |
|:---|:---|:---|:---|:---|
| L1 | 单元/集成测试 | Vitest + tRPC caller | 业务逻辑、API 端点、权限验证、数据隔离 | 自动化 |
| L2 | 类型检查 | TypeScript (`tsc --noEmit`) | 全量类型安全 | 自动化 |
| L3 | 服务健康 | `webdev_check_status` | 服务器、依赖、构建 | 半自动 |
| L4 | 浏览器验证 | 手动操作 | 端到端业务流程、UI 交互 | 手动 |

---

## 2. 测试覆盖现状

截至 v3.2，系统共有 **40 个测试文件**，**633+ 测试用例**，覆盖以下核心领域。

| 测试领域 | 代表文件 | 覆盖内容 |
|:---|:---|:---|
| 认证与权限 | `auth.logout.test.ts`, `portal.security.test.ts` | OAuth 登出、Portal JWT 认证、数据隔离 |
| 客户与员工 | `features.test.ts`, `customer-leave-policy.test.ts` | CRUD、状态流转、休假政策 |
| 薪酬处理 | `payroll-refactor.test.ts`, `cutoff-comprehensive.test.ts` | 按国家薪酬、截止日期、Pro-rata 计算 |
| 休假与调整 | `adjustments-leave.test.ts`, `leave-deduction-refactor.test.ts` | 余额计算、跨月拆分、无薪假扣款 |
| 发票与财务 | `finance-phase1/2/3.test.ts`, `invoiceBugFixes.test.ts` | 发票生成、贷记单、PDF、多币种 |
| 会计与成本 | `round51/52-accounting.test.ts`, `allocations.test.ts` | 成本分配、P&L、Deposit 规则 |
| 客户门户 | `portal-features.test.ts`, `portalInvite.test.ts`, `portalPasswordReset.test.ts` | 门户功能、邀请注册、密码重置 |
| 供应商管理 | `vendors.test.ts` | 供应商 CRUD、账单管理 |
| 子域名路由 | `subdomain-routing.test.ts` | admin/portal 子域名分发 |
| 分页与筛选 | `pagination-and-fees.test.ts`, `portal-access-pagination.test.ts` | 分页逻辑、权限过滤 |

---

## 3. 测试数据管理

自动化测试使用独立的测试数据，每个测试文件在 `beforeAll` 中创建所需数据，在 `afterAll` 中清理，确保测试间互不干扰。生产环境的种子数据通过 `seed-migration-data.json` 管理，包含 31 个客户、21 个员工、23 个押金发票等真实业务数据。

---

## 4. 回归测试触发规则

| 变更类型 | 回归范围 |
|:---|:---|
| Schema 变更 | 全量回归（所有模块） |
| Router 变更 | 受影响模块 + 关联模块 |
| Frontend 变更 | 受影响页面 |
| Bug 修复 | 修复模块 + 原始报告场景 |

---

## 5. 缺陷优先级

| 优先级 | 定义 | 响应时间 | 示例 |
|:---|:---|:---|:---|
| P0 | 系统不可用或数据损坏 | 立即修复 | 数据库迁移失败、金额计算错误 |
| P1 | 核心功能异常 | 当轮修复 | 发票生成失败、薪酬计算错误 |
| P2 | 非核心功能或 UI 问题 | 下轮修复 | 筛选器不工作、样式错位 |
| P3 | 优化建议 | 排入 backlog | 性能优化、UX 改进 |
