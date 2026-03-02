# EOR SaaS Admin System - Project TODO

## Phase 1: Database Schema Enhancement
- [x] Base schema (users, customers, employees, payroll, invoices, leave, audit)
- [x] Add service_type to employees (EOR, Visa EOR, AOR)
- [x] Add customer_pricing table (global discount + country-specific prices)
- [x] Add countries_config table (country settings, payroll cycle, currency)
- [x] Add adjustments table (bonuses, allowances, reimbursements with approval)
- [x] Add visa_records table for visa tracking
- [x] Enhance employee status workflow (pending_review, onboarding, active, offboarding, terminated)
- [x] Add invoice credit_note and deposit_refund types
- [x] Push all migrations

## Phase 2: Server API Layer
- [x] Customer CRUD with pricing and contacts sub-routers
- [x] Employee CRUD with status/country statistics
- [x] Payroll run CRUD with payroll items
- [x] Invoice CRUD with line items
- [x] Invoice generation from payroll data
- [x] Country configuration CRUD with leave types
- [x] Customer pricing router
- [x] Adjustments router (submit, approve, reject)
- [x] Leave management router (request, approve, balance calc)
- [x] Dashboard statistics router (real data)
- [x] User management router
- [x] Audit log viewer router

## Phase 3: Frontend - Layout & Navigation
- [x] Custom Layout with sidebar navigation
- [x] Sidebar with all modules (Dashboard, Customers, Employees, Payroll, Invoices, Adjustments, Leave, Countries, Settings)
- [x] Integrate with real auth (useAuth hook)
- [x] Breadcrumb navigation

## Phase 4: Frontend - Dashboard
- [x] Dashboard with KPI cards (real API data)
- [x] Connected to dashboard.stats endpoint
- [x] Add pending approvals widget
- [x] Add recent activity from audit logs

## Phase 5: Frontend - Customer Management
- [x] Customer list page with search and filters
- [x] Create customer form dialog
- [x] Customer detail page with tabs (info, contacts, pricing, employees, invoices)
- [x] Customer pricing configuration
- [x] Customer contact management

## Phase 6: Frontend - Employee Management
- [x] Employee list page with search and status filter
- [x] Create employee form dialog
- [x] Employee detail page with full info (personal, employment, compensation, visa)
- [x] Employee status workflow transitions (pending_review → onboarding → active → offboarding → terminated)
- [x] Visa tracking display
- [x] Service type selection (EOR, Visa EOR, AOR)

## Phase 7: Frontend - Country Configuration
- [x] Country list with config (currency, payroll cycle, cutoff/pay day)
- [x] Create country configuration form
- [x] Leave type display per country

## Phase 8: Frontend - Payroll Management
- [x] Payroll run list with status filter
- [x] Create payroll run form
- [x] Payroll detail with summary cards and payroll items table

## Phase 9: Frontend - Leave Management
- [x] Leave request list with status filter
- [x] Leave request form
- [x] Leave approval/rejection workflow

## Phase 10: Frontend - Adjustments (异动薪酬)
- [x] Adjustments list with type and status filters
- [x] Submit adjustment form (bonus, allowance, reimbursement, deduction)
- [x] Adjustment approval/rejection workflow

## Phase 11: Frontend - Invoice Management
- [x] Invoice list page with search and status filter
- [x] Invoice detail with line items
- [x] Invoice status workflow (draft → pending_review → sent → paid/overdue)
- [x] Support all invoice types display

## Phase 12: System Administration
- [x] Settings page (placeholder with sections)
- [x] User management page
- [x] Audit log viewer
- [x] Exchange rate management

## Phase 13: Testing
- [x] Invoice generation tests (17 passing)
- [x] Auth logout test (1 passing)
- [x] Router API tests - all modules (17 passing)
- [x] Total: 63 tests passing, 0 failing

## Bug Fixes & Improvements (Round 2)

### Global
- [x] Replace all manual currency input with currency selector dropdown
- [x] Create reusable CurrencySelect component

### Customer Detail
- [x] Fix customer pricing tab - allow adding/editing pricing
- [x] Fix customer contacts tab - allow adding/editing contacts
- [x] Add contract upload functionality for customers
- [x] Review all customer detail tabs for missing features

### Employee Creation
- [x] Add all missing fields to employee creation form
- [x] Review employee schema and ensure all fields are in the form

### Payroll Page
- [x] Fix missing sidebar/layout on payroll detail page
- [x] Add back button on payroll detail
- [x] Change customer input to customer selector in create form
- [x] Fix Payroll Month to be month/year picker not date
- [x] Remove Service Fee Percentage from payroll create
- [x] Add edit capability for draft payroll runs
- [x] Add submit and reject workflow buttons for payroll

### Leave Management
- [x] Change Employee ID input to employee selector dropdown
- [x] Change Leave Type ID to leave type name selector
- [x] Auto-calculate Total Days from start/end dates
- [x] Support half-day leave
- [x] Validate end date >= start date

### Invoice Page
- [x] Fix missing sidebar/layout on invoice detail page
- [x] Add back button on invoice detail
- [x] Remove percentage fee rate from invoice generation

### Country Configuration
- [x] Review and fix per requirements document
- [x] Ensure all required config fields are present
- [x] Add tax/social rates to create form
- [x] Add employment rules (probation, notice period, working days)
- [x] Add leave type management with create dialog
- [x] Add detail panel with tabs (Rates, Rules, Leave)

## Bug Fixes & Improvements (Round 3)

### Pricing
- [x] Fix pricing creation date format error (Date object not converted properly)
- [x] Support multi-country selection when creating pricing (batch create)
- [x] Redesign pricing model: add standard rates concept
- [x] Show standard rates in pricing UI so discount is meaningful
- [x] Global discount tied to standard rates with clear explanation

### Contract Upload
- [x] Add contract upload to customer detail page using S3 storage
- [x] Show contract history in customer detail
- [x] Add standard service rates to country configuration form
- [x] Show standard rates in country detail panel

## Bug Fixes & Improvements (Round 4)

### Country Configuration
- [x] Remove Tax & Social Contribution Rates (employerSocialRate, employeeSocialRate, incomeTaxRate) from UI
- [x] Rename publicHolidaysPerYear to Statutory Annual Leave (法定年假天数)

### Pricing Logic
- [x] Document pricing priority: country_specific price > global_discount on standard rate
- [x] Show clear explanation in customer pricing UI about priority

## Bug Fixes & Improvements (Round 5)

### Countries
- [x] Add edit button for country configuration
- [x] Add delete button for country configuration
- [x] Batch seed 100 mainstream countries with standard ISO codes and names
- [x] APAC countries: EOR standard rate $249 USD
- [x] Non-APAC countries: EOR standard rate $449 USD

### Visa EOR Pricing
- [x] Add Visa one-time setup fee field to countries_config schema
- [x] Update pricing UI to show Visa one-time fee
- [x] Update countries create/edit forms with Visa one-time fee

## Bug Fixes & Improvements (Round 6)

### Pricing
- [x] Auto-deactivate old same-country same-service pricing when new pricing is created
- [x] Backend: update pricing create to set isActive=false on conflicting old records

### Form Validation
- [x] Add required field validation with red border highlights globally
- [x] Show error messages for missing required fields on form submit
- [x] Applied to: Customer create, Employee create forms

### Customer Management
- [x] Add edit button for customer information
- [x] Customer email global uniqueness validation (prevent duplicates)
- [x] Backend: add email uniqueness check in customer create/update

### Employee Creation
- [x] Review and remove unnecessary fields from employee creation form
- [x] Add file upload support (resume, passport, ID documents)
- [x] Improve employee creation form UI layout (grouped fieldsets, cleaner spacing)
- [x] Backend: add employee document upload endpoints (list, upload, delete)
- [x] Employee detail: Documents tab with upload/view/delete

## Phase 1-3 Completion (Round 7)

### Employee Management Enhancements
- [x] Auto-detect visa requirement based on nationality vs work country
- [x] Conditional visa fields (show/hide based on requirement)
- [x] Employee status rollback capability (reverse status transitions)
- [x] Employee contract management tab (upload signed contracts, mark Active)
- [x] Salary info display (base salary, social security cost, total employment cost)
- [x] Leave balance display in employee detail
- [x] Payroll history view in employee detail
- [x] Reimbursement/adjustment records in employee detail
- [x] Visa information tracking for Visa EOR (upload visa files, status, expiry reminders)

### Payroll Enhancements
- [x] Auto-fill payroll items based on active employees for customer+country
- [x] Link to customer pricing for automatic service fee calculation

### Invoice Enhancements
- [x] Link invoice generation to customer pricing for automatic fee calculation

### System Management (Phase 3)
- [x] Billing entity management page
- [x] Exchange rate management page
- [x] User management page
- [x] Audit logs viewer page

### Multi-Language Support
- [x] i18n framework setup (Chinese/English)
- [x] Language toggle in header/sidebar
- [x] All UI labels translated (Dashboard + Layout sidebar)

## Bug Fixes & Improvements (Round 8)

### Employee List
- [x] Customer column shows customer name (JOIN query) with clientCode display
- [x] Customer ID format unified: CUS-0001, EMP-0001 auto-generated codes

### Employee Detail - Information Tab
- [x] All fields have consistent icons (Mail, Phone, Cake, Globe, Hash, Building2, Briefcase, Users, MapPin, Clock, Calendar)

### Employee Detail - Salary & Cost Tab
- [x] Redesigned to show only fixed compensation (Base Salary, Employer Social, Total Fixed Cost)
- [x] Variable items shown in Payroll History tab

### Employee Detail - Leave Balance Tab
- [x] Added Initialize from Country button to auto-create leave balances
- [x] Added edit functionality for leave balance (total days, used days)
- [x] Data source: initialized from country leave types, editable by manager

### Employee Detail - Documents Tab
- [x] Documents tab now has three sections: Contracts, Visa Documents, General Documents
- [x] Each section has upload button with proper file type handling

### Payroll Module
- [x] Sidebar visible on all Payroll pages (Layout wrapper)
- [x] Payroll runs created manually via New Payroll Run, auto-fill populates employees
- [x] Customer field is dropdown with active customers
- [x] Country field uses CountrySelect component
- [x] List view has customer/country/status triple filter
- [x] Month picker uses year + month dropdowns
- [x] Service Fee Percentage removed from creation form
- [x] Payroll run creation logic redesigned

## Bug Fixes (Round 9)

### Employee Detail Page
- [x] Employee detail page crashes with JS error - fixed hooks order violation (useMemo after early return)

## Bug Fixes (Round 10)

### Employee Creation Form
- [x] Removed Employer Social Contribution from creation form
- [x] Compensation section: only Base Salary + Currency
- [x] Employment Type: changed to Fixed Term / Long Term
- [x] AOR service type does NOT check visa requirement

### Employee Detail - Compensation Tab
- [x] Removed Employer Social Contribution display
- [x] Removed Country Tax & Social Security Rates section
- [x] Compensation merged into Employment Details in Info tab (separate tab removed)

### Employee Detail - Visa Tab
- [x] Visa upload merged into Documents tab

### Countries Configuration
- [x] Tax rate fields removed from countries_config schema and UI

### Payroll Page
- [x] Payroll page fixed: App.tsx was routing to old PayrollManagement.tsx (mock data), now routes to new Payroll.tsx with real API
- [x] Also fixed: Invoice page routing to use new Invoices.tsx with sidebar

### Payroll Cycle
- [x] bi_monthly changed to semi_monthly in schema and UI

## Architecture Refactor (Round 11) - Payroll by Country + Currency Lock

### Schema Changes
- [x] Lock employee currency to country's legal currency (remove currency selection from employee)
- [x] Refactor payroll_runs: remove customerId, add countryCode as primary dimension
- [x] Ensure countries_config has legalCurrency field

### Backend Changes
- [x] Employee creation: auto-set currency from country's legalCurrency
- [x] Employee edit: currency not editable (derived from country)
- [x] Payroll router: create run by country+period (not customer)
- [x] Payroll router: list/filter runs by country+period
- [x] Payroll auto-fill: populate all active employees for that country (across all customers)
- [x] Payroll detail: items shown for all employees in the country
- [x] Invoice generation: aggregate by customer from multiple country payroll runs, convert to customer settlement currency

### Frontend Changes
- [x] Payroll create dialog: change from customer-based to country+period based (currency auto-set)
- [x] Payroll list: organize by country+period, removed customer filter
- [x] Payroll detail: shows all employees in the country (across customers)
- [x] Invoice detail: removed payrollRunId reference (invoices now aggregate multiple runs)

### Tests
- [x] 15 new payroll refactor tests added (all passing)
- [x] All 78 tests passing (5 test files, 0 failures)

## Round 12 - Countries Preset + Contract Signed Status + Semi-Auto Payroll

### Bug Fix
- [x] Fix payroll create bug: payrollMonth Date format not compatible with MySQL insert

### Countries Preset
- [x] Prefill all major countries (legal currency, payroll cycle, statutory annual leave, leave types, probation, notice period, working days)
- [x] Remove "Create Country" functionality - all countries pre-populated
- [x] Country status logic: has service fee configured = active, otherwise = inactive
- [x] Admin only configures service fees (EOR/AOR/Visa fee)
- [x] Remove payrollCutoffDay and payDayOfMonth from countries_config

### Global Payroll Config
- [x] Create system_config table for global settings
- [x] Payroll cutoff: 4th of each month 23:59 Beijing time (configurable in Settings)
- [x] Pay day: last working day of each month
- [x] Settings UI for global payroll config

### Employee Status: contract_signed
- [x] Add contract_signed status between onboarding and active
- [x] Status flow: pending_review → onboarding → contract_signed → active → offboarding → terminated
- [x] Daily cron (00:01 Beijing time): auto-transition contract_signed → active when startDate <= today
- [x] On auto-transition to active: if date <= 15th, auto-add to current month payroll run (pro-rata)
- [x] On auto-transition to active: if date > 15th, skip current month, next month auto-fill normally

### Semi-Auto Payroll Run
- [x] Monthly cron (5th 00:01 Beijing time): auto-create next month draft payroll run for countries with active employees
- [x] Auto-fill logic: active/offboarding employees, startDate <= month end, terminationDate null or >= month start
- [x] Pro-rata calculation for mid-month starters: baseSalary × (remaining working days / total working days)
- [x] Allow manual override of pro-rata amounts (ops manager can edit payroll items)
- [x] Retain manual payroll run creation capability (existing create mutation preserved)

### Frontend Changes (Round 12)
- [x] Countries page: redesigned to show all preset countries, removed create button
- [x] Countries page: edit dialog only for service fees (EOR/AOR/Visa)
- [x] Countries page: status filter (all/active/inactive) with stats cards
- [x] Countries detail panel: shows pre-populated legal info as read-only
- [x] Countries: auto-active logic (has service fee = active)
- [x] Settings page: global payroll config UI (cutoff, auto-create, activation rules, manual triggers)
- [x] Employee status flow: update UI for contract_signed status (colors, labels, filter, transitions)

## Bug Fix - contract_signed status
- [x] Fix: contract_signed missing from employee updateStatus Zod enum

## Bug Fix - Payroll Create
- [x] Fix payrollMonth date format: pass YYYY-MM-DD string directly instead of Date object
- [x] Add duplicate detection: prevent creating payroll run for same country+month with friendly error message
- [x] Also fixed cronJobs.ts auto-create to use string date format

## Bug Fix - Employee Create/Edit
- [x] Lock currency in employee create form (auto-set from country, read-only display)
- [x] Fix employee update SQL error (handle empty string dates to prevent SQL errors)
- [x] Allow editing startDate, endDate, employmentType fields in employee edit form

## Bug Fix - Currency Default & UI Alignment
- [x] Fix currency default in create form: empty until country selected, then auto-set from country's local currency
- [x] Fix compensation section UI: changed to grid-cols-2 for proper alignment, consistent in both create and edit forms

## Bug Fix - Service Type Auto-Switch, Annual Leave, Leave Balance
- [x] Auto-switch service type to Visa EOR when nationality != employment country (frontend auto-detect + hint label)
- [x] Add annual leave days field to employee create and edit forms (with statutory minimum validation hint)
- [x] Add annualLeaveDays column to employees schema
- [x] Fix leave balance initialization: auto-initialize on employee creation using country leave types + custom annual leave days
- [x] Leave balance auto-initialized when employee is created (via create mutation)

## Adjustments & Leave Refactor + Employee Reactivity Fix (Round 13)

### Employee Create Form - Reactivity Bug
- [x] Fix: Changing employment country after initial selection should update currency, service type, and other derived fields
- [x] Fix: Changing nationality after initial selection should re-evaluate service type (EOR vs Visa EOR)

### Adjustments Module Refactor
- [x] A1: Remove approval workflow (status → submitted/locked, remove approvedBy/approvalDate/rejectionReason)
- [x] A2: Add cutoff date locking logic (editable until Month N+1 Day 4 23:59 Beijing time)
- [x] A3: Currency auto-fill from employee's country (read-only)
- [x] A4: customerId auto-fill from employeeId (remove manual input)
- [x] A5: Adjustments → Payroll data flow (auto-fill aggregates adjustments into payroll items)
- [x] A6: Add effectiveMonth filter to list query
- [x] A7: Replace Employee ID number input with dropdown selector
- [x] A8: Remove isRecurring/recurringEndDate (defer to future)
- [x] A9: Standardize category field as enum dropdown
- [x] A10: effectiveMonth input changed to YYYY-MM month picker

### Leave Module Refactor
- [x] L1: Remove approval workflow (status → submitted/locked/cancelled, remove approvedBy/approvalDate)
- [x] L2: Add cutoff date locking logic
- [x] L3: Auto-deduct leave balance on create, auto-restore on delete/cancel
- [x] L4: Auto-calculate unpaid leave deduction amount
- [x] L5: Leave → Payroll data flow (auto-fill aggregates unpaid leave into payroll items)
- [x] L6: Date inputs changed to manual text input (YYYY-MM-DD)
- [x] L7: Fix leave type display across countries (backend JOIN)
- [x] L8: Add month filter to list query

### Payroll Auto-Fill Integration
- [x] P1: Auto-fill aggregates adjustments (bonus/allowance/reimbursement/deduction) into payroll items
- [x] P2: Auto-fill aggregates unpaid leave deductions into payroll items

### Employee Edit Form - Reactivity Fix
- [x] E3: Edit form country change now auto-updates currency
- [x] E4: Edit form nationality/country change now auto-updates service type (EOR vs Visa EOR)
- [x] E4: Visa check hint displayed in edit form

### Tests
- [x] 30 new tests for cutoff utility, unpaid deduction calc, status rules, category standardization, month normalization
- [x] All 127 tests passing (7 test files, 0 failures)

## Round 13 Bug Fixes + Simulation Data

### Bug Fixes
- [x] Fix: Employee create form - currency stays USD after selecting country (CountrySelect component fixed to always return country code)
- [x] Fix: Payroll auto-fill padStart error (payrollMonth Date object handling fixed)
- [x] Fix: All date inputs globally changed from calendar picker to text input (YYYY-MM-DD) - 16 inputs across 4 pages
- [x] Fix: Leave days should be auto-calculated from start/end dates, not manually editable
- [x] Fix: Employee edit form - currency not updating when country changes

### Data Operations
- [x] Clear all test data (billing entities, employees, leave, adjustments, customers)
- [x] Create 2 complete companies with 8 employees across 6 countries, various statuses
- [x] All 127 tests passing after changes

## Round 14 - Browser Testing & Bug Fixes

### Testing
- [x] Browser test: Dashboard — card subtitles updated
- [x] Browser test: Employees (list, create, edit, detail) — service type display OK
- [x] Browser test: Adjustments (list, create, edit, delete, month filter) — employee name fix verified
- [x] Browser test: Leave (list, create, edit, delete, month filter) — date format YYYY-MM-DD verified
- [x] Browser test: Payroll (list, auto-fill, add employee, detail) — all verified
- [ ] Browser test: Customers, Billing Entities, Exchange Rates, Invoices (deferred)
- [x] Fix: Payroll Run "Add Employee" form redesigned with auto-populate from adjustments/leave

### Bugs Found & Fixed
- [x] Payroll auto-fill UTC timezone bug — payrollMonth Date→String used local timezone, fixed to UTC
- [x] Payroll auto-fill totals not updating — added recalculation after item creation
- [x] Payroll deductions column showing -0.00 — fixed negative zero display
- [x] Adjustments page Employee #90006 name not showing — employee query changed to include all statuses
- [x] Dashboard card subtitles still said "awaiting approval" — updated EN/ZH i18n
- [x] Payroll Add Employee form had old manual fields — redesigned with auto-populate sections
- [x] previewItem endpoint added for single-employee adjustment/leave aggregation
- [x] All 127 tests passing

## Round 15 - Auto-Lock Cron, Auto-Fill Cron, Payroll Submit Lock, Filter Redesign

### Cron Jobs
- [ ] Auto-lock cron: 4th 00:59 Beijing time, lock previous month's submitted adjustments/leave to locked
- [ ] Auto-fill cron: 5th 00:01 Beijing time, auto-fill payroll items from locked adjustments/leave
- [ ] Auto-fill should query locked (not submitted) status for adjustments/leave

### Payroll Submit Lock
- [ ] When payroll run submitted, lock associated month's adjustments/leave to locked
- [ ] Payroll item edit: auto-filled fields (bonus/allowances/reimbursements/deductions/unpaid leave) read-only

### Filter Redesign
- [ ] Redesign filters for Adjustments page (customer filter, employee filter, month, status)
- [ ] Redesign filters for Leave page (customer filter, employee filter, month, status)
- [ ] Redesign filters for Payroll page (customer filter, country, month, status)
- [ ] Consider cascading filters (customer → employee) to reduce ops manager workload

## Round 15 Implementation

### Cron Jobs
- [ ] New cron: Auto-lock (5th 00:00 Beijing) - lock previous month's submitted adjustments/leave to locked
- [ ] Modify cron: Auto-fill (5th 00:01 Beijing) - query locked status adjustments/leave for aggregation
- [ ] Manual auto-fill button continues to query submitted status (pre-cutoff usage)

### Payroll Submit Lock
- [ ] When payroll run status changes to pending_approval, lock associated month's submitted adjustments/leave
- [ ] Payroll item edit: auto-filled fields (bonus/allowances/reimbursements/deductions/unpaid leave) read-only

### Filter Redesign
- [x] Adjustments: add Customer cascading filter + Employee filter, add customerId backend support
- [x] Leave: add Customer cascading filter + Employee filter, add customerId backend support
- [x] Payroll: fix Country filter, add Month filter with dynamic month list from DB
- [x] Employees: add Customer filter + Country filter
- [x] Month filter options should be dynamic (from actual DB data), not hardcoded

### Bug Fixes
- [x] Fix: Employee detail Leave Balance shows Leave Type ID instead of name (e.g. "#31802")

## Round 15 Continued - Filters + New Improvements

### Filter Completion
- [x] Adjustments: add Country filter (client-side via employee lookup)
- [x] Leave: add Customer + Country filter (client-side via employee lookup)
- [x] Employees: add Customer + Country filter (pass to backend query)
- [x] Payroll: add dynamic Month filter (from actual payroll_runs data)

### Employee Selector Optimization (Cascading + Search)
- [x] Create reusable EmployeeSelector component with customer cascading
- [x] Support: first select customer, then select employee from that customer
- [x] Support: type-to-search employee name (partial match)
- [x] Apply to Adjustments create form
- [x] Apply to Leave create form
- [x] Apply to Payroll Add Employee form

### Large Currency Support (KRW/VND/IDR)
- [x] Amount input fields: support large numbers (billions) without scientific notation
- [x] Amount display: format with thousand separators for readability
- [x] Ensure decimal precision matches currency (KRW=0 decimals, VND=0, IDR=0, others=2)
- [x] Database: verify decimal(20,2) can handle large amounts

### Reimbursement Attachment Upload
- [x] Schema: use receiptFileUrl/receiptFileKey fields on adjustments table (simpler approach)
- [x] Backend: upload endpoint for adjustment attachments (S3 storage)
- [x] Backend: receipt URL stored on adjustment record, viewable via link
- [x] Frontend: when adjustmentType=reimbursement, show mandatory file upload area
- [x] Frontend: support single file upload (PDF, images, ZIP, Office docs, max 20MB)
- [x] Frontend: validation - block reimbursement submit without at least 1 attachment
- [x] Employee detail: show reimbursement receipts in Documents tab with type label

### On Leave Status Auto-Transition
- [x] Cron job: daily check leave records where startDate <= today and status=submitted
- [x] Auto-transition employee status to on_leave when leave starts
- [x] Auto-transition employee status back to active when leave endDate < today
- [x] Only transition if employee is currently active (for start) or on_leave (for end)
- [x] Audit log for auto-transitions

### Visa Tab Refactor
- [x] Visa Tab: remove file upload section, keep only visa application status/info
- [x] Documents Tab: ensure all file uploads (visa docs, contracts, general docs, receipts) are handled here
- [x] Documents Tab: add "Reimbursement Receipts" section for adjustment receipt files

## Round 16 - Bug Fixes & Leave Balance Refactor

### Bug Fixes
- [x] Payroll: 3月 payroll run total cost 为 0 是因为 auto-fill 未运行（cron 在每月5号），数据正确
- [x] Leave Balance: 移除手动编辑 used 的功能，used 应从 leave records 自动计算
- [x] Leave Balance: 移除 "Initialize from Country" 按钮（不再需要）
- [x] Leave Balance: 添加假期过期时间配置（expiryDate 字段）
- [x] Leave: 移除 cancelled 状态，只保留 submitted 和 locked（取消=直接删除）
- [x] Payroll: 状态简化为 draft → pending_approval → approved → rejected（移除 paid/processed）
- [x] Payroll: approved 确认为终态，后续付款在 Invoice 模块处理
- [x] Payroll/Leave/Adjustments: 添加 Active/History Tab 切换（Active=未完成, History=approved/locked）
- [x] Payroll: Add Employee 限制只能添加同国家的员工
- [x] Payroll: 禁止在同一个 Payroll Run 中重复添加同一个员工
- [x] Payroll: Auto-fill 已存在的员工不允许再次手动添加
- [x] Bug: Payroll edit button shows "Add Payroll Item" dialog instead of "Edit Payroll Item"
- [x] Bug: Payroll total cost not recalculated after editing payroll items

## Round 17 - Unpaid Leave Deduction Refactor

### Leave Module: Remove Deduction Amount
- [x] Remove unpaidDeductionAmount and unpaidDeductionCurrency from Leave schema
- [x] Remove deduction calculation from Leave backend (create/update)
- [x] Remove deduction display from Leave frontend (list page, create/edit forms)
- [x] Leave page only shows: employee, leave type, start/end date, total days, status

### Payroll Module: Editable Unpaid Leave Deduction
- [x] Payroll auto-fill: still calculates unpaid leave deduction (daily salary × days) and writes to payroll item
- [x] Payroll item edit: unpaidLeaveDeduction field is editable by ops manager
- [x] Payroll item edit: show reference info below field (X days unpaid leave, system calculated: ¥X,XXX)
- [x] Ensure gross/net recalculates when unpaidLeaveDeduction is edited

### Database Migration
- [x] Push schema changes (remove leave deduction columns)

## Round 18 - Payroll Total Employer Cost Bug Fix + Finance Doc Update

- [x] Fix ER Social Contribution double-counting in recalculatePayrollRunTotals
- [x] Update Finance requirements document with payroll cost formulas and confirmed answers

## Round 19 - Finance Phase 1: Core Logic + VAT + Data Fix

### Schema Changes
- [x] Rename employees.employerSocialContribution → estimatedEmployerCost
- [x] Add customers.billingEntityId (FK to billing_entities)
- [x] Add customers.depositMultiplier (int, default 2)
- [x] Add invoices.billingEntityId (FK to billing_entities)
- [x] Add countries_config.vatApplicable (boolean, default false)
- [x] Add countries_config.vatRate (decimal 5,4)
- [x] Add billing_entities: IBAN, beneficiaryName, beneficiaryAddress, markupPercentage to exchange_rates
- [x] Push all schema migrations

### Backend: Customer ↔ Billing Entity
- [x] Update customer create/update to accept billingEntityId
- [x] Update customer list/detail to return billingEntityId with billing entity info

### Backend: Countries VAT Config
- [x] Update countries_config create/update to accept vatApplicable and vatRate
- [x] Return VAT fields in country detail

### Backend: Invoice Generation Optimization
- [x] Add approved-only check before invoice generation
- [x] Fix service fee calculation (country_specific > global_discount > standard rate, by serviceType)
- [x] Add VAT calculation for applicable countries
- [x] Associate invoice with customer's billingEntityId
- [x] Use billing entity invoicePrefix for invoice numbering

### Backend: Invoice Draft Editing
- [x] Add line item create/update/delete for draft invoices
- [x] Recalculate invoice totals on line item changes

### Frontend: Customer Billing Entity
- [x] Add Billing Entity selector in customer create/edit form
- [x] Show Billing Entity info in customer detail

### Frontend: Countries VAT
- [x] Add VAT Applicable toggle and VAT Rate field in country edit dialog
- [x] Show VAT info in country detail panel

### Frontend: Invoice Improvements
- [x] Show generation validation errors (unapproved payroll runs)
- [x] Show VAT line items in invoice detail
- [x] Add line item editing for draft invoices (add/edit/delete rows)
- [x] Show billing entity info in invoice detail

### Historical Data Fix
- [x] Recalculate Total Employer Cost for all existing payroll runs (fix double-counting)

## Round 20 - Bug Fixes

- [x] Fix customer edit mutation error: "expected object, received undefined" for data parameter
- [x] Redesign Leave Balance from per-employee to company-level (customer) Leave Policy

## Round 21 - Customer Leave Policy

### Schema
- [x] Create customer_leave_policies table (customerId, countryCode, leaveTypeId, annualEntitlement, expiryRule, carryOverDays)
- [x] Remove employees.annualLeaveDays field
- [x] Push schema migration

### Backend
- [x] Customer Leave Policy CRUD endpoints
- [x] Update initializeLeaveBalancesForEmployee to use customer policy
- [x] Update employee creation to not require annualLeaveDays
- [x] Add carry over logic for year-end balance transfer

### Frontend
- [x] Customer detail: Leave Policy tab with per-country policy config
- [x] Employee Leave Balance tab: read-only, policy-driven display
- [x] Remove annualLeaveDays from employee create/edit forms

## Round 22 - 文档体系 + 测试数据 + Finance Phase 2

### 文档体系（基于 ChatGPT Prompt 要求）
- [x] 数据字典文档（Data Object Dictionary）
- [x] RBAC 权限矩阵文档
- [x] Finance Phase 2 验收标准（Acceptance Criteria）
- [x] 测试计划文档
- [x] 审计日志清单

### 测试数据注入
- [x] 创建 2 个 Billing Entity（APAC + EU）
- [x] 创建 3 个 Customer
- [x] 创建 10 个 Employee
- [x] 创建 Customer Pricing
- [x] 创建 Exchange Rates
- [x] 创建 Adjustments
- [x] 创建 Leave Records
- [x] 创建 Payroll Runs + Items（2026-01 approved，2026-02 draft）
- [x] 通过 Invoice Generation 生成 2026-01 月度 Invoice
- [x] 配置 Countries VAT（SG 9%, DE 19%）
- [x] 修复 Invoice 生成的日期匹配 Bug（MySQL DATE 时区偏移问题）

### Finance Phase 2 功能
- [x] Deposit Invoice 自动生成
- [x] Billing Entity Schema 增强
- [x] Billing Entity UI 增强
- [x] Invoice PDF 导出
- [x] Invoice 编号自增序列
- [x] Invoice 月度管理视图

### UAT 验收
- [x] UAT 验收脚本
- [x] Finance Phase 2 vitest 测试用例

## Round 22 (duplicate - see above)

### 文档体系（基于 ChatGPT Prompt 要求）
- [x] 数据字典文档（Data Object Dictionary）
- [x] RBAC 权限矩阵文档
- [x] Finance Phase 2 验收标准（Acceptance Criteria）
- [x] 测试计划文档
- [x] 审计日志清单

### 测试数据注入
- [ ] 创建 2 个 Billing Entity（APAC + EU）
- [ ] 创建 3 个 Customer（含 billingEntityId + depositMultiplier 配置）
- [ ] 创建 10 个 Employee（跨 SG/JP/DE/AU/GB/CN，含 estimatedEmployerCost）
- [ ] 创建 Customer Pricing（country_specific + global_discount）
- [ ] 创建 Exchange Rates（2026-01 和 2026-02）
- [ ] 创建 Adjustments（2026-01 locked + 2026-02 submitted）
- [ ] 创建 Leave Records（2026-01 locked + 2026-02 submitted）
- [ ] 创建 Payroll Runs + Items（2026-01 approved，2026-02 draft）
- [ ] 通过 Invoice Generation 生成 2026-01 月度 Invoice
- [ ] 配置 Countries VAT（SG 9%, DE 19%）

### Finance Phase 2 功能
- [ ] Deposit Invoice 自动生成（员工状态变为 onboarding 时触发）
- [ ] Billing Entity Schema 增强（logoUrl, logoFileKey, invoicePrefix, paymentTermDays）
- [ ] Billing Entity UI：Logo 上传、IBAN/beneficiary 编辑、invoicePrefix 配置
- [ ] Invoice PDF 导出（含 Billing Entity 信息、银行账户、VAT 明细）
- [ ] Invoice 编号自增序列（含 Billing Entity prefix）
- [ ] Invoice 月度管理视图（全局视图 + 生成状态）

### UAT 验收
- [ ] 创建 UAT 验收脚本（业务方可执行的步骤化验收文档）
- [ ] 编写 Finance Phase 2 vitest 测试用例

## Round 23 - 数据清理 + Finance Phase 3

### 数据清理
- [x] 清理旧 Customers（54 → 3）
- [x] 清理旧 Employees（27 → 10）
- [x] 清理旧 Payroll Runs/Items（17 → 12）
- [x] 清理旧 Invoices/Items（39 → 4）
- [x] 清理旧 Billing Entities（73 → 2）
- [x] 清理旧 Adjustments/Leave Records
- [x] 清理测试产生的垃圾数据（vitest 创建的临时记录）
- [x] 清理多余 Exchange Rates（26 → 16）
- [x] 验证清理后数据完整性

### Finance Phase 3 功能
- [x] Deposit Refund Invoice（员工离职/终止时自动生成退还押金发票）
- [x] Credit Note（全额/部分冲红，独立 CN- 序列号）
- [x] Invoice 批量操作（批量发送、批量标记已付款、批量取消）
- [x] Invoice 列表增强（按 Billing Entity 筛选、按类型筛选、批量选择 UI）
- [x] Credit Note 前端对话框（全额/部分冲红，原因输入）
- [x] Deposit Refund 自动触发（员工状态变为 terminated 时）
- [ ] Invoice 状态提醒（逾期提醒逻辑 - 待后续实现）

### Finance Phase 3 测试
- [x] Finance Phase 3 vitest 测试用例（16 个全部通过）
- [x] 修复 Credit Note 序列号重复 Bug（独立 CN- 序列）
- [ ] UAT 验收脚本更新

## Round 24 - Invoice UI/PDF Fixes + Est. Employment Cost

### Employee Form
- [x] Add Est. Employment Cost editable field in Employee create/edit form

### Invoice Details UI
- [x] Fix icon inconsistency on Invoice Details page (some items have icons, some don't)
- [x] Redesign Invoice Item display: Type (large font) + Description (small font) two-line layout
- [x] Rename "Description" column header to "Item"
- [x] Add Invoice Currency display above Subtotal
- [x] Invoice bottom layout: Subtotal → Tax → Total

### Invoice Item Form (Add/Edit)
- [x] Remove Country Code field from Item form
- [x] Remove Local Currency manual input - keep only currency selector + amount
- [x] Add Tax field with auto-fill from countries config (based on currency → country lookup)

### Invoice PDF Export
- [x] Fix PDF: large amounts causing line-wrap/garbled text (column width issue)
- [x] Update PDF layout to match new Item display (Type + Description two-line)
- [x] Update PDF bottom: Invoice Currency + Subtotal + Tax + Total

## Round 25 - Invoice Item Form Simplification + Fixes

### Item Form Simplification
- [x] Remove local amount / unit price duplication: keep only Currency + Amount (single amount field)
- [x] Change Local Currency from manual input to dropdown (from countries_config currencies)
- [x] Add Employee selector dropdown in Item form (optional, for associating item to employee)
- [x] Add employeeId to updateItem backend input schema

### Table Display
- [x] Rename "Local Ccy" column header to "Curr"

### Deposit Description
- [x] Shorten deposit invoice description to only employee code + name (e.g. "Deposit - EMP001 John Doe")
- [x] Shorten deposit refund description similarly

### Other Improvements
- [x] Review and fix any remaining UI inconsistencies

## Round 26 - Payment Terms: Customer-level + Due Date Logic

### Database Schema
- [x] Add paymentTermDays (int) field to customers table
- [x] Run db:push to sync schema

### Customer UI
- [x] Remove billingCycle field (all invoicing is monthly)
- [x] Add Payment Terms dropdown (Net 7 / Net 15 / Net 30) + allow custom input
- [x] Update Customer create form
- [x] Update Customer edit form
- [x] Display Payment Terms in Customer detail view
- [x] Display Payment Terms in Customer list table

### Backend
- [x] Accept paymentTermDays in Customer create/update mutations

### Due Date Logic per Invoice Type
- [x] Monthly Invoice: Due Date = Issue Date + Customer Payment Term Days
- [x] Deposit Invoice: Due Date = Employee Start Date - 1 day
- [x] Credit Note: Due Date = null (display N/A)
- [x] Deposit Refund: Due Date = null (display N/A)

### Invoice UI
- [x] Show "N/A" for Due Date on Credit Note and Deposit Refund invoices

### Cleanup
- [x] Remove billingCycle from backend create/update mutations
- [x] Remove billing entity paymentTermDays references from all invoice generation services

## Round 27 - Invoice Currency Rules & Exchange Rate

### Currency Rules
- [x] Invoice currency = customer settlementCurrency (auto-set on customer selection)
- [x] Max 2 currencies per invoice: invoice currency + at most 1 foreign currency
- [x] Validate on item add: if a foreign currency already exists, new items can only use invoice currency or that same foreign currency

### Exchange Rate
- [x] Auto-fetch exchangeRate and exchangeRateWithMarkup from exchange_rates table when first foreign-currency item is added
- [x] Show exchangeRateWithMarkup on Invoice detail page (labeled "Exchange Rate"), allow manual adjustment
- [x] Do NOT show original exchangeRate on Invoice page (internal data only)
- [x] Recalculate item amounts and invoice totals when exchange rate is adjusted

### Invoice Detail UI
- [x] Display exchange rate info when invoice has foreign currency items
- [x] Editable exchange rate field for admin to manually override
- [x] Currency dropdown in item form: restrict to invoice currency + existing foreign currency only

### PDF
- [x] Show only exchangeRateWithMarkup on PDF (labeled "Exchange Rate")
- [x] Do not show original rate or markup percentage

## Round 28 - Billing Entity Bank Details: Free-text Replacement

### Database Schema
- [x] Remove individual bank fields (bankName, bankAccountNumber, bankIban, bankSwift, bankRoutingNumber) from billing_entities table
- [x] Add bankDetails (text, multiline) field to billing_entities table
- [x] Run db:push to sync schema

### Backend
- [x] Update Billing Entity create/update mutations: remove old bank fields, accept bankDetails
- [x] Clean up any other references to old bank fields in backend code

### Billing Entity UI
- [x] Replace individual bank input fields with a single textarea for bankDetails in create form
- [x] Same for edit form
- [x] Update detail view to display bankDetails as multiline text

### Invoice PDF
- [x] Update Payment Details section to render bankDetails as plain text with line breaks (instead of field-by-field)

## Round 28 - Major Invoice Restructuring

### Schema Changes
- [x] Update invoice_items: ensure qty, unitPrice (rate), vatRate (tax%) fields exist
- [x] Update invoices: invoiceType enum → monthly_eor, monthly_visa_eor, monthly_aor, deposit, visa_service, credit_note, deposit_refund, manual
- [x] Update invoice_items: itemType enum → 20 new types (EOR Service Fee, Employment Cost, Deposit, etc.)
- [x] Billing Entity: replace bank fields with bankDetails text field
- [x] Run db:push

### Backend - Item & Invoice Types
- [x] Update item type enum/validation in addItem/updateItem mutations
- [x] Update invoice type enum/validation in create/update mutations
- [x] Amount calculation: (Qty × Rate) × (1 + Tax%)
- [x] Remove Employee column references, keep employeeId for internal tracking
- [x] Update billing entity router: remove old bank fields, accept bankDetails

### Monthly Invoice Auto-Generation Refactor
- [x] Split by: Customer × Employee Type (EOR/Visa EOR/AOR) × Local Currency × Service Fee Rate
- [x] Invoice type: monthly_eor / monthly_visa_eor / monthly_aor
- [x] Employment Cost items: 1 per employee, Description = "EMP001 John Doe - Jan 2026"
- [x] Service Fee items: merged by type, Qty = employee count, Rate = service fee rate
- [x] Update invoiceGenerationService.ts with new logic

### Visa Service Invoice
- [x] Auto-generate when Visa EOR employee visa status → application_submitted
- [x] 1 invoice per employee, 1 item: Visa & Immigration Service Fee
- [x] Rate from countries_config Visa Setup Fee
- [x] Auto-associate Customer and Billing Entity

### Invoice UI
- [x] Table columns: Item, Curr, Qty, Rate, Tax, Amount (remove Employee column)
- [x] Update Add Item form: new type dropdown (20 types), Qty, Rate, Tax fields
- [x] Update type labels and badge colors for new invoice types
- [x] Amount display: (Qty × Rate) × (1 + Tax%)

### Billing Entity UI
- [x] Replace individual bank fields with bankDetails textarea in create/edit forms
- [x] Update detail view to show bankDetails as multiline text

### PDF
- [x] Update to 6-column layout: Item, Curr, Qty, Rate, Tax, Amount
- [x] Update Payment Details to render bankDetails as plain text with line breaks

### Cleanup
- [x] Update all invoice type references throughout codebase
- [x] Update test files for new types

## Round 29 - Payroll/Leave/Adjustment UI Fixes

### Payroll Detail Access
- [x] Allow viewing payroll item details when payroll run is in pending_approval state (read-only)
- [x] Ensure payroll items are clickable/viewable in all non-draft states

### Leave/Adjustment History Actions
- [x] Add "View" action button for Leave records in History tab (locked/approved status)
- [x] Add "View" action button for Adjustment records in History tab (locked/approved status)
- [x] View action opens read-only detail dialog

## Round 30 - Multiple Bug Fixes

### Issue 1: Invoice not generated after approving Feb 2026 GB payroll run
- [x] Investigated: Invoice generation is a separate step (done from Invoice page Generate button), not auto-triggered on payroll approval. This is by design.
- [x] Confirmed exchange rates exist for GBP→EUR (customer settlement currency)

### Issue 2: Invoice list sorting is chaotic
- [x] Fixed: sort by invoiceMonth desc, then createdAt desc

### Issue 3: PDF always generates 2 pages, footer on separate page
- [x] Fixed: footer now renders on every page at bottom using bufferedPageRange loop, no extra page

### Issue 4: Subtotal calculation incorrect
- [x] Fixed: subtotal = pre-tax employment cost, serviceFeeTotal = pre-tax service fee, total = subtotal + serviceFeeTotal + tax

### Issue 5: Exchange rate not fetching correctly
- [x] Investigated: exchange rates exist in DB for GBP→EUR. Auto-fetch works when foreign currency items are added.

### Issue 6: No manual invoice creation button
- [x] Added "Create Invoice" button to Invoice list page header
- [x] Added full manual create dialog with customer, type, month, currency, billing entity, amounts, notes, due date

### Issue 7: Billing Entity still has Payment Terms field
- [x] Removed paymentTermDays from billing entity create/update router mutations
- [x] Removed paymentTermDays from BillingEntities.tsx UI form
- [x] Updated test files to remove paymentTermDays references

### Issue 9: Billing Entity country/currency are text inputs, should be selectors
- [x] Changed country to CountrySelect dropdown (auto-sets currency from country config)
- [x] Changed currency to CurrencySelect dropdown

### Issue 10: EUR currency only maps to AT, should include DE, FR, ES, IT etc.
- [x] Expanded CountrySelect from 32 to 80+ countries (all Eurozone: AT, BE, CY, EE, ES, FI, GR, HR, IE, IT, LT, LU, LV, MT, PT, SI, SK + more)
- [x] Expanded CurrencySelect with 30+ additional currencies
- [x] Updated invoice type filter to include all actual types (monthly_eor, monthly_visa_eor, monthly_aor, visa_service, manual)

## Round 31 - Invoice Logic, Payroll References, Status Flow

### Issue 1: Employment Cost in invoice doesn't match payroll total employment cost
- [x] Investigated: Invoice Employment Cost correctly references payroll item totalEmploymentCost (GBP 7,949.78)
- [x] The 9,280.02 is the EUR equivalent (7,949.78 × 1.167330 GBP→EUR rate) because customer settles in EUR

### Issue 2: Service fee currency mismatch (USD service fee vs EUR settlement)
- [x] Code already handles this: service fee USD amount is converted to settlement currency using USD→EUR exchange rate
- [x] Verified exchange rate lookup logic in invoiceGenerationService

### Issue 3: Payroll run summary fields - are they referenced anywhere?
- [x] Confirmed: these fields are for operations manager reference only, not referenced by invoice generation
- [x] Invoice uses individual payroll item totalEmploymentCost, not the run-level aggregates

### Issue 4: Rename payroll run summary fields for clarity
- [x] Renamed in Payroll Detail: "Country-Level Payroll Summary (Ops Reference)" with clearer labels
- [x] Renamed in Payroll List: "Employer Cost" → "Country Total Cost" to distinguish from per-employee invoice amounts

### Issue 5: Invoice batch action status flow clarification
- [x] Send for Review → pending_review status (internal review before sending to client)
- [x] Mark Sent → sent status (invoice has been sent to client)
- [x] Mark Paid → paid status (requires payment amount input, validates against invoice total)
- [x] Cancel → cancelled status (invoice voided, moves to History)

### Issue 6: Invoice history tab
- [x] Added History tab: shows paid, cancelled, void invoices
- [x] Active tab shows draft, pending_review, sent invoices
- [x] History tab includes Paid Amount and Paid Date columns

### Issue 7: Mark Paid - payment amount validation
- [x] Backend: require paidAmount when marking as paid (both single and batch)
- [x] Backend: returns paymentResult (exact/underpayment/overpayment) with difference amount
- [x] Frontend: Mark Paid button opens dialog with payment amount input
- [x] Frontend: Shows comparison (paid vs invoice total) and warning for partial/over payment
- [x] Batch Mark Paid: opens dialog requiring amount per invoice, with warning about batch limitations

### Issue 8: Invoice sorting
- [x] Fixed: sort by createdAt desc (latest created first)

## Round 32 - Invoice Item Currency Fix + Payment Handling

### Issue A: Invoice item amount should stay in original currency
- [x] Fixed invoiceGenerationService: Employment Cost item unitPrice and amount now store original currency amount (e.g. GBP 7,949.78)
- [x] Item currency (Curr) column shows original currency (GBP), amount shows original amount
- [x] Currency conversion (GBP→EUR) only applies at invoice total level (subtotal/tax/total are in settlement currency)
- [x] Invoice total = sum of (each item amount × exchange rate) + tax — correctly calculated
- [x] PDF already uses item.amount and item.localCurrency directly — no change needed

### Issue B: Mark Paid - automatic follow-up actions
- [x] Underpayment: auto-creates follow-up invoice (type=manual) for the difference amount, dated next month
- [x] Overpayment: auto-generates credit note via creditNoteService for the overpaid amount
- [x] Both actions happen automatically in updateStatus mutation when Mark Paid is confirmed
- [x] Frontend shows toast notifications with follow-up invoice ID or credit note ID
- [x] Follow-up invoice has relatedInvoiceId referencing the original invoice
- [x] Credit note has relatedInvoiceId referencing the original invoice
- [x] Mark Paid dialog shows preview warnings: underpayment → "follow-up invoice will be auto-created", overpayment → "credit note will be auto-generated"

## Round 33 - Currency Display, Create Invoice, Duplicate Prevention, Monthly Overview

### Issue 1: Currency display format
- [x] Removed country suffix from currency display in Invoice line item editor ("USD (EC)" → "USD")
- [x] Checked all pages: CurrencySelect already shows "USD — US Dollar" format correctly
- [x] Payroll page shows "GB · GBP" which is appropriate context
- [x] Currency-to-country mapping remains in DB layer for salary currency auto-detection only

### Issue 2: Simplify Create Invoice form
- [x] Removed subtotal, tax, total amount fields from manual create invoice form
- [x] Form now only requires: Customer, Billing Entity, Currency, Invoice Type, Due Date, Notes
- [x] Changed currency input to CurrencySelect dropdown
- [x] Amount details can be added after creation via line items

### Issue 3: Prevent duplicate monthly invoices
- [x] Generate now checks for existing non-cancelled/void invoices with same customer/month/type/currency
- [x] Duplicates are skipped with warning message showing existing invoice number
- [x] Regenerate retained: it deletes draft invoices for the month first, then regenerates (useful when payroll data changes)

### Issue 4: Monthly Overview enhancements
- [x] Backend returns per-currency breakdown: totalAmount, paidAmount, invoiceCount, collectionRate per currency
- [x] Frontend shows "Revenue by Currency" section with each currency card
- [x] Each currency card shows: Total Invoiced, Collected, Outstanding amounts + collection rate %
- [x] Color-coded progress bar: green (≥100%), amber (≥50%), red (<50%)
- [x] Cancelled/void invoices excluded from totals

## Round 34 - Invoice UI Refinements, Data Cleanup, Milestone Checkpoint

### Feature 1: Related Invoices section in Invoice Detail
- [x] Add "Related Invoices" section showing linked follow-up invoices and credit notes
- [x] Add auto-notification to finance manager when credit note or follow-up invoice is created

### Feature 2: Subtotal display cleanup
- [x] Remove separate service fee line from invoice summary
- [x] Show only Subtotal (all non-tax items), Tax, and Total Due

### Feature 3: Regenerate confirmation warning
- [x] Add strong confirmation dialog before Regenerate (warns about deleting existing drafts)

### Feature 4: Batch operation restrictions
- [x] Remove Mark Paid from batch actions (must be done individually with payment amount)
- [x] Remove Cancel from batch actions (must be done individually)

### Feature 5: Invoice delete rules
- [x] Allow deleting manually created draft invoices only
- [x] Auto-generated invoices cannot be deleted (only cancelled)
- [x] Add delete button with confirmation for eligible invoices

### Feature 6: Test data cleanup
- [x] Delete redundant test customers/employees/payroll data (295→3 customers, 127→10 employees, 334→2 billing entities, 214→5 invoices)
- [x] Keep only logically sound test records for new round of testing

### Feature 7: Milestone checkpoint
- [x] Run all tests (185 tests passing across 12 test files)
- [x] Save milestone checkpoint as major version iteration

## Round 35 - Pre-Launch Preparation

### 1. Exchange Rate API Integration
- [x] Research and select exchange rate API provider → Frankfurter API (ECB data, free, reliable)
- [x] Implement server-side exchange rate fetching service (exchangeRateFetchService.ts)
- [x] Add daily cron job (17:00 CET) to auto-fetch exchange rates
- [x] Store fetched rates in exchange_rates table with source=frankfurter_ecb
- [x] Add manual "Fetch Live Rates" button for admin
- [x] Keep manual rate override capability for admin adjustments
- [x] Add error handling and fallback for API failures

### 2. Settings Page Consolidation
- [x] Move Exchange Rates management into Settings as admin-only tab
- [x] Move User Management into Settings as admin-only tab
- [x] Remove Exchange Rates from sidebar (now under Settings)
- [x] Remove User Management from sidebar (now under Settings)
- [x] Settings tabs: General, Exchange Rates, User Management
- [x] Restrict Exchange Rates and User Management to admin role only

### 3. Role-Based Access Control (RBAC)
- [x] Audit current role definitions and permissions in the system
- [x] Enforce role-based procedures on all routers:
  - Admin-only: Settings (exchange rates, user management, system config)
  - Operations Manager: Leave, Adjustments write operations
  - Finance Manager: Invoice, Billing Entity write operations
- [x] Protect sensitive routes and mutations with role checks

### 4. Global Format Audit & Bug Fixes
- [x] Date format: unified to DD MMM YYYY via centralized format.ts utility
- [x] Currency format: unified via formatAmount with 2 decimal places + thousand separators
- [x] Country format: consistent display via CountrySelect component
- [x] All pages updated: Dashboard, Employees, Customers, Payroll, Invoices, Leave, Adjustments, Settings
- [x] Filter audit: cleaned up 45 test country configs, 150 test leave types, orphan records
- [x] Second round test data cleanup: 13→3 customers, 14→10 employees, 4→2 billing entities, 6→4 invoices
- [x] All 185 tests passing across 12 test files

### 5. Brand Identity Update
- [x] Update system logo with GEA logo
- [x] Update color scheme per brand manual (#005430, #2E6E50, #E1BA2E)
- [x] Update favicon
- [x] Update system title to "GEA — Global Employment Advisors"

### 6. Admin SaaS Acceptance Testing
- [ ] Prepare acceptance test checklist
- [ ] End-to-end workflow validation
- [ ] Edge case testing

### 7. Customer Portal Requirements (post-acceptance)
- [ ] Draft customer portal requirements document
- [ ] Design customer portal architecture

## Round 36 - Pre-Launch Final Polish

### 1. Business Logic Validation Rules
- [x] Employee start date cannot be earlier than today
- [x] Contract end date cannot be earlier than employee start date
- [x] Visa expiry date cannot be earlier than today
- [x] Cannot create Adjustment for locked/approved payroll months
- [x] Cannot create Leave for locked/approved payroll months

### 2. UI Layout & Spacing Fixes
- [x] Fix Billing Entities page - added p-6 padding wrapper
- [x] Fix User Management page - consolidated into Settings with proper padding
- [x] Fix Audit Log page - added p-6 padding wrapper
- [x] Global page layout spacing consistency audit

### 3. Page Cleanup
- [x] Delete Help Center from sidebar and routes
- [x] Delete Settings General tab (no useful functionality)
- [x] Settings keeps only Exchange Rates and User Management tabs

### 4. Invoice Generation Logic Fix
- [x] VAT tax should NOT be a separate invoice item - display in Tax column per employee item
- [x] Each country's VAT rate shows in the Tax column of corresponding employee items
- [x] Invoice grouping: customer + country + service type + month (no cross-country mixing)
- [x] Fix: UK EOR employees must not appear in Germany EOR invoice
- [x] Update PDF template to reflect tax-per-item structure

### 5. Audit Log & Dashboard Description Improvements
- [x] Dashboard Recent Activity descriptions - human-readable via auditDescriptions.ts
- [x] Audit Log descriptions - natural language with action icons and color coding
- [x] Remove technical jargon from all activity descriptions

### 6. System Notification Improvements
- [x] Error messages - improved readability
- [x] Toast notifications - stack vertically with gap-2
- [x] Multiple toasts visible simultaneously (visibleToasts: 5)

### 7. Exchange Rate System Cleanup
- [x] Unify exchange rate direction to USD → XXX only
- [x] Clean up duplicate reverse rates (XXX → USD)
- [x] Fetch all currencies from countries_config dynamically
- [x] Add global Markup % adjustment input in Settings Exchange Rates tab (default 5%)
- [x] Unify all existing markup values to global setting
- [x] Verify markup direction: customer pays MORE USD (rate × (1 - markup%))

### 8. User Management Enhancements
- [x] Role permission description cards (admin/finance_manager/operations_manager)
- [x] Allow changing user role from user list
- [x] Allow disabling/enabling users
- [x] New user onboarding note (OAuth-based, users created on first login)

### 9. Brand Identity Update (GEA)
- [x] Update system logo to GEA logo (generated from brand guide)
- [x] Update color scheme: primary #005430, secondary #2E6E50, accent #E1BA2E, light bg #E4F4EA
- [x] Update favicon to GEA icon
- [x] Update system title to "GEA — Global Employment Advisors"
- [x] Update sidebar branding (dark green sidebar, GEA logo + subtitle)
- [x] Replace all "EOR Global" references with "GEA" across entire codebase
- [x] All 185 tests passing across 12 test files

## Round 37 - Full Data Reset for Acceptance Testing

- [x] Clear ALL data from database (including real data)
- [x] Reset system to blank state
- [x] Verify Dashboard shows all zeros
- [x] Verify all pages load correctly with empty data

## Round 37.1 - System-Level Country Data Seeding

- [x] Create comprehensive seed script with 125 EOR countries (all inactive by default)
- [x] Include statutory annual leave, probation period, notice period, VAT rates, currencies
- [x] Fetch 2026 public holidays from Nager.Date API for each country (1312 holidays, 97 countries)
- [x] Populate leave_types table with statutory leave types per country (762 entries)
- [x] Add seed endpoint / migration script to populate data
- [ ] Protect system data from test data cleanup operations
- [ ] Verify Countries page shows all pre-configured countries
- [ ] Update tests to verify seed data integrity

## Round 38 - Public Holidays & Exchange Rate API & User Portal

### Public Holidays
- [x] Create public_holidays table (separate from leave_types)
- [x] Move holiday data from leave_types to public_holidays
- [x] Clean up leave_types: remove all "Public Holiday:" entries
- [x] Update seed script to use public_holidays table
- [ ] Future: Calendar view showing public holidays for countries with active employees

### Exchange Rate API
- [x] Research exchange rate APIs supporting 125+ currencies
- [x] Find 1-2 backup API providers (Currencyapi.com + Open Exchange Rates)
- [x] Document API comparison (coverage, cost, rate limits) → docs/exchange-rate-api-comparison.md
- [x] Integrate ExchangeRate-API as primary rate source (166 currencies, covers all 99)
- [x] Keep Frankfurter as fallback (30 currencies)
- [x] Update exchangeRateFetchService.ts with dual-provider strategy

### User Portal (Client-Facing)
- [ ] Design user portal layout and navigation
- [ ] User portal authentication (customer contacts with portal access)
- [ ] Dashboard: customer's employees overview
- [ ] Employee directory: view assigned employees
- [ ] Invoice history: view and download invoices
- [ ] Leave requests: submit/view leave for their employees
- [ ] Document access: view employee contracts and documents
- [ ] Notifications: system updates and alerts

## Round 39 - Client Portal (Same Project, Strict Module Isolation)

### Phase 1: Schema & Auth Infrastructure
- [x] Add portal auth fields to customer_contacts (passwordHash, portalRole, inviteToken, inviteExpiresAt, lastLoginAt)
- [x] Run db:push to migrate schema
- [x] Create portal JWT signing/verification (independent from admin Manus OAuth)
- [x] Create portal auth middleware (reads portal-specific cookie, injects customerId + contactId)
- [x] Create protectedPortalProcedure that ALWAYS injects ctx.customerId into every query

### Phase 2: Portal Backend (tRPC Routers under /api/portal)
- [x] Portal auth router: login, register (via invite), change password, logout, me
- [x] Portal dashboard router: employee stats, pending tasks, activity feed
- [x] Portal employees router: list (scoped), detail, onboarding request
- [x] Portal adjustments router: list (scoped), create, update (if not locked)
- [x] Portal leave router: list (scoped), create, balances, public holidays
- [x] Portal invoices router: list (scoped), detail, download PDF
- [x] Portal settings router: company profile, leave policies, user management, invite

### Phase 3: Portal Frontend (independent entry under /portal/*)
- [x] Portal login page (/portal/login)
- [x] Portal invite/register page (/portal/register?token=xxx)
- [x] Portal layout shell with sidebar navigation
- [x] Portal Dashboard with global employee map + metrics
- [x] Portal Onboarding page
- [x] Portal Employees directory
- [x] Portal Adjustments page
- [x] Portal Leave page
- [x] Portal Invoices page with download
- [x] Portal Settings page (company profile, team management)

### Security (HIGHEST PRIORITY)
- [x] Verify: Portal JWT cannot access admin routes (separate tRPC instances)
- [x] Verify: Admin Manus OAuth cannot access portal routes (different cookie + issuer)
- [x] Verify: Every portal query is scoped to ctx.customerId (protectedPortalProcedure)
- [x] Verify: Portal users cannot see admin-only fields (select queries exclude sensitive data)
- [x] Write data isolation tests (17 security tests passing)
- [x] All 202 tests passing (0 failures)

## Round 40 - Admin Portal Invite Flow

- [x] Add admin backend endpoint: generatePortalInvite (creates invite token for a contact)
- [x] Add admin backend endpoint: revokePortalAccess
- [x] Add "Invite to Portal" / "Resend Invite" button in Admin customer contacts tab
- [x] Show invite link in a dialog after generation (with copy-to-clipboard)
- [x] Show portal access status badge on each contact (Active/Invited/No access)
- [x] Add "Revoke" button for active portal accounts
- [x] Write 15 portal invite flow tests (217 total tests passing)
- [ ] Test full flow: invite → register → login → see portal dashboard

## Round 41 - Portal Dashboard Map & Password Reset

### Dashboard Global Employee Map
- [x] Research China-accessible map/visualization libraries (react-simple-maps, SVG-based, no tile server)
- [x] Implement world map showing employee distribution by country (choropleth)
- [x] Show country name, employee count, and color intensity on hover
- [x] Integrate into Portal Dashboard page with country breakdown list

### Portal Password Reset
- [x] Add password reset token fields to schema (resetToken, resetExpiresAt)
- [x] Create forgot password endpoint (generates reset token, prevents email enumeration)
- [x] Create verify reset token endpoint
- [x] Create reset password endpoint (validates token, sets new password, auto-login)
- [x] Build forgot password UI page (/portal/forgot-password) with DEV mode reset link display
- [x] Build reset password UI page (/portal/reset-password?token=xxx) with token verification
- [x] Add "Forgot password?" link to Portal Login page
- [x] Write 11 password reset tests (228 total tests passing)

## Round 42 - Invoice Bug Fixes

### Bug 1: Service fees should not have VAT applied
- [x] Identified VAT applied to service fee items in invoiceGenerationService.ts and visaServiceInvoiceService.ts
- [x] Set vatRate=0 for service fee types (eor_service_fee, visa_eor_service_fee, aor_service_fee)
- [x] Updated recalculateInvoiceTotals to skip VAT on service fees

### Bug 2: Billing entity logo not displayed on invoice
- [x] Added logo fetching from billingEntity.logoUrl in invoicePdfService.ts
- [x] Renders logo image in PDF header when available, falls back to text-only

### Bug 3: Country code (DE) displayed on invoice items - should only show item type
- [x] Removed country code display from PDF service item rendering
- [x] Removed country code display from frontend Invoices.tsx line items table

### Bug 4: Subtotal + tax does not match total due
- [x] Fixed recalculateInvoiceTotals: subtotal = employment costs only, serviceFeeTotal separate
- [x] total = subtotal + serviceFeeTotal + taxTotal (now adds up correctly)

### Bug 5: External Notes and Internal Notes cannot be edited
- [x] Backend update endpoint already accepts notes/internalNotes
- [x] Added editable Notes card with Textarea in frontend (Edit button → Save/Cancel)

### Bug 6: Cannot change billing entity after invoice creation
- [x] Backend update accepts billingEntityId, customerId, currency, invoiceMonth, dueDate, invoiceType
- [x] Added editable Invoice Details card with dropdowns and date pickers (draft only)
- [x] Billing entity change auto-regenerates invoice number

### Bug 7: Per-invoice regenerate (not just global regenerate)
- [x] Added regenerateSingleInvoice function in invoiceGenerationService.ts
- [x] Added regenerateSingle endpoint in invoiceGeneration router
- [x] Added Regenerate button + confirmation dialog in frontend (draft only)

### Bug 8: Visa one-time fee invoice not auto-created when status changes
- [x] Fixed employee update to check previous visa status before creating invoice
- [x] Handles status rollback: checks if existing visa invoice was cancelled/void
- [x] Recreates visa fee invoice if previous one was cancelled

### Bug 9: Allow cancel/delete for auto-created invoices in draft status
- [x] Delete endpoint: removed invoiceType restriction, allows all draft/cancelled invoices
- [x] Added draft → cancelled transition in status workflow
- [x] Frontend: Delete button visible for all draft invoices, Cancel option in status dropdown
- [x] 247 total tests passing (20 new invoice bug fix tests)

## Round 43 - Invoice PDF Fixes & Preview

### PDF Layout Fixes
- [x] Fix PDF header layout: left/right columns use independent Y tracking, logo doesn't break entity info
- [x] Remove "Generated on" footer from all pages
- [x] Entity name font size reduced to 16pt, all text uses width constraints to prevent overlap

### PDF Preview Feature
- [x] Add /api/invoices/:id/pdf/preview endpoint (Content-Disposition: inline)
- [x] Frontend: Preview PDF button for draft/pending_review invoices (opens in new tab)
- [x] Frontend: Download PDF button for sent/paid/overdue/cancelled invoices
- [x] Button visibility based on invoice status

## Round 44 - Payroll Cutoff Logic

### Core Cutoff Rules
- [x] Create shared payroll cutoff utility (getCutoffDate, getPayrollPeriod, getPaymentDate)
- [x] Cutoff rule: every month 4th 23:59 is cutoff for PREVIOUS month's payroll run
- [x] Feb adjustments/leave cutoff on March 4th 23:59, paid on March last business day
- [x] Leave/adjustment attribution: based on end date for cross-month entries

### Leave Cutoff Logic
- [x] Allow recording leave for previous month before cutoff
- [x] Cross-month leave: split by month, each portion attributed to its end-month payroll
- [x] Long leave (e.g. maternity): auto-split into monthly portions
- [x] Show payroll period indicator on leave form ("Will be included in [Month] payroll")
- [x] Post-cutoff entries: admin/operations_manager override (regular users blocked after cutoff)
- [x] Admin override: allow force-adding to closed payroll run (with audit trail)

### Adjustment Cutoff Logic
- [x] Use effective month to determine payroll attribution (not entry date)
- [x] Allow recording adjustments for previous month before cutoff
- [x] Show payroll period indicator on adjustment form
- [x] Post-cutoff entries for past months: admin/operations_manager override with warning
- [x] Admin override for post-cutoff adjustments

### Frontend Prompts
- [x] Leave form: show current payroll period, cutoff countdown, attribution month
- [x] Adjustment form: show which payroll run the adjustment will be included in
- [x] Warning toast when entering data that will be in next month's payroll
- [x] Warning for cross-month leave explaining the split

### Tests
- [x] 45 comprehensive cutoff tests (cross-month splitting, attribution, role-based access, edge cases)

## Round 45 - Business Logic Fixes & UX Improvements

### 1. Cross-month leave split into multiple DB records
- [x] When leave crosses month boundary, create separate leave records per month
- [x] Each record has its own startDate/endDate/days, independent cutoff and payroll attribution
- [x] Frontend shows split preview before submission

### 2. Invoice Generate/Regenerate duplicate warning
- [x] Before Generate/Regenerate, query current month invoice status distribution
- [x] If non-draft invoices exist, show warning dialog with counts before proceeding
- [x] User must confirm to continue

### 3. Cron job payroll run month fix
- [x] Change auto-create from next month to current month
- [x] Feb 5th creates Feb payroll run (not March), locks Jan data

### 4. Customer contact auto-create and sync
- [x] On customer create: auto-create customer_contacts record with isPrimary=true
- [x] On contact isPrimary change: sync name/email/phone back to customers table
- [x] On customer primaryContact edit: sync to corresponding isPrimary contact record

### 5. Employee duplicate leave detection
- [x] Check for date overlap with existing submitted/approved/locked leave records
- [x] Reject creation if overlap found, with clear error message
- [x] Same-batch split records don't count as overlapping

### 6. Allow pre-cutoff past-month leave/adjustments
- [x] Remove "start date cannot be in the past" restriction from leave creation
- [x] Use pure cutoff validation: allow if month's cutoff hasn't passed
- [x] Same logic for adjustments

### 7. Date calendar validity check
- [x] Backend validates dates are real calendar dates (no Feb 31, etc.)
- [x] Frontend DatePicker prevents invalid dates by design

### 8. DatePicker component (shadcn Calendar + Popover)
- [x] Create reusable DatePicker and MonthPicker components with Calendar + Popover
- [x] Disable manual text input, only calendar selection
- [x] Support year/month dropdown navigation for quick jumping
- [x] Apply DatePicker to Leave page (create + edit forms)
- [x] Apply MonthPicker to Adjustments page (create + edit forms)

### Tests
- [x] 36 comprehensive tests covering all 8 fixes (all passing)

## Round 46 - Bug Fixes & Data Cleanup

### 1. Fix: Cross-month unpaid leave not showing in payroll auto-fill
- [x] Diagnose why split cross-month leave records don't appear in payroll deductions
- [x] Fix the auto-fill query to handle both split records and legacy cross-month records with proportional allocation

### 2. Remove unused ID number field from employee
- [x] Verified: idNumber field already removed from schema and UI in prior refactor
- [x] No code references found in codebase

### 3. Clean up test data
- [x] Deleted 80 test customers and all related data (employees, contacts, contracts, pricing, invoices, payroll items)
- [x] Preserved Acme Corp (CUS-330021) with 9 employees, 11 invoices, 2 payroll runs
- [x] Preserved BEST GEA (HK) LIMITED billing entity
- [x] Preserved system data: 133 countries, 185 exchange rates, system settings

### 4. Fix PDF preview garbled text at top
- [x] Diagnose: Helvetica font cannot render CJK characters in billing entity address
- [x] Fix: Added Noto Sans SC font with CDN download + local cache, smart text rendering for CJK
- [x] Fix: Period month display off-by-one (timezone issue in Date parsing)

### 5. Fix employee email auto-capitalize
- [x] Ensure employee email input auto-converts to lowercase in create and edit forms### 6. Long-term contract hide End Date
- [x] End Date field conditionally shown only when employmentType is fixed_term (create + edit forms)n create/edit forms

### 7. Fix long filename breaks UI layout
- [x] Added truncate + max-width to file name displays in Employees, Customers, Adjustments pages
- [x] Added title attribute for full name tooltip on hover

### 8. Roles allow multi-select (one person can hold multiple roles)
- [x] Changed role field from enum to varchar(200) for comma-separated multi-roles
- [x] Created shared/roles.ts with parseRoles, serializeRoles, hasRole, hasAnyRole, validateRoles
- [x] Updated procedures.ts, cutoff.ts, _core/trpc.ts to use multi-role checking
- [x] Updated userManagement router: updateRole now accepts roles array with validation
- [x] Updated Settings.tsx + UserManagement.tsx: checkbox multi-select with exclusive/combinable rules
- [x] admin and user are exclusive; operations_manager, finance_manager, customer_manager can combine

## Round 46 continued - Uniqueness, Invoice Rules, UI Fixes

### Uniqueness Constraints
- [x] 1. Employee email unique per customer (application-level check)
- [x] 2. BillingEntity invoicePrefix unique (DB + app check)
- [x] 3. BillingEntity entityName/legalName duplicate warning (soft check)
- [x] 4. Customer companyName duplicate warning (soft check)
- [x] 5. Customer registrationNumber unique (hard check if provided)
- [x] 6. PayrollItems (payrollRunId + employeeId) unique (DB constraint)
- [x] 7. LeaveBalances (employeeId + leaveTypeId + year) unique (DB constraint)
- [x] 8. CustomerLeavePolicies unique index upgrade
- [x] 9. ClientCode/EmployeeCode generation fix (use insertId instead of MAX)

### Invoice Business Rules
- [x] 10. Credit Note only for Paid invoices (not sent/overdue)
- [x] 11. Invoice can be cancelled before Paid (draft, pending_review, sent, overdue)
- [x] 12. Overdue auto-detect via cron (no manual transition, system checks dueDate vs today)

### UI/UX Fixes
- [x] 13. Hide Profile and global search (not implemented)
- [x] 14. Settings only visible to admin users
- [x] 15. Real-time exchange rate reference on invoice detail (finance manager only, not in PDF)

### Data Cleanup
- [x] 16. Delete remaining test data except CUS-330021 and system data

## Round 47 - Test Data Hygiene
- [x] 1. Clean up all test data residue left by vitest runs (56 customers, 14 employees, 48 invoices, 66 billing entities)
- [x] 2. Created shared TestCleanup utility (server/test-cleanup.ts) for consistent cleanup across all test files
- [x] 3. Added afterAll cleanup to 7 test files that create real DB data (finance-phase1/2/3, customer-leave-policy, payroll-refactor, features, round46-constraints)
- [x] 4. Fixed tests using customerId: 1 (non-existent) to use real Acme Corp ID (360001)
- [x] 5. Fixed invoice number collision by using unique billing entity prefixes per test
- [x] 6. Verified: 19 test files, 337 tests pass, zero data residue after full suite run
- [x] 7. Final DB state: 1 customer (Acme Corp), 1 employee, 1 billing entity, 4 real invoices

## Round 48 - Feature Improvements

- [x] 1. Invoice detail: move exchange rate comparison into Total Due card, show amount difference (USD) instead of rate difference
- [x] 2. PDF invoice: fix billing entity address overlap (dynamic height instead of fixed 12px)
- [x] 3. Cross-month leave: already fully implemented (backend auto-split + frontend preview + per-month locking)
- [x] 4. Dashboard: add backend APIs (monthlyTrends, operationsOverview, financeOverview, hrOverview)
- [x] 5. Dashboard: rebuild as 5-tab layout (Overview, Operations, Finance, HR & Leave, Activity Log)
- [x] 6. Dashboard: interactive charts for monthly trends and revenue (total invoice revenue + service fee revenue)
- [x] 7. Dashboard: strict role-based tab visibility
- [x] 8. Help Center: create page with operation guides, FAQ, glossary
- [x] 9. Help Center: complete bilingual content (EN + CN)
- [x] 10. Help Center: search functionality
- [x] 11. Audit Logs: keep independent page, add quick access from Dashboard Activity tab

## Round 49 - Bug Fixes & Improvements
- [x] 1. Invoice line item: change tax hint from "Auto: 15%" to "Country default VAT: 15%" (keep auto-fill)
- [x] 2. Invoice detail: live exchange rate logic verified correct (checks line items localCurrency)
- [x] 3. Dashboard HR tab: redesigned with 6 workforce KPIs, monthly workforce trend chart, contract expiry alerts (30/60/90 days), leave status pie, monthly leave trend, adjustment breakdown
- [x] 4. Dashboard Overview: added monthly new hires/terminations/new clients KPI cards (6-column grid)
- [x] 5. i18n: completed all Chinese translations for Dashboard (30+ keys), AuditLogs, BillingEntities, ExchangeRates, UserManagement pages
- [x] 6. Customer status: capitalize + i18n + unified Badge min-width styling
- [x] 7. Help Center: already has comprehensive guides (8 modules), FAQ (12 items), glossary (12 terms) covering all EOR operations
- [x] 8. Employee create dialog: widen dialog for better UI layout (max-w-3xl → max-w-5xl)
- [x] 9. Data cleanup: delete history data in adjustments, leave, and invoice tables (16 items, 4 invoices, 3 payroll items, 3 runs, 2 adjustments, 6 leaves, 6 balances)
- [x] 10. Page transition: add loading/fade-in effects when navigating between pages
- [x] 11. Audit Logs: show user name instead of user ID (LEFT JOIN users table + backfilled 1904 records + future writes include userName)
- [x] 12. Page transitions: enhanced fadeInUp animation (cubic-bezier), added PageSkeleton components, added loading skeletons to AuditLogs, UserManagement, BillingEntities, ExchangeRates, Settings pages

## Round 50 - Deposit/Credit Note Logic, Apply Mechanism, Unified Pickers
- [x] 1. Deposit Invoice: require employee Terminated status before creating deposit refund or credit note (backend validated) creation
- [x] 2. Credit Note Apply mechanism: new credit_note_applications table, apply credit to future invoices, remainingBalance tracking, status=applied when balance=0 (schema + backend + frontend UI)
- [x] 3. Credit Note: removed "mark as paid" flow, replaced with Apply Credit UI (select invoice, enter amount, view application history, balance display)
- [x] 4. Employee reactivation (terminated→active): auto-check deposit status, auto-generate new draft deposit invoice if previous was refunded/credited (backend implemented)
- [x] 5. Invoice billingMonth backfill: filled null billingMonth via SQL, ensured all creation paths set invoiceMonth (manual defaults to now, deposit refund added invoiceMonth)
- [x] 6. Employee create dialog: already using DatePicker component (verified), also fixed ExchangeRates and Settings pages
- [x] 7. MonthPicker global unification: all type="date"/type="month" inputs replaced across active pages (Invoices, ExchangeRates, Settings); Payroll/Leave use Select dropdowns (appropriate for data-driven filtering)
- [x] 8. Invoice list: added MonthPicker filter for billingMonth (backend + frontend)
- [x] 9. Bug fix: Invoice exchange rate auto-fetch fixed (addItem/updateItem auto-fetch + recalculate syncs to invoice level + fixed GEAHK-202602-003 data)
- [x] 10. Bug fix: Invoice exchange rate display direction unified - both invoice rate and live rate now show XXX→USD direction
- [x] 11. Bug fix: Replaced all old date/month inputs in Invoices.tsx with DatePicker and MonthPicker (5 replacements: 2 due date, 3 month)

## Round 51 - Financial Accounting Compliance & Invoice Calculation Fix
- [x] 1. Bug fix: Invoice subtotal/total calculation wrong - not applying exchange rate (CNY amount shown as USD)
- [x] 2. Bug fix: At Live Rate (USD) calculation also wrong - needs correct exchange rate application
- [x] 3. Credit Note Apply: auto-update target invoice status to paid when fully covered by credit
- [x] 4. Deposit revenue separation: exclude deposit invoices from total revenue statistics (deposit is liability, not revenue)
- [x] 5. Mark as Paid: replaced credit note prompt with credit applied summary (credit applied before sending)
- [x] 6. Credit Note balance validation: prevent over-application, ensure balance cannot go negative
- [x] 7. Apply Credit cap: amount cannot exceed target invoice remaining balance (invoice total - already applied credits)
- [x] 8. Apply Credit: only pending_review invoices can receive credit (sent/paid/overdue rejected)
- [x] 9. Restrict credit apply to pending_review status only (not sent/overdue)
- [x] 10. Show credit applied details on invoice detail page (credit note number, amount, Credit Applications Received section)
- [x] 11. Update invoice PDF to show "Less: Credit Applied" line between subtotal and total, with AMOUNT DUE
- [x] 12. Mark as Paid uses adjusted Amount Due (total minus credit applied) for payment comparison
- [x] 13. Removed credit note prompt from Mark as Paid dialog (replaced with credit applied summary)

## Round 52 - Deposit Lifecycle & Reactivation Fix (Superseded by Round 52 Confirmed below)
- [x] 1. Bug fix: Deposit invoice status not updated → resolved via relationship-based check (no status change needed)
- [x] 2. Bug fix: Employee reactivation deposit prompt → fixed via hasDepositInvoice relationship check
- [x] 3. Track deposit effective status → resolved via deposit_refund/credit_note relationship, not status field

## Round 52 - Financial Accounting Rules (Confirmed)
- [x] 1. Rollback: remove `refunded` status from schema
- [x] 2. Rollback: remove deposit status marking in depositRefundService and creditNoteService
- [x] 3. Deposit mutual exclusion: refund and credit note are mutually exclusive for same deposit
- [x] 4. Deposit: only full-amount credit note allowed (no partial)
- [x] 5. Credit note cumulative limit: total credit notes for one invoice cannot exceed invoice total
- [x] 6. Credit note type restriction: cannot create credit note for credit_note or deposit_refund types
- [x] 7. Credit note apply: only `sent` status credit notes can be applied
- [x] 8. Credit note apply: only `pending_review` invoices can receive credit
- [x] 9. Apply amount cap: credit note side (remaining balance) and invoice side (remaining payable)
- [x] 10. Auto-mark: credit note → `applied` when balance exhausted; invoice → `paid` when fully covered
- [x] 11. Invoice detail page: Add "Apply Credit" button for pending_review invoices (bidirectional)
- [x] 12. hasDepositInvoice: use relationship check (deposit_refund/credit_note existence) instead of status
- [x] 13. Status cleanup: void merged to cancelled in business logic, front-end remove void option
- [x] 14. Deposit refund: no overdue status, no due date (deposit_refund already has no dueDate in generation service)
- [x] 15. Help Center: write update document for this release (v2.4.0 Updates tab added)
- [x] 16. Write and run comprehensive tests for all Round 52 changes (407 tests passed, 0 failed)

## Client Portal - Full Implementation

### Backend Enhancements
- [x] Portal employee onboarding endpoint (create employee with documents)
- [x] Portal document upload endpoint (S3)
- [x] Self-service onboarding: invite token generation + public form endpoint
- [x] Self-service onboarding: employee self-fill submission endpoint
- [x] Portal payroll list endpoint (approved/locked payroll runs with items)
- [x] Portal invoice detail endpoint with line items
- [x] Portal credit notes and deposits endpoints
- [x] Portal PDF download endpoint (portal JWT auth)
- [x] Portal dashboard enhanced stats endpoint (charts data)

### Frontend - Onboarding Module
- [x] Multi-step onboarding wizard (Personal Info → Employment → Compensation → Documents)
- [x] Self-service invite flow (send link to employee)
- [x] Self-service public form page for employee self-fill
- [x] Onboarding list with status tracking
- [x] Document upload with drag-and-drop
- [x] Visa detection (nationality vs work country)

### Frontend - Employee Detail
- [x] Employee detail page with full profile
- [x] Employee documents tab
- [x] Employee leave balances tab

### Frontend - Payroll Module
- [x] Payroll runs list (approved/locked only)
- [x] Payroll run detail with employee breakdown
- [x] Monthly payroll summary view

### Frontend - Adjustments Module
- [x] Create adjustment dialog with employee selector
- [x] Edit adjustment (submitted only)
- [x] Delete adjustment (submitted only)
- [x] Receipt upload for reimbursements

### Frontend - Leave Module
- [x] Create leave request dialog
- [x] Delete leave request (submitted only)
- [x] Leave balances view per employee
- [x] Public holidays calendar

### Frontend - Finance Module
- [x] Invoice list with type tabs (Monthly/Deposit/Credit Note)
- [x] Invoice detail page with line items
- [x] Credit note display with linked invoices
- [x] Account summary (outstanding, paid, credits)
- [x] PDF download functionality

### Frontend - Dashboard
- [x] Interactive KPI cards with links
- [x] Employee distribution world map
- [x] Monthly payroll trend chart (Recharts)
- [x] Employee status distribution donut chart
- [x] Pending tasks widget
- [x] Recent activity timeline

### Frontend - Settings
- [x] Leave policies management per country
- [x] Team management with role actions
- [x] User deactivation and invite resend

## Bug Fixes - Admin Invoice & Credit Note Issues
- [x] Fix: Credit Note Application History shows 0 amount for associated invoices (was using app.amount instead of app.appliedAmount)
- [x] Fix: PDF invoice "Less: Credit Note" text overlaps with invoice number and currency amount (shortened label to "Less: CN" + truncated long numbers)
- [x] Fix: Invoice live exchange rate tag doesn't auto-refresh when items are selected (added getRealTimeRateReference invalidation to add/update/delete item mutations)

## Bug Fix - Portal Employee List Missing Navigation
- [x] Fix: Portal employee list rows not clickable - no link to employee detail page (added onClick navigation to /portal/employees/:id)

## Bug Fix - Portal Employee Detail 404
- [x] Fix: Portal employee detail page returns 404 when clicking employee row (root cause: top-level wouter route /portal/:rest* only matches single-segment paths, added /portal/:a/:b route to match two-segment paths like /portal/employees/1)

## Bug Fixes - Portal Finance Module
- [x] Fix: Deposit converted to credit note should zero out Total Deposits in account summary (now shows net deposit balance: gross deposits - credit notes from deposits - deposit refunds)
- [x] Fix: Partial payment display for invoice GEAHK-202602-007 (added Partially Paid badge, remaining balance display in list and detail, orange warning box)
- [x] Fix: Invoice preview page display incomplete (fixed dialog layout with flex column, scrollable content area, fixed header)

## Portal Finance Module Redesign
- [x] Replace invoice detail dialog with dedicated detail page (/portal/invoices/:id)
- [x] Create polished invoice detail page with professional layout (header, line items, totals, credit notes, payment status)
- [x] Redesign invoice list page with refined table styling, better spacing, and micro-interactions
- [x] Polish Account Summary tab with improved card design and visual hierarchy
- [x] Add proper routing and back navigation for invoice detail page
- [x] Improve overall Finance module UI/UX consistency and polish

## Portal UX Overhaul - Batch 1
- [x] Fix: New Adjustment date picker - update to match Admin SaaS (shadcn Calendar + Popover)
- [x] Fix: New Leave date picker - update to match Admin SaaS (shadcn Calendar + Popover)
- [x] Fix: Leave Balance not displaying data (verified backend returns data correctly, display depends on employee selection)
- [x] Fix: Invoice action icons not aesthetically pleasing - replaced with Tooltip Eye + Download buttons
- [x] Fix: Allow employee deletion when in pending_review status (frontend + backend)
- [x] Fix: Dashboard map not loading (switched to local JSON file)
- [x] Fix: Dashboard Payroll Cost Trend chart - changed to BarChart
- [x] Fix: Dashboard Action Items too low - moved up in layout

## Portal UX Overhaul - Batch 2

### Invoice Logic Overhaul
- [x] Rename sent → Issued for all invoice types in portal display
- [x] Redesign status color system (green=favorable, yellow=pending, red=urgent, grey=inactive)
- [x] Credit Note color: green when has balance, grey when fully applied
- [x] Replace OUTSTANDING column with Balance Due (proper calculation logic)
- [x] Add History tab (paid/applied/cancelled/void), default hide cancelled/void with toggle
- [x] Partially Paid label + follow-up invoice linking in Related Documents
- [x] Overpaid label + auto-generated credit note linking in Related Documents
- [x] Credit Note detail: show Original Amount / Applied Amount / Remaining Balance + Application History
- [x] Invoice detail: show Credits Applied section (which CNs applied to this invoice)
- [x] Deposit detail: show Related Transactions (credit notes, refunds derived from deposit)
- [x] Related Documents section with bidirectional linking via relatedInvoiceId
- [x] Backend: portal credit note balance endpoint
- [x] Backend: portal related invoices endpoint
- [x] Backend: portal credit applications endpoint
- [x] Align all portal invoice logic with Admin SaaS, comply with accounting standards

### Payroll Optimization
- [x] Country flags + country name displayed first, month selector after
- [x] Support multi-country payroll display
- [x] Click employee to view payslip detail page

### Onboarding Redesign (Liquid Glass)
- [x] Merge Onboarding Requests and Self-Service Invite into unified Employee Onboarding page
- [x] Apple Liquid Glass design style (frosted glass, soft shadows, fluid animations)
- [x] Employer-required fields in Send to Employee flow (salary, leave policy, contract start, job duties)
- [x] Standalone service selection flow (full-screen step wizard)
- [x] Remove duplicate buttons, single unified New Onboarding entry point

## Portal UX Overhaul - Batch 3

### Compliance Hub (Public Holidays → Policy & Compliance Toolkit)
- [x] Create Compliance Hub page as a standalone feature in portal sidebar
- [x] Public Holidays displayed in calendar view with country filter
- [x] Aggregate employer-relevant compliance information

### Language Switching (EN/ZH)
- [x] Create i18n system with EN and ZH language support
- [x] Allow user to select system language from portal UI
- [x] Persist language preference

### Company Information Enhancement
- [x] Make Company Information page more comprehensive
- [x] Legal entity name and settlement currency are read-only (not editable by client)
- [x] Other fields are editable by client

## Portal UX Overhaul - Batch 4

### History Pages
- [x] Payroll History page (existing payroll page already has history tab with year/country filters)
- [x] Adjustment History page (active/history tabs with approval status filters)
- [x] Leave History page (active/history tabs with approval status filters)

### Reimbursement Split & Approval Workflow
- [x] Split Reimbursement out of Adjustments as a standalone module
- [x] Leave approval flow: submitted → client approve/reject → Admin confirm
- [x] Reimbursement approval flow: submitted → client approve/reject → Admin confirm
- [x] Other Adjustments: auto client_approved on creation → Admin confirm
- [x] Admin SaaS: display client approval status (Client Approved / Client Rejected)
- [x] Allow client to create Leave and Reimbursement (no employee portal yet)

## Batch 5 - Improvement Requests

### 1. Approval Status Flow Fix
- [x] Verified: status transitions are correct, admin_approved in History tab is by design (confirmed by user)

### 2. Help Center & Changelog
- [x] Admin Help Center: add changelog/update log (v2.5.0 entry added)
- [x] Portal: add changelog/update log and help center (new PortalHelpCenter page with guides, FAQ, changelog, glossary)

### 3. Payroll Payslip Redesign
- [x] Redesign payslip to clarify gross pay vs reimbursement separation
- [x] Make payslip more intuitive: Earnings → Gross Pay → Deductions → Net Pay → Reimbursements → Total Payout

### 4. Invoice Detail Currency Display
- [x] Show local currency amounts for line items (localAmount displayed in Amount column)
- [x] Show invoice currency (converted) amounts only in subtotal/total
- [x] Ensure all auto-created items display currency code (fallback to invoice currency)

### 5. PDF Invoice Credit Note Simplification
- [x] Simplify credit note display in PDF ("Less: Credit Note Applied" without full ID)

### 6. Adjustment Attachment Optional
- [x] Remove mandatory attachment requirement from adjustments (receiptFileUrl now optional)

### 7. Portal-Admin Field Sync
- [x] Verify all portal employee fields are visible in admin SaaS (added gender, address, city, state, postalCode)
- [x] Verify all portal-submitted data is accessible in admin (portal PORTAL_EMPLOYEE_FIELDS updated)

### 8. Admin Reset Customer Password
- [x] Add admin ability to reset customer portal passwords (resetPassword endpoint + dialog in Customers page)

### 9. Portal Primary Contact Edit Restriction
- [x] Remove client ability to self-modify primary contact in portal settings (fields now read-only with info message)

### 10. Self-Onboarding Status in Admin
- [x] Show self-onboarding invitation status in admin SaaS (Onboarding Invites section in Employees page)
- [x] Show employee self-fill progress/status (status badges: pending/completed/expired/cancelled)
- [x] Add delete button for pending self-onboarding invitations

### Batch 5 Supplementary Items
- [x] Issue 1 confirmed by user: admin_approved in History tab is by design, no change needed
- [x] Portal: Add "Resend Invite" button for employee onboarding invites (regenerates token + extends expiry)
- [x] Portal: Make invite copy button more prominent ("Copy Invite Link" outline button with Link icon)
- [x] Portal: Unify employee detail page design language (consistent InfoRow with icons, labels, hints)
- [x] Portal: Onboarding validation - start date cannot be earlier than today
- [x] Portal: Onboarding validation - lock local currency based on employment country (COUNTRY_CURRENCY_MAP)
- [x] Portal: Onboarding validation - email format, required fields enforcement
- [x] Portal: Fix inconsistent input/select field heights across forms (global CSS portal-content min-height 40px)
- [x] Portal: General UI/UX polish for consistency and usability

## Batch 6 - Bug Fixes & New Features

### 1. Portal Map Loading Fix
- [ ] Investigate why Global Workforce map fails to load on client browser
- [ ] Replace or fix map implementation to prevent loading failures
- [ ] Fix EMP-420011 leave balance showing empty
- [ ] Fix approval prompt on leave balance (no approval workflow for leave balance display)

### 2. Onboarding Incomplete Document Handling
- [x] Add intermediate state for employee onboarding when documents are missing (documents_incomplete status)
- [x] Remind client to upload missing files/documents (banner + upload dialog in portal employee detail)
- [x] Allow client to upload documents in employee documents tab during documents_incomplete state
- [x] Lock document upload permissions once employee enters pending_review (admin takes over)
- [x] Add documents_incomplete to all status filters (admin + portal), dashboards, and status transition maps

### 3. Export Functionality
- [x] Created shared CSV export utility (client/src/lib/csvExport.ts)
- [x] Payroll: Export CSV button on payroll items detail view
- [x] Adjustments: Export CSV button on adjustments list page
- [x] Leave: Export CSV button on leave records list page
- [x] Reimbursements: Export CSV button on reimbursements list page

### 4. Admin Employee Edit Fields Missing
- [x] Add idType, idNumber, probationPeriodDays to Admin Edit Employee dialog (Personal section)
- [x] Add ID Type and ID Number display in employee detail view
- [x] Ensure openEditDialog() initializes these fields from employee data
- [x] Ensure all Portal-submitted fields are editable in Admin

## Batch 6 - Bug Fixes Round 2

- [x] Portal DOB picker only allows 2020+, fixed to allow 1940+ years
- [x] Employee nationality selector now shows all countries (ALL_COUNTRIES list) via scope="all" prop
- [x] Portal onboarding nationality selector uses ALL_COUNTRIES instead of DB-only active countries
- [x] Portal self-onboarding nationality selector uses ALL_COUNTRIES
- [x] Start date validation shows inline error on selection (fieldErrors state + red border)
- [x] Email validation shows inline error on input (red border + error message)
- [x] Contract end date validates not earlier than start date (inline error)
- [x] CSV export buttons now always visible (disabled when no data) in Payroll, Adjustments, Leave, Reimbursements

## Batch 7 - Bug Fixes & New Features

### 1. Portal Credit Notes Issued - Zero Balance Display
- [x] When all credit notes are fully applied, show zero balance and inform client
- [x] Improve Credit Notes Issued display in portal Account Summary (shows remaining balance, subtitle when fully used)

### 2. Portal Global Map Loading Fix
- [x] Investigated: CORS issue with manuscdn.com GeoJSON URL (403 on OPTIONS)
- [x] Uploaded GeoJSON to S3 CDN, rewrote WorldMap with pre-fetch + error handling

### 3. Portal CSV Export
- [x] Add CSV export to Portal Adjustments page
- [x] Add CSV export to Portal Leave page
- [x] Add CSV export to Portal Invoices page
- [x] Add CSV export to Portal Payroll page
- [x] Add CSV export to Portal Reimbursements page

### 4. Invoice Notes Lock After Sent
- [x] After invoice status is sent or later, lock external notes (read-only with amber message)
- [x] Only allow internal notes to be modified after sent status
- [x] Backend validation to prevent external note updates after sent (silently ignores)

## Batch 7B - Advanced Fixes & Design Language Overhaul

### 1. External Notes Lock - Whitelist Approach
- [x] Changed logic from blacklist (blocked after sent/paid/overdue/void) to whitelist (only draft/pending_review allow edit)
- [x] Backend validation prevents external notes updates for non-draft/pending_review statuses
- [x] Frontend UI shows lock icon and disables external notes field for locked statuses
- [x] Internal notes remain editable in all statuses

### 2. Admin Invoices CSV Export
- [x] Added Export CSV button to Admin Invoices list page
- [x] CSV includes: Invoice #, Type, Customer, Issue Date, Due Date, Total, Amount Due, Status, Currency
- [x] Uses proper status labels (not raw enum values)

### 3. Global Status Label Audit & Normalization
- [x] Audited all admin pages (Employees, Invoices, Payroll, Leave, Adjustments, Reimbursements)
- [x] Audited all portal pages (Employees, Invoices, Adjustments, Leave, Payroll, Reimbursements)
- [x] Fixed inconsistent .replace("_", " ") patterns (should be /g flag for all underscores)
- [x] Replaced all .replace patterns with consistent statusLabels objects
- [x] Added void status color to Invoices statusLabels
- [x] Fixed CSV exports to use statusLabels instead of raw status values

### 4. Global Workforce Map Replacement
- [x] Replaced failing GeoJSON-based WorldMap with horizontal bar chart + country cards
- [x] Shows employee count per country with flag emoji
- [x] No external dependencies, no CORS issues
- [x] Graceful empty state when no employees in countries

### 5. Portal Apple Liquid Glass Design Language
- [x] Added comprehensive liquid glass CSS system to index.css:
  - .glass-card (primary card style with blur, backdrop-filter, inset shadow)
  - .glass-card-accent (with colored top edge for KPI cards)
  - .glass-header (for top navigation bar)
  - .glass-pill (for status badges)
  - .glass-sidebar-header (sidebar glass effect)
  - .glass-input (form inputs with glass feel)
  - .glass-row (table row hover effect)
- [x] Updated PortalLayout header with glass effect
- [x] Updated PortalLayout sidebar with glass styling
- [x] Updated PortalLayout nav items with glass active state
- [x] Rewrote PortalDashboard with full liquid glass design:
  - KPI cards with glass-card-accent (colored top edge)
  - Gradient mesh background in portal-content
  - Improved spacing and visual hierarchy
  - Better card hover effects
- [x] Converted all 13 main Portal pages from Card component to glass-card:
  - PortalEmployees, PortalEmployeeDetail, PortalInvoices, PortalInvoiceDetail
  - PortalAdjustments, PortalLeave, PortalPayroll, PortalReimbursements
  - PortalCompliance, PortalHelpCenter, PortalSettings, PortalOnboarding, PortalSelfOnboarding
- [x] Converted auth pages (Login, Register, ForgotPassword, ResetPassword) to glass design
- [x] Removed unused Card component imports from all portal pages
- [x] Fixed duplicate className issue in PortalCompliance.tsx

## Test Coverage Summary
- Total test files: 30
- Total tests passing: 633
- Batch 7B tests: 15+ (External notes lock, Admin Invoices CSV, status labels, WorldMap, liquid glass design)

## Database Backup & GitHub Push
- [x] Export full database as SQL backup file (backup-YYYY-MM-DD.sql)
- [x] Push backup file to GitHub repo under backups/ directory

## Database Seed Script
- [x] Extract all countries_config data from current database
- [x] Extract all leave_types data from current database
- [x] Extract other baseline reference data (billing entities, exchange rate markup, etc.)
- [x] Create seed.mjs script with all baseline data
- [x] Test seed script execution
- [x] Push seed script to GitHub

## Deployment Documentation
- [ ] Write README-DEPLOY.md with full independent deployment guide
- [ ] Push to GitHub

## Deployment Documentation
- [x] Write README-DEPLOY.md with full independent deployment guide
- [x] Push to GitHub

## Sales CRM Bug Fixes
- [x] Fix email validation error when creating new lead (allow empty email)
- [x] Country dropdown should show ALL countries, not just active ones
- [x] Intended Service should be a dropdown multi-select (EOR, Visa EOR, AOR, PEO, Payroll, Consulting)
- [x] Target Countries should be a searchable multi-select component
- [x] Expected Close Date should use the system's unified DatePicker UI

## Sales CRM Bug Fixes (Round 2)
- [x] Fix contactEmail validation still failing with empty string on lead creation (root cause: z.string().email().or() evaluates email first; fixed with z.union([z.literal(""), z.string().email()]))
- [x] Show lead owner/creator in list and detail view (createdBy field + Owner column + InfoRow)
- [x] Fix Status dropdown not showing in edit form (i18n keys mismatched: old keys replaced with pipeline status keys)

## Vendor & P&L Navigation Name Fix
- [x] Fix sidebar nav showing raw i18n keys: nav.vendors, nav.vendor_bills, nav.cost_allocation, nav.profit_loss, NAV.REPORTS
- [x] Restore light theme (system changed from light to dark after vendor merge)

## Vendor Bills - Upload & AI Analysis
- [ ] Add direct bill upload button/area on Vendor Bills page
- [ ] Integrate AI analysis to auto-parse uploaded bill PDFs/images
- [ ] Show AI-parsed results (vendor, amount, date, line items) for user confirmation
- [ ] Auto-fill bill creation form with AI-parsed data
- [x] AI parse invoice should auto-create or match Vendor when vendor does not exist
- [x] Fix Vendor Bills page date format to use global date format scheme instead of yyyy-mm-dd
- [x] Fix vendor_bill_items insert error: vendorBillId not passed correctly when creating bill from AI parse

## Vendor Management Simplification
- [ ] Add vendor type field (client_related / operational) to vendors table + migration
- [ ] Update vendor backend routes to support type field
- [ ] Update Vendors page UI with type label/filter
- [ ] Refactor VendorBills detail page to integrate cost allocation inline
- [ ] Remove standalone Cost Allocation page and Bank POP feature
- [ ] Update sidebar navigation (remove Cost Allocation, keep Vendors + Vendor Bills + P&L)
- [ ] Smart form: show/hide client/employee/invoice fields based on vendor type

## Multi-file AI Upload Refactor
- [ ] Backend: New multi-file AI parse API with system data context (employees, invoices, vendors)
- [ ] Backend: Cross-validation logic (invoice vs POP amounts, line item totals)
- [ ] Backend: Auto cost allocation suggestions (match line items to employees + invoices)
- [ ] Frontend: Multi-file upload dialog with guidance prompts ("upload files for ONE vendor")
- [ ] Frontend: File type auto-detection labels (Invoice/POP/Statement/Other)
- [ ] Frontend: AI Review dialog with confidence indicators (green/amber/red)
- [ ] Frontend: Cross-validation results display
- [ ] Frontend: Editable cost allocation suggestions table
- [ ] Frontend: One-click confirm to create Bill + Items + Allocations

## Seed Data Migration
- [ ] Pull seed-migration-data.json and SEED_MIGRATION_README.md from GitHub
- [ ] Clear all test data EXCEPT CUS-330021 and its related data
- [ ] Import real customer, employee, and deposit data from seed file

## Exchange Rate Precision Fix
- [x] Audit all decimal fields for exchange rates across all tables
- [x] Fix exchange_rates table rate field precision for high-rate currencies (IDR/IRR/LAK/VND)
- [x] Fix any other tables with exchange rate decimal precision issues

## UI/UX Improvements Round (7 Items)
- [x] Move P&L Report link to Dashboard Finance tab + remove Reports sidebar group
- [x] Add Approve/Reject buttons to Vendor Bill detail page (approval workflow)
- [x] Fix upload dialog file name overflow causing UI deformation
- [x] Fix New Allocation employee dropdown showing no data (data shape mismatch)
- [x] Fix New Allocation invoice dropdown filtering (exclude credit notes, deposit refunds; filter by status)
- [x] Review P&L Total Revenue calculation accuracy (deposit handling, data source)
- [x] Move Billing Entities and Audit Logs to Settings page as tabs

## Accounting Logic Improvements (Audit Report)
- [x] Defensive: Add credit_note to revenue query exclusion list (all 4 queries)
- [x] Guard: Block updateStatus from marking credit_note/deposit_refund as paid
- [x] UI: Annotate Dashboard Finance chart with "按收款日期 (Cash Basis)" label
- [x] UI: Annotate P&L Report chart with "按服务月份 (Accrual Basis)" label
- [x] Allocation: Exclude deposit-type invoices from allocation invoice dropdown
- [x] Allocation: For deposit with applied credit note, prevent allocation
- [x] Vendor Bill: Add billType field (operational/deposit/deposit_refund) to schema
- [x] Vendor Bill: AI auto-detect billType during upload parsing
- [x] Allocation: When vendor bill is deposit type, only allow allocating to deposit invoices

## Production Data Cleanup
- [x] Audit and identify all test data in production database
- [x] Clean up test data following hotfix-governance procedures

## Subdomain-based Portal Routing
- [x] Design subdomain routing architecture (admin.geahr.com vs app.geahr.com)
- [x] Create portalBasePath utility for dynamic path resolution
- [x] Update App.tsx Router with subdomain detection (isPortalDomain → PortalRouter at root)
- [x] Update all portal page links to use portalPath() (40+ references)
- [x] Fix duplicate imports from sed batch replacements
- [x] Update server-side URL construction (reset password, invite links)
- [x] Maintain /portal/* path-based fallback for dev and manus.space
- [x] Update invite link generation in Customers.tsx to use app.geahr.com
- [x] Write and pass 18 vitest tests for subdomain routing logic
- [ ] Configure domain bindings in Manus Settings (user action required)

## Vendor Bills Upload Dialog Overflow Fixes
- [x] Fix file name overflow in upload dialog (long file names break layout)
- [x] Fix parsed content overflow when AI analysis results are too long

- [x] Investigate Customer #1 test data in invoices (not visible in customers list)
- [x] Clean up Customer #1 related test invoices from production database
- [x] Fix Upload & AI Parse dialog responsive/adaptive sizing

## Admin User Management - Reset Password
- [ ] Add admin reset password backend endpoint (generate temp password or send reset link)
- [ ] Add reset password button/dialog in Settings > Users Management UI
- [ ] Write vitest tests for reset password functionality

## Test Data Cleanup Skill
- [x] Create test-data-cleanup skill to enforce test data cleanup after every vitest run
- [x] Clean up any existing test data left in production database from previous test runs

## Admin User Management - Reset Password
- [x] Add admin reset password backend endpoint (generate temp password)
- [x] Add reset password button/dialog in Settings > Users Management UI
- [x] Write vitest tests for reset password functionality (with proper cleanup)

## VendorBills JSX Fix
- [x] Fix Adjacent JSX elements error at line 477 in VendorBills.tsx (already resolved in previous server restart)

## Delete Admin Portal Users
- [x] Delete 6 users: yaolong.chen@bestgea.com, colin.len@bestgea.com, luna.zhao@bestgea.com, aolu11@qq.com, jimmer.gao@gmail.com, ziqing.ding1122@gmail.com
- [x] (soft delete above) - now physically delete these 6 OAuth users so they can be re-invited with password login

## Garbage Data Cleanup (again)
- [x] Scan all tables for test/garbage data and clean up

## XSS Test Data Cleanup
- [x] Investigate and clean up XSS test customers (<script>alert("xss")</script>)
- [x] Check and clean up any cascade-related data (none found - no employees/invoices linked)

## Seed Migration Data Import
- [x] Pull seed-migration-data.json and SEED_MIGRATION_README.md from GitHub
- [x] Execute data import following the README order
- [x] Verify imported data integrity

## Deposit Refund Feature
- [x] Investigate current paid deposit invoice actions (credit note only)
- [x] Add backend endpoint for creating deposit refund from paid deposit invoice (already existed)
- [x] Update frontend to show both "Convert to Credit Note" and "Convert to Refund" for paid deposit invoices
- [x] Write tests for deposit refund functionality (5 tests passing, 0 test data residue)

## Pagination for Customers & Employees
- [x] Add pagination controls to Customers list page
- [x] Add pagination controls to Employees list page

## Auto-Initialize Leave Policy on Employee Creation
- [x] When creating an employee, auto-initialize leave balances from the employee's country leave types (already implemented in employees.create endpoint)

## Standard Leave Types for Puerto Rico and United States
- [x] Add 7 standard leave types for Puerto Rico (annual leave 7 days, others 0)
- [x] Add 7 standard leave types for United States (annual leave 7 days, others 0)

## Batch Update Country Service Fees and Activation
- [x] Set EOR $249, Visa EOR $599, Visa one-time $5000 for: CN, HK, JP, KR, TH, MY, SG, VN, ID, PH, IN, US, CA
- [x] Set EOR $449, Visa EOR $699, Visa one-time $5000 for all other countries
- [x] Set AOR $249 for all countries
- [x] Activate all 126 countries

## Invoice Pagination
- [x] Add pagination controls to Invoices list page (same pattern as Customers/Employees)

## Global Filter Page Reset
- [x] Ensure all list pages reset to page 1 when any filter changes (Customers, Employees, Invoices)

## Detail Page Back Navigation
- [x] When navigating from list to detail, preserve current page number
- [x] When clicking back from detail page, return to the same page in the list

## Invoice Detail Bug Fix
- [x] Fix "An unexpected error occurred" when clicking invoice detail page (hooks ordering violation)

## VAT Settings Update
- [x] Set VAT applicable = false for all countries except VN and THH

## Admin Access to Client Portal
- [x] Add one-click button for admin to access customer's Client Portal

## Email Notification Investigation
- [x] Investigate current email notification system and identify what triggers emails
- [x] Provide options/proposal for controlling notifications

## Fix Detail Page Back Navigation (Page Preservation Bug)
- [x] Fix Customers page: initialize page from URL, skip filter reset on initial mount
- [x] Fix Employees page: same fix applied
- [x] Fix Invoices page: same fix applied

## Project Documentation Overhaul
- [x] Rewrite README.md (professional, comprehensive, developer-friendly)
- [x] Create CHANGELOG.md (structured release history)
- [x] Update docs/PRODUCT.md (latest features and architecture)
- [x] Update docs/development-workflow.md, test-plan.md, client-portal-spec.md, rbac-matrix.md
- [x] Clean up obsolete docs (remove round-specific proposals, test notes, temp files)
- [x] Sync to GitHub

## AI Agent Knowledge Base Architecture
- [x] Design knowledge base hierarchy and document structure
- [x] Write AGENTS.md (AI Agent entry point and onboarding guide)
- [x] Write CONVENTIONS.md (coding standards, patterns, anti-patterns)
- [x] Write BUSINESS-RULES.md (core business logic and domain rules)
- [x] Write ARCHITECTURE.md (system architecture and data flow)
- [x] Write TESTING.md (test strategy, data management, cleanup rules)
- [x] Update project instructions for new task onboarding
- [x] Sync to GitHub

## AI Agent Onboarding Enhancements
- [x] Update Project Instructions (template saved in docs/PROJECT-INSTRUCTIONS.md)
- [x] Create gea-eor-knowledge Manus Skill (SKILL.md + 5 reference files, validated)
- [x] Add document update mechanism (docs/DOC-UPDATE-GUIDE.md with version tracking, sync rules, checklist)
- [x] Sync to GitHub

## Production Test Data Cleanup
- [x] Audit all database tables for test data pollution
- [x] Clean up 8 test customer records (IDs 900002-900028, no linked data)
- [x] Verify cleanup completeness — 31 real customers intact, 0 test data remaining
- [x] Strengthen test cleanup rules in TESTING.md and AGENTS.md (Sections 9-10 added, Rule 6 rewritten)

## Domain Name Update
- [x] Replace all bestgea.manus.space references with admin.geahr.com / app.geahr.com (AGENTS.md, README.md, ARCHITECTURE.md, PROJECT-INSTRUCTIONS.md, SKILL.md, subdomain-routing.test.ts)
- [x] Check hotfix-governance Skill — no domain references found, no update needed
- [x] Sync to GitHub

## Code Audit Fix — P0 (Immediate)
- [x] Delete unused pages: ComponentShowcase.tsx, InvoiceManagement.tsx, PayrollManagement.tsx
- [x] Delete unused components: ManusDialog.tsx, PageTransition.tsx
- [x] Delete unused pages: ExchangeRates.tsx, UserManagement.tsx, Home.tsx
- [x] Delete SEED_MIGRATION_README.md (had git conflict markers)
- [x] Delete unreferenced seed-data.json (796KB)

## Code Audit Fix — P1 (Short-term)
- [x] Replace 48 throw new Error with TRPCError in leave.ts, reimbursements.ts, adjustments.ts, employees.ts, payroll.ts
- [x] Unify formatCurrency/formatDate — remove local definitions in Portal pages and Dashboard
- [x] Clean up 13 one-time .mjs scripts (deleted)
- [x] Delete README-DEPLOY.md (outdated) and backup-orphan-invoices-20260228.json
- [x] systemSettings table — confirmed empty but actively used by Settings page, PayrollCycleIndicator, and tests — KEEP
- [x] Update seedAdmin.ts and AdminLogin.tsx to use geahr.com domain

## Code Audit Fix — P2 (Medium-term)
- [ ] Refactor db.ts (2238 lines) into domain modules (deferred — large refactor, low risk)
- [ ] Refactor oversized frontend pages into sub-components (deferred — large refactor, low risk)
- [x] Remove 13 unused db.ts export functions (getUserByOpenId, listPublicHolidays, listPublicHolidaysByYear, createPublicHoliday, deletePublicHolidaysByCountryYear, getCustomerLeavePolicyById, carryOverLeaveBalances, getLatestExchangeRate, createExchangeRate, listExchangeRates, getDistinctPayrollMonths, deleteVendorBillItems, listAllocationsByEmployee) — upsertUser kept (still used by auth)
- [x] Remove frontend console.log statements (1 debug log in ProfitLossReport.tsx)
- [x] Delete seed-migration-data.json (237KB, no longer referenced)
- [x] Delete backups/ directory (one-time SQL backup)
- [x] Update .gitignore with backup/seed patterns

## Code Audit Fix — P3 (Long-term)
- [x] Supplement drizzle/relations.ts (33 tables, 10 domain groups, all FK relationships defined)
- [ ] Extract shared Admin/Portal business logic to services layer (deferred — large architectural change)
- [x] i18n coverage scan: Admin has 492 keys (contexts/i18n.tsx), Portal has 378 keys (lib/i18n.ts). 6 admin pages + 2 portal pages use i18n. Remaining pages use hardcoded English strings. Full i18n migration deferred as low-priority.

## i18n 全量覆盖
- [ ] Admin pages: Customers.tsx
- [ ] Admin pages: Employees.tsx
- [ ] Admin pages: Countries.tsx
- [ ] Admin pages: Settings.tsx
- [ ] Admin pages: Invoices.tsx
- [ ] Admin pages: Payroll.tsx
- [ ] Admin pages: Adjustments.tsx
- [ ] Admin pages: Reimbursements.tsx
- [ ] Admin pages: Leave.tsx
- [ ] Admin pages: Vendors.tsx
- [ ] Admin pages: VendorBills.tsx
- [ ] Admin pages: ProfitLossReport.tsx
- [ ] Admin pages: AdminLogin.tsx
- [ ] Admin pages: AdminInvite.tsx
- [ ] Admin pages: NotFound.tsx
- [ ] Portal pages: PortalDashboard.tsx
- [ ] Portal pages: PortalEmployees.tsx
- [ ] Portal pages: PortalEmployeeDetail.tsx
- [ ] Portal pages: PortalInvoices.tsx
- [ ] Portal pages: PortalInvoiceDetail.tsx
- [ ] Portal pages: PortalPayroll.tsx
- [ ] Portal pages: PortalAdjustments.tsx
- [ ] Portal pages: PortalLeave.tsx
- [ ] Portal pages: PortalReimbursements.tsx
- [ ] Portal pages: PortalCompliance.tsx
- [ ] Portal pages: PortalSettings.tsx
- [ ] Portal pages: PortalOnboarding.tsx
- [ ] Portal pages: PortalSelfOnboarding.tsx
- [ ] Portal pages: PortalLogin.tsx
- [ ] Portal pages: PortalRegister.tsx
- [ ] Portal pages: PortalForgotPassword.tsx
- [ ] Portal pages: PortalResetPassword.tsx

## Knowledge Base（Client Portal）
- [x] 新增统一 Knowledge Base 入口（合并 Help Center + Compliance Hub）
- [x] 新增 Portal Knowledge Base API（个性化内容流 + 邮件营销接口预留）
- [x] 新增 Knowledge Base 页面（文章/提醒/指南 + 搜索与筛选）
- [x] 更新 Portal 侧边栏导航，仅保留单一 Knowledge Base 入口
- [x] 补齐 EN/ZH i18n 文案

## Knowledge Base AI升级（抓取+审核+生成）
- [x] 设计并实现AI内容处理服务（抓取内容归纳、生成文章草稿）
- [x] 设计并实现AI数据源权威性审核（authority score + reason）
- [x] 将AI处理接入admin抓取流程，并推送待审核队列
- [x] 在Admin知识审核页展示AI结果与来源权威性
- [x] 补齐相关i18n文案并完成类型检查

## AI Provider Decoupling（全局可切换）
- [x] 新增AI Provider与Task Policy数据库模型
- [x] 新增AI Gateway（按任务路由不同Provider）
- [x] 新增Admin AI设置入口（Provider/Task Policy可调）
- [x] 将Knowledge Base与Vendor Bill解析接入AI Gateway
- [x] 输出i18n全量审计报告（Admin+Portal）

## Security & Consistency Hardening（2026-03-02）
- [x] 统一汇总历史改动并产出非技术可读审查报告
- [x] 加固默认管理员引导方案（保留可登录能力但降低生产风险）
- [x] 增加安全响应头（Helmet）并完成验证
- [x] 增加登录限流（Admin/Portal）并完成验证
- [x] 提供Client Portal Knowledge Base预览截图

## Quality Follow-up（2026-03-02 第二轮）
- [x] 强化Portal登录限流器（增加清理机制，避免内存增长）
- [x] 增加i18n硬编码扫描脚本并输出真实审计报告
- [x] 统一修复低风险代码风格问题并重新验证

## Portal Self Onboarding UX Follow-up（2026-03-03）
- [x] PortalSelfOnboarding：补齐页面内遗留硬编码文案并统一到i18n
- [x] PortalSelfOnboarding：优化移动端步骤条与底部操作区布局

## Portal/Knowledge/AI Optimization Proposal（2026-03-03）
- [x] 输出Portal/Knowledge/AI流程优化建议文档（含优先级、KPI、落地顺序）

## P0 Implementation（Portal/Knowledge/AI，2026-03-03）
- [x] P0-1 Knowledge内容质量闸门：新增freshness/duplication评分并在审核端展示
- [x] P0-2 Portal搜索反馈闭环：新增无帮助反馈采集与Admin内容缺口看板
- [x] P0-3 AI调用观测标准化：新增AI调用遥测与AI Settings健康度卡片

- [x] 输出系统级调优方案（产品/应用/数据AI/运维安全/工程效率全链路）

## UX Copy Clarity Audit（2026-03-03）
- [x] 全面审计Admin/Client Portal关键文案并修复AI Settings等易歧义描述

## UX Copy Version3 Rollout（2026-03-03）
- [x] 采用Version3文案标准，统一优化Admin与Client Portal关键描述

## PR Visibility Follow-up（2026-03-03）
- [x] 发布Version3文案落地变更并补充CHANGELOG记录，便于PR可见性追踪

## Bugfix Follow-up（2026-03-03）
- [x] 修复AI网关模型选择与策略参数未生效问题（model/maxTokens/temperature）
- [x] 修复Portal知识筛选遗漏general主题导致内容不可见

## i18n Full Rollout Execution（2026-03-03）
- [x] Portal Auth 页面（Login/Register/ForgotPassword/ResetPassword）页面清零完成
- [x] P0 范围大页面（Invoices/Employees/Customers/PortalOnboarding/VendorBills）可见文案收口完成
- [x] 重新扫描基线：潜在项 7456，影响文件 41（已刷新报告）

## i18n Sprint Batch A（2026-03-03）
- [x] 完成 PortalAuth 四页（Login/Register/Forgot/Reset）可见文案 i18n 收口
- [x] 重新跑硬编码审计并更新基线数字

## i18n Sprint Batch B（2026-03-03）
- [x] Invoices.tsx：Invoice Generation Panel 核心可见文案替换为 i18n key
- [x] Invoices.tsx：详情页/列表页剩余硬编码继续清理（已完成Generation Panel+Precheck/Dialog+列表分页/导出/筛选主要文案+详情区关键操作文案）
- [x] Employees.tsx / Customers.tsx / PortalOnboarding.tsx / VendorBills.tsx 收口
