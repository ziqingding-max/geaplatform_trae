# System Architecture

> **Purpose**: Technical architecture reference for AI Agents and developers. Covers the dual-portal design, data model, authentication flows, API surface, and cron job system.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                             │
│                                                                     │
│  ┌──────────────────────┐         ┌──────────────────────────────┐  │
│  │   Admin Portal        │         │   Client Portal              │  │
│  │   (React 19 + Vite)   │         │   (React 19 + Vite, lazy)   │  │
│  │   admin.geahr.com     │         │   app.geahr.com              │  │
│  │                        │         │                              │  │
│  │  trpc.* hooks          │         │  portalTrpc.* hooks          │  │
│  │  → /api/trpc           │         │  → /api/portal               │  │
│  └────────┬───────────────┘         └─────────┬────────────────────┘  │
│           │                                   │                      │
└───────────┼───────────────────────────────────┼──────────────────────┘
            │                                   │
            ▼                                   ▼
┌───────────────────────────────────────────────────────────────────────┐
│                     Express 4 Server (Node.js 22)                     │
│                                                                       │
│  ┌─────────────────────────┐    ┌──────────────────────────────────┐  │
│  │  Admin tRPC Instance     │    │  Portal tRPC Instance            │  │
│  │  /api/trpc               │    │  /api/portal                     │  │
│  │                           │    │                                  │  │
│  │  Auth: Manus OAuth        │    │  Auth: JWT + bcrypt              │  │
│  │  Context: ctx.user        │    │  Context: ctx.portalUser         │  │
│  │  20 routers               │    │  9 routers                       │  │
│  │  Role-based procedures    │    │  customerId-scoped procedures    │  │
│  └─────────┬─────────────────┘    └──────────┬───────────────────────┘  │
│            │                                  │                        │
│            ▼                                  ▼                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Shared Data Layer                              │  │
│  │  Drizzle ORM → MySQL 8 / TiDB Serverless (33 tables)            │  │
│  │  S3 Storage → File uploads (invoices, documents, contracts)      │  │
│  │  ECB API → Exchange rates (daily fetch)                          │  │
│  │  AI Gateway → Centralized Task Routing (OpenAI, Gemini, etc.)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Cron Jobs (node-cron, 7 scheduled tasks)                        │  │
│  │  Daily: auto-activation, leave transition, overdue, exchange     │  │
│  │  Monthly: leave accrual (1st), auto-lock + payroll (5th)         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dual-Portal Design

The system runs two completely separate tRPC instances on the same Express server. They share the database but have no code-level cross-references.

| Aspect | Admin Portal | Client Portal |
|:---|:---|:---|
| **URL** | `admin.geahr.com` | `app.geahr.com` |
| **tRPC Mount** | `/api/trpc` | `/api/portal` |
| **tRPC Instance** | `server/_core/trpc.ts` | `server/portal/portalTrpc.ts` |
| **Auth Mechanism** | Manus OAuth + Session Cookie | JWT + bcrypt (self-managed) |
| **Context Object** | `ctx.user` (Manus user) | `ctx.portalUser` (customer contact) |
| **Router File** | `server/routers.ts` (20 routers) | `server/portal/portalRouter.ts` (9 routers) |
| **Procedure Base** | `protectedProcedure` + role middleware | `protectedPortalProcedure` (auto-injects customerId) |
| **Data Scope** | All customers, all data | Single customer only (customerId-scoped) |
| **Frontend Entry** | `client/src/App.tsx → AdminRouter` | `client/src/App.tsx → PortalRouter` (lazy-loaded) |
| **Frontend tRPC** | `client/src/lib/trpc.ts` | `client/src/lib/portalTrpc.ts` |
| **Layout** | `components/Layout.tsx` (sidebar) | `components/PortalLayout.tsx` (sidebar) |
| **i18n** | `contexts/i18n.tsx` | `lib/i18n.ts` (portal-specific) |

### Routing Decision

The `Router` component in `App.tsx` determines which portal to render based on the hostname. On `app.geahr.com`, it renders `PortalRouter` at the root level. On all other domains (including `localhost` during development), it uses path-based routing: `/portal/*` → `PortalRouter`, everything else → `AdminRouter`.

---

## 3. Authentication Flows

### Admin Authentication (Manus OAuth)

```
Browser → /login → Redirect to Manus OAuth Portal
       → User authenticates on Manus
       → Callback to /api/oauth/callback
       → Server creates session cookie (COOKIE_NAME = "app_session_id")
       → Redirect to admin dashboard
```

The session cookie is validated on every `/api/trpc` request via `server/_core/context.ts`. The user object is injected as `ctx.user` with fields: `id`, `name`, `email`, `role`, `openId`.

Admin users can also be invited via the `/invite` page, which generates a Manus OAuth link with a pre-configured role.

### Portal Authentication (JWT)

```
Browser → /portal/login → POST email + password
       → Server validates against customerContacts table (bcrypt hash)
       → Server issues JWT (PORTAL_COOKIE_NAME = "portal_session", 7-day expiry)
       → Redirect to portal dashboard
```

Portal registration is invite-only. An admin creates an invite link via `trpc.customers.createInvite`, which generates a time-limited token (72 hours). The invite link leads to `/portal/register?token=...` where the contact sets their password.

Password reset uses a similar token flow: `/portal/forgot-password` → email with reset link → `/portal/reset-password?token=...`.

---

## 4. Admin tRPC Router Map (20 Routers)

| Router | File | Middleware | Key Operations |
|:---|:---|:---|:---|
| `auth` | `routers.ts` (inline) | public | `me`, `logout` |
| `customers` | `routers/customers.ts` | customerManager | CRUD, invite, contacts, contracts, pricing |
| `employees` | `routers/employees.ts` | customerManager | CRUD, status transitions, documents, visas |
| `payroll` | `routers/payroll.ts` | operationsManager | Runs, items, submit, approve, reject |
| `invoices` | `routers/invoices.ts` | financeManager | CRUD, status, credit notes, PDF generation |
| `invoiceGeneration` | `routers/invoiceGeneration.ts` | financeManager | Generate from payroll, deposit, visa service |
| `countries` | `routers/countries.ts` | admin | Country config, statutory minimums |
| `leave` | `routers/leave.ts` | operationsManager | Records, balances, approval |
| `adjustments` | `routers/adjustments.ts` | operationsManager | CRUD, lock, bulk operations |
| `reimbursements` | `routers/reimbursements.ts` | operationsManager | CRUD, approval flow |
| `dashboard` | `routers/dashboard.ts` | protected | Aggregated stats, charts, recent activity |
| `billingEntities` | `routers/billingEntities.ts` | admin | CRUD, invoice prefix, exchange markup |
| `userManagement` | `routers/userManagement.ts` | admin | Admin user CRUD, role assignment |
| `auditLogs` | `routers/auditLogs.ts` | admin | Query, filter, export |
| `exchangeRates` | `routers/exchangeRates.ts` | financeManager | View, manual override |
| `systemSettings` | `routers/systemSettings.ts` | admin | Global settings key-value store |
| `customerLeavePolicies` | `routers/customerLeavePolicies.ts` | customerManager | Per-customer leave policy config |
| `vendors` | `routers/vendors.ts` | financeManager | Vendor CRUD |
| `vendorBills` | `routers/vendorBills.ts` | financeManager | Bills, items, cost allocation |
| `reports` | `routers/reports.ts` | financeManager | P&L, cost allocation reports |
| `allocations` | `routers/allocations.ts` | financeManager | Cost allocation CRUD |
| `pdfParsing` | `routers/pdfParsing.ts` | operationsManager | AI-powered PDF data extraction |
| `sales` | `routers/sales.ts` | customerManager | CRM leads, activities, pipeline |
| `copilot` | `routers/copilot.ts` | protected | Chat, context awareness, predictions |
| `aiSettings` | `routers/aiSettings.ts` | admin | Provider config, task routing policies |
| `knowledgeBaseAdmin` | `routers/knowledgeBaseAdmin.ts` | admin | Knowledge base management |

---

## 5. Portal tRPC Router Map (9 Routers)

| Router | File | Key Operations |
|:---|:---|:---|
| `auth` | `portalAuthRouter.ts` | Login, register, password reset, me, logout |
| `dashboard` | `portalDashboardRouter.ts` | Customer-scoped stats and charts |
| `employees` | `portalEmployeesRouter.ts` | View employees, onboarding submission |
| `adjustments` | `portalAdjustmentsRouter.ts` | Submit adjustments for employees |
| `leave` | `portalLeaveRouter.ts` | Submit leave requests, view balances |
| `payroll` | `portalPayrollRouter.ts` | View payroll runs and items (read-only) |
| `reimbursements` | `portalReimbursementsRouter.ts` | Submit and approve reimbursements |
| `invoices` | `portalInvoicesRouter.ts` | View and download invoices |
| `settings` | `portalSettingsRouter.ts` | Company profile, contact management |

---

## 6. Data Model Overview

The 33 database tables are defined in `drizzle/schema.ts` with relationships in `drizzle/relations.ts`. Below is the entity relationship summary organized by functional domain.

### Core Entities

```
customers (1) ──── (N) employees
customers (1) ──── (N) customerContacts (portal users)
customers (1) ──── (N) customerContracts
customers (1) ──── (N) customerPricing
customers (1) ──── (1) billingEntities (via billingEntityId)
employees (1) ──── (N) employeeContracts
employees (1) ──── (N) employeeDocuments
employees (1) ──── (N) employeeVisas
```

### Operations

```
payrollRuns (1) ──── (N) payrollItems
payrollItems (N) ──── (1) employees
adjustments (N) ──── (1) employees
leaveRecords (N) ──── (1) employees
leaveBalances (N) ──── (1) employees
reimbursements (N) ──── (1) employees
```

### Finance

```
invoices (1) ──── (N) invoiceItems
invoiceItems (N) ──── (1) employees (optional)
invoices (N) ──── (1) customers
invoices (N) ──── (1) billingEntities
invoices (1) ──── (1) invoices (relatedInvoiceId for credit notes/refunds)
vendors (1) ──── (N) vendorBills
vendorBills (1) ──── (N) vendorBillItems
costAllocations (N) ──── (1) vendorBillItems
costAllocations (N) ──── (1) invoices
```

### System

```
users (admin users, Manus OAuth)
auditLogs (action tracking)
systemSettings (key-value config)
exchangeRates (daily rates from ECB)
depositRules (per-country deposit config)
countriesConfig (country-level settings: VAT, statutory leave, currency)
salesLeads (1) ──── (N) salesActivities
customerLeavePolicies (per-customer leave config)
```

### AI & Copilot

```
ai_provider_configs (LLM provider settings)
ai_task_policies (Task-specific routing rules)
copilot_chats (1) ──── (N) copilot_messages
knowledge_base_articles (KB content)
```

---

## 7. Service Layer

Complex business logic is encapsulated in service files under `server/services/`:

| Service | File | Responsibility |
|:---|:---|:---|
| Invoice Generation | `invoiceGenerationService.ts` | Generate invoices from approved payroll runs (5-dimension split) |
| Invoice Number | `invoiceNumberService.ts` | Sequential numbering with billing entity prefix |
| Deposit Invoice | `depositInvoiceService.ts` | Generate deposit invoices on employee onboarding |
| Deposit Refund | `depositRefundService.ts` | Generate refund invoices on employee termination |
| Credit Note | `creditNoteService.ts` | Create and apply credit notes to invoices |
| Exchange Rate | `exchangeRateService.ts` | Fetch ECB rates, calculate markup |
| PDF Generation | `pdfService.ts` | Generate invoice PDFs with billing entity branding |
| AI Gateway | `aiGatewayService.ts` | Centralized LLM task routing and execution |
| Copilot Service | `copilotService.ts` | Chat processing, context gathering, tool execution |

---

## 8. Cron Job System

All cron jobs are defined in `server/cronJobs.ts` and registered in the server startup. They use `node-cron` with Beijing time (UTC+8) scheduling.

| Job | Schedule (Beijing) | Function | Dependencies |
|:---|:---|:---|:---|
| Employee Auto-Activation | Daily 00:01 | `runEmployeeAutoActivation()` | None |
| Leave Status Transition | Daily 00:02 | `runLeaveStatusTransition()` | None |
| Overdue Invoice Detection | Daily 00:03 | `runOverdueInvoiceDetection()` | None |
| Exchange Rate Fetch | Daily 00:05 | `runExchangeRateFetch()` | ECB API |
| Leave Accrual | Monthly 1st 00:10 | `runLeaveAccrual()` | Customer leave policies |
| Auto-Lock | Monthly 5th 00:00 | `runAutoLock()` | None |
| Auto-Create Payroll | Monthly 5th 00:01 | `runAutoCreatePayroll()` | Auto-lock must complete first |

**Important**: The auto-lock job (5th 00:00) must complete before auto-create payroll (5th 00:01). The 1-minute gap provides buffer time. If auto-lock fails, payroll creation will include unlocked data, which is incorrect.

---

## 9. File Storage Architecture

All file uploads go through S3 via the `storagePut()` helper in `server/storage.ts`. The database stores only the S3 URL, never the file bytes.

| File Type | Storage Key Pattern | Database Field |
|:---|:---|:---|
| Employee documents | `{userId}-files/{filename}-{random}.ext` | `employeeDocuments.fileUrl` |
| Employee visas | `{userId}-visas/{filename}-{random}.ext` | `employeeVisas.documentUrl` |
| Invoice PDFs | `invoices/{invoiceNumber}.pdf` | `invoices.pdfUrl` |
| Contract files | `contracts/{filename}-{random}.ext` | `customerContracts.fileUrl` |

---

## 10. Frontend Architecture

### Admin Frontend

The admin frontend uses a persistent sidebar layout (`components/Layout.tsx`) with 6 navigation groups: Overview, Sales, Client Management, Operations, Finance, and System. All pages are eagerly loaded.

### Portal Frontend

The portal frontend is **lazy-loaded** via React `lazy()` and `Suspense`. It has its own tRPC provider (`portalTrpc`) and layout (`PortalLayout.tsx`). Portal pages are under `client/src/pages/portal/`.

### Shared Utilities

Both portals share these utilities (but through separate imports):

| Utility | File | Purpose |
|:---|:---|:---|
| `formatDate/Amount/Month` | `client/src/lib/format.ts` | Consistent date and currency display |
| `useI18n` | `client/src/lib/i18n.ts` (portal) / `client/src/contexts/i18n.tsx` (admin) | EN/ZH translations |
| `statusLabels` | Defined per-page | Consistent status badge display |
| Shadcn/UI components | `client/src/components/ui/` | Button, Card, Dialog, Table, etc. |
