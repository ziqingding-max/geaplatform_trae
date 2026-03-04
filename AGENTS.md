# AI Agent Onboarding Guide

> **Purpose**: This file is the **single entry point** for any AI Agent starting a new task on this project. Read this file first, then follow the reading order below based on your task type.

---

## 1. System Identity

**GEA EOR SaaS Admin** is a full-stack enterprise SaaS platform for Global Employment Advisors (GEA), managing Employer of Record (EOR), Agency of Record (AOR), and Visa services across 15+ countries. The system consists of three portals: an **Admin Portal** (internal operations), a **Client Portal** (customer self-service), and a **Worker Portal** (employee/contractor self-service). All three share the same database but have completely separate authentication, tRPC instances, and UI.

**Production URLs**: `admin.geahr.com` (Admin) / `app.geahr.com` (Portal) / `worker.geahr.com` (Worker)

---

## 2. Reading Order

Read documents in this order based on your task type. Each document is self-contained and designed for rapid comprehension.

**For new feature development:**

| Order | Document | Focus | Est. Time |
|:---:|:---|:---|:---:|
| 1 | `AGENTS.md` (this file) | System overview, critical rules, checklists | 5 min |
| 2 | `docs/ARCHITECTURE.md` | System architecture, data model, tri-portal design | 8 min |
| 3 | `docs/CONVENTIONS.md` | Coding standards, patterns, file organization | 6 min |
| 4 | `docs/BUSINESS-RULES.md` | Domain logic, state machines, calculations | 10 min |
| 5 | `docs/TESTING.md` | Test strategy, data cleanup, test patterns | 5 min |

**For bug fixes:**

| Order | Document | Focus |
|:---:|:---|:---|
| 1 | `AGENTS.md` (this file) | Critical rules, quick reference |
| 2 | `docs/CONVENTIONS.md` | Coding patterns to follow |
| 3 | `docs/BUSINESS-RULES.md` | Relevant domain rules |
| 4 | `docs/TESTING.md` | How to write regression tests |

**For reference (read as needed):**

| Document | Content |
|:---|:---|
| `docs/PRODUCT.md` | Full feature inventory with module descriptions |
| `docs/rbac-matrix.md` | Role-permission matrix for all modules |
| `docs/data-dictionary.md` | All 48 database tables with column definitions |
| `docs/client-portal-spec.md` | Portal architecture and module details |
| `docs/development-workflow.md` | Sprint process, release checklist |
| `CHANGELOG.md` | Version history and past changes |
| `todo.md` | Current task tracking (append new items here) |

---

## 3. Quick Reference Card

### Tech Stack

| Layer | Technology | Key Files |
|:---|:---|:---|
| Frontend | React 19 + Vite + Tailwind CSS 4 + Shadcn/UI | `client/src/` |
| API | tRPC 11 + SuperJSON + Zod | `server/routers/`, `server/portal/routers/`, `server/worker/routers/` |
| Backend | Node.js 22 + Express 4 | `server/_core/` |
| ORM | Drizzle ORM | `drizzle/schema.ts` |
| Database | SQLite via libsql | `@libsql/client` + `drizzle-orm/libsql`, dialect: `"sqlite"` |
| Auth (Admin) | JWT + bcrypt + HttpOnly Cookie | `server/_core/adminAuth.ts`, `server/_core/authRoutes.ts` |
| Auth (Portal) | JWT + bcrypt + Invite Registration | `server/portal/portalAuth.ts` |
| Auth (Worker) | JWT + bcrypt + Invite Registration | `server/worker/workerAuth.ts` |
| Testing | Vitest | `server/*.test.ts` |
| i18n | Zustand-based EN/ZH store | `client/src/lib/i18n.ts`, `useI18n()` + `t("key")` |
| Formatting | Centralized utilities | `client/src/lib/format.ts` |
| AI Routing | 阿里云 DashScope via AI Gateway | `server/services/aiGatewayService.ts` |
| Copilot | Global Smart Assistant | `client/src/components/CopilotSmartAssistant.tsx` |
| Notification | In-App & Email Notifications | `server/services/notificationService.ts` |
| File Storage | 阿里云 OSS (S3-compatible API) | `server/storage.ts` |
| Deployment | Docker Compose + Nginx + Certbot SSL | 阿里云马来西亚 (ap-southeast-3) |

### Essential Commands

```bash
pnpm dev              # Start dev server
pnpm test             # Run all Vitest tests
pnpm db:push          # Generate + run Drizzle migrations
npx tsc --noEmit      # Type check without emitting
```

### Key File Map
```
drizzle/schema.ts              → 48 database tables (source of truth for data model)
drizzle/relations.ts           → Table relationships
server/procedures.ts           → Role-based middleware (admin/customerManager/operationsManager/financeManager)
server/routers.ts              → Admin tRPC router aggregation (31 routers)
server/portal/portalRouter.ts  → Portal tRPC router aggregation (12 routers)
server/worker/workerRouter.ts  → Worker tRPC router aggregation (7 routers)
server/cronJobs.ts             → Scheduled tasks
server/services/               → Complex business logic (invoice generation, deposits, credit notes)
server/services/db/            → Database query helpers (financeService, employeeService, etc.)
shared/roles.ts                → Multi-role parsing and validation
shared/const.ts                → System constants (cookie names, error messages)
client/src/components/Layout.tsx    → Admin sidebar navigation structure
client/src/components/PortalLayout.tsx → Portal sidebar navigation
client/src/pages/worker/WorkerLayout.tsx → Worker sidebar navigation
client/src/lib/format.ts       → Date/currency/country formatting (MUST use these)
client/src/lib/i18n.ts         → Translation dictionary (MUST add translations here)
client/src/App.tsx             → Route definitions (Admin + Portal + Worker)
server/services/aiGatewayService.ts → Central AI task routing and execution gateway (Use this!)
server/services/copilotService.ts   → Copilot business logic and chat handling
client/src/components/CopilotSmartAssistant.tsx → Global floating assistant component
docs/copilot-ai-routing-spec.md     → AI routing specification
server/services/notificationService.ts → Notification delivery (In-App + Email)
client/src/components/NotificationCenter.tsx → Notification UI component
```

---

## 4. Critical Rules (MUST NOT Violate)

These rules are non-negotiable. Violating any of them will cause production issues.

### Rule 1: Tri-Portal Isolation

Admin, Portal, and Worker are **completely separate** tRPC instances. Admin uses `server/routers/` with `protectedProcedure` (JWT via `adminAuth.ts`). Portal uses `server/portal/routers/` with `protectedPortalProcedure` (JWT via `portalAuth.ts`). Worker uses `server/worker/routers/` with `protectedWorkerProcedure` (JWT via `workerAuth.ts`). **Never import procedures across portal boundaries.** Portal procedures MUST always filter by `ctx.portalUser.customerId` — no cross-customer data access is allowed. Worker procedures MUST always filter by `ctx.workerUser.employeeId` — no cross-employee data access is allowed.

### Rule 2: Role-Based Access

Use the correct procedure middleware from `server/procedures.ts`. Admin and User roles are **exclusive** (single-select). Manager roles (customer_manager, operations_manager, finance_manager) can be **combined** as comma-separated strings. Always use `hasAnyRole()` from `shared/roles.ts` for permission checks — never compare role strings directly.

### Rule 3: Date/Time as UTC Timestamps

Store all business timestamps as **UTC milliseconds** in the database. Display dates using `formatDate()` from `client/src/lib/format.ts` — never use raw `new Date().toLocaleDateString()`. Cutoff logic uses **UTC+8 time**. The monthly cutoff is the **5th of each month**. **Important**: Schema columns with `text` type for dates (e.g., `startDate`, `endDate`, `invoiceMonth`, `dueDate`) must receive **string values** (e.g., `"2026-03-01"`), NOT `Date` objects.

### Rule 4: Currency Formatting

Use `formatAmount(value, currency)` from `format.ts`. KRW, VND, IDR display **0 decimal places**; all others display **2 decimal places**. Employee salary currency is locked to the country's legal currency — it cannot be manually selected.

### Rule 5: i18n for All User-Facing Text

Every user-facing string must go through `client/src/lib/i18n.ts` (Zustand-based store). Add both EN and ZH translations. Use `const { t } = useI18n()` in components — never hardcode display text. Status labels use the `statusLabels` mapping — never use `.replace("_", " ")`.

### Rule 6: Zero-Tolerance Test Data Policy

**This system shares a single database between dev server and production. Test data leakage has caused production incidents before.** Every test file MUST: (1) call `cleanup.track*()` immediately after every `create` call, before any assertions; (2) include `afterAll(async () => { await cleanup.run(); })` at the top level; (3) never create data via the browser UI during testing. Before saving any checkpoint, run the post-test audit queries in `docs/TESTING.md` Section 10 to verify zero test data remains. This is a **blocking requirement** — no checkpoint until the database is clean. See `docs/TESTING.md` Sections 9-10 for full details.

### Rule 7: File Storage via 阿里云 OSS

Never store file bytes in database columns. Use `storagePut()` from `server/storage.ts` to upload to 阿里云 OSS (S3-compatible API via `@aws-sdk/client-s3`), then store the URL in the database.

### Rule 8: Invoice Status Transitions

Invoice statuses follow a strict flow: `draft → pending_review → sent → paid/overdue/void`. Credit notes can only be applied to invoices in `pending_review` status — never to `sent` invoices. The `amountDue` field must be recalculated whenever credits are applied.

### Rule 9: Payroll Cutoff Lock

On the 5th of each month, the cron job auto-locks the previous month's `submitted` adjustments and leave records to `locked` status. Locked records cannot be edited or deleted by any role. New payroll runs are auto-created with locked data.

### Rule 10: No Direct `server/_core/` Edits

The `server/_core/` directory is framework-level infrastructure (Auth, tRPC setup, Vite bridge). Do not modify files in this directory unless explicitly extending infrastructure capabilities.

### Rule 11: AI Task Routing

Direct calls to underlying LLM providers are **strictly prohibited** for business tasks. All AI capabilities MUST be routed through `executeTaskLLM()` in `server/services/aiGatewayService.ts`. This ensures centralized control over provider selection (阿里云 DashScope), fallback strategies, and observability.

### Rule 12: Notification Channels

Always use `server/services/notificationService.ts` for sending alerts. Notifications must be localized (i18n) and support both **In-App** (for dashboard alerts) and **Email** (for critical updates). Never send raw emails using `nodemailer` directly.

### Rule 13: Contractor Invoicing
Contractor invoices are handled separately from standard payroll runs. Use `server/services/contractorInvoiceGenerationService.ts` for logic. The cron job runs daily at 01:00 to generate invoices for active contractors.

### Rule 14: Copilot Implementation

Copilot business logic resides in `server/services/copilotService.ts`. It must use `aiGatewayService.ts` for all LLM interactions. The frontend component `client/src/components/CopilotSmartAssistant.tsx` must only handle UI, delegating logic to the backend.

### Rule 15: Worker Portal Access

Worker Portal uses a separate `server/worker/routers/` namespace and authentication flow (`server/worker/workerAuth.ts`). Ensure `protectedWorkerProcedure` is used for all worker-facing endpoints to enforce correct scoping by `ctx.workerUser.employeeId`.

---

## 5. How to Add a New Feature

Follow this checklist in order. Each step maps to a specific file.

**Step 1 — Update todo.md.** Append the new feature as `[ ]` items at the bottom of `todo.md` before writing any code.

**Step 2 — Define Schema.** Add or modify tables in `drizzle/schema.ts`. Define relationships in `drizzle/relations.ts`. Run `pnpm db:push` to generate and apply migrations.

**Step 3 — Write Query Helpers.** Add database query functions in `server/services/db/`. For complex business logic (calculations, multi-step operations), create a service file in `server/services/`.

**Step 4 — Create tRPC Procedures.** Create a new router file in `server/routers/<feature>.ts` (or `server/portal/routers/portal<Feature>Router.ts` for portal, or `server/worker/routers/worker<Feature>Router.ts` for worker). Use the appropriate procedure middleware from `server/procedures.ts`. Define Zod input schemas. Register the router in `server/routers.ts` (or `server/portal/portalRouter.ts` or `server/worker/workerRouter.ts`).

**Step 5 — Build Frontend.** Create page component in `client/src/pages/<Feature>.tsx`. Use `trpc.<feature>.useQuery()` and `trpc.<feature>.useMutation()` for data. Add i18n translations in `client/src/lib/i18n.ts` (both EN and ZH). Register the route in `client/src/App.tsx`. Add sidebar navigation in the appropriate Layout component.

**Step 6 — Write Tests.** Create `server/<feature>.test.ts` with Vitest. Test happy path, error cases, and permission checks. Include `afterAll` cleanup. Run `pnpm test` to verify.

**Step 7 — Mark Complete.** Update `todo.md` to mark items as `[x]`. Save checkpoint.

---

## 6. How to Fix a Bug

**Step 1 — Reproduce.** Check browser console logs and network logs. Identify the failing tRPC procedure or component.

**Step 2 — Locate.** Trace from the frontend page → tRPC hook → router procedure → db query/service. Check `docs/BUSINESS-RULES.md` for relevant domain rules.

**Step 3 — Fix.** Apply the fix following patterns in `docs/CONVENTIONS.md`. If the fix involves a state transition, verify against the state machine in `docs/BUSINESS-RULES.md`.

**Step 4 — Write Regression Test.** Add a test case in the relevant `*.test.ts` file that reproduces the bug scenario and verifies the fix. Include cleanup in `afterAll`.

**Step 5 — Verify.** Run `pnpm test` (all tests pass). Run `npx tsc --noEmit` (zero errors). Check the browser for the fixed behavior.

**Step 6 — Document.** Update `todo.md` with the bug fix. Save checkpoint.

---

## 7. Cron Jobs Schedule

These jobs run automatically. Be aware of their timing when debugging or modifying related features.

| Time | Job | What It Does |
|:---|:---|:---|
| Daily 00:01 | Employee Auto-Activation | Activates employees whose `startDate` has arrived |
| Daily 00:02 | Leave Status Transition | Updates leave records based on date ranges |
| Daily 00:03 | Overdue Invoice Detection | Marks unpaid invoices past `dueDate` as `overdue` |
| Daily 01:00 | Contractor Invoice Gen | Auto-generates invoices for contractors |
| Daily 00:05 | Exchange Rate Fetch | Fetches ECB rates (published ~16:00 CET) |
| Monthly 1st 00:10 | Leave Accrual | Accrues leave balances for eligible employees |
| Monthly 5th 00:00 | Auto-Lock | Locks previous month's `submitted` adjustments and leave to `locked` |
| Monthly 5th 00:01 | Auto-Create Payroll | Creates payroll runs with locked data for each country |

---

## 8. Database Table Groups

The 48 tables are organized into these functional groups. Refer to `docs/data-dictionary.md` for full column definitions.

| Group | Tables | Description |
|:---|:---|:---|
| Core Entities | `customers`, `employees`, `billingEntities`, `countriesConfig` | Primary business entities |
| Contacts & Auth | `customerContacts`, `users` | Admin users and portal contacts |
| Contracts | `customerContracts`, `employeeContracts` | Legal agreements |
| Documents | `employeeDocuments`, `salesDocuments` | File attachments |
| Pricing | `customerPricing` | Per-country or global discount pricing |
| Leave | `customerLeavePolicies`, `leaveTypes`, `leaveRecords`, `leaveBalances`, `publicHolidays` | Leave management |
| Payroll | `payrollRuns`, `payrollItems` | Monthly payroll processing |
| Adjustments | `adjustments` | Bonuses, allowances, deductions |
| Reimbursements | `reimbursements` | Employee expense claims |
| Invoices | `invoices`, `invoiceItems`, `creditNoteApplications` | Billing and line items |
| Wallet | `customerWallets`, `walletTransactions` | Customer prepayment management |
| Vendors | `vendors`, `vendorBills`, `vendorBillItems`, `billInvoiceAllocations` | Supplier management |
| Finance | `exchangeRates`, `quotations`, `salaryBenchmarks` | Currency, quotes, benchmarks |
| Sales | `salesLeads`, `salesActivities`, `salesDocuments` | CRM pipeline |
| Country Data | `countriesConfig`, `countrySocialInsuranceItems`, `countryGuideChapters` | Country-specific config |
| AI | `aiProviderConfigs`, `aiTaskPolicies`, `aiTaskExecutions` | AI gateway configuration |
| Knowledge | `knowledgeItems`, `knowledgeSources`, `knowledgeFeedbackEvents`, `knowledgeMarketingEvents` | Knowledge base |
| System | `auditLogs`, `systemConfig`, `systemSettings`, `notifications`, `onboardingInvites` | Operations and config |
