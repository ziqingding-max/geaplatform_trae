# EOR SaaS Admin — 数据字典 (Data Object Dictionary)

> **版本**: v1.0 | **更新日期**: 2026-02-25 | **数据库**: MySQL (TiDB) | **ORM**: Drizzle

本文档定义了系统中所有数据表的结构、字段含义、枚举值域以及表间关系。

---

## 1. 总览

系统共包含 **23 张表**，按业务域分为 10 个模块：

| 模块 | 表名 | 说明 |
|------|------|------|
| 认证与授权 | `users` | 系统用户（管理员、各角色） |
| 国家配置 | `countries_config`, `system_config`, `leave_types` | 国家法规、全局设置、假期类型 |
| 客户管理 | `customers`, `customer_contacts`, `customer_pricing`, `customer_contracts`, `customer_leave_policies` | 客户主数据及关联配置 |
| 员工管理 | `employees`, `employee_contracts`, `employee_documents` | 员工档案、合同、文件 |
| 假期管理 | `leave_balances`, `leave_records` | 假期余额与请假记录 |
| 异动薪酬 | `adjustments` | 奖金、津贴、报销、扣款 |
| 薪酬发放 | `payroll_runs`, `payroll_items` | 月度薪酬批次与明细 |
| 发票管理 | `invoices`, `invoice_items` | 客户账单与行项目 |
| 系统管理 | `exchange_rates`, `audit_logs`, `system_settings` | 汇率、审计日志、系统设置 |
| 账单主体 | `billing_entities` | 开票法律实体 |

---

## 2. 表间关系图（文字版）

```
billing_entities (1) ──── (N) customers
customers (1) ──── (N) employees
customers (1) ──── (N) customer_contacts
customers (1) ──── (N) customer_pricing
customers (1) ──── (N) customer_contracts
customers (1) ──── (N) customer_leave_policies
customers (1) ──── (N) invoices

employees (1) ──── (N) employee_contracts
employees (1) ──── (N) employee_documents
employees (1) ──── (N) leave_balances
employees (1) ──── (N) leave_records
employees (1) ──── (N) adjustments
employees (1) ──── (N) payroll_items

countries_config (1) ──── (N) leave_types
countries_config (1) ──── (N) payroll_runs (via countryCode)

payroll_runs (1) ──── (N) payroll_items

invoices (1) ──── (N) invoice_items
```

---

## 3. 详细表定义

### 3.1 `users` — 系统用户

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| openId | VARCHAR(64) | UNIQUE | — | Manus OAuth 唯一标识 |
| name | TEXT | 否 | NULL | 用户显示名 |
| email | VARCHAR(320) | UNIQUE | NULL | 邮箱 |
| loginMethod | VARCHAR(64) | 否 | NULL | 登录方式 |
| role | ENUM | 是 | `user` | 角色：`admin`, `customer_manager`, `operations_manager`, `finance_manager`, `user` |
| language | VARCHAR(10) | 是 | `en` | 界面语言偏好 |
| isActive | BOOLEAN | 是 | true | 是否启用 |
| createdAt | TIMESTAMP | 是 | NOW() | 创建时间 |
| updatedAt | TIMESTAMP | 是 | NOW() | 更新时间（自动） |
| lastSignedIn | TIMESTAMP | 是 | NOW() | 最后登录时间 |

**索引**: `email_idx(email)`, `role_idx(role)`

---

### 3.2 `countries_config` — 国家配置

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| countryCode | VARCHAR(3) | UNIQUE | — | ISO 3166-1 alpha-2 国家代码 |
| countryName | VARCHAR(100) | 是 | — | 国家名称 |
| localCurrency | VARCHAR(3) | 是 | — | ISO 4217 法定货币代码 |
| payrollCycle | ENUM | 是 | `monthly` | 发薪周期：`monthly`, `semi_monthly` |
| probationPeriodDays | INT | 否 | 90 | 试用期天数 |
| noticePeriodDays | INT | 否 | 30 | 通知期天数 |
| workingDaysPerWeek | INT | 否 | 5 | 每周工作天数 |
| statutoryAnnualLeave | INT | 否 | 14 | 法定年假天数 |
| standardEorRate | DECIMAL(15,2) | 否 | NULL | EOR 标准服务费（/人/月） |
| standardVisaEorRate | DECIMAL(15,2) | 否 | NULL | Visa EOR 标准服务费 |
| standardAorRate | DECIMAL(15,2) | 否 | NULL | AOR 标准服务费 |
| visaEorSetupFee | DECIMAL(15,2) | 否 | NULL | Visa EOR 一次性设置费 |
| standardRateCurrency | VARCHAR(3) | 否 | `USD` | 标准费率货币 |
| vatApplicable | BOOLEAN | 是 | false | 是否适用 VAT |
| vatRate | DECIMAL(5,2) | 否 | `0` | VAT 税率（百分比，如 9.00 = 9%） |
| isActive | BOOLEAN | 是 | false | 是否激活（有服务费 = 激活） |
| notes | TEXT | 否 | NULL | 备注 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**索引**: `country_code_idx(countryCode)` UNIQUE

**业务规则**: 当 `standardEorRate`、`standardVisaEorRate`、`standardAorRate` 中任一非空时，`isActive` 自动设为 true。

---

### 3.3 `system_config` — 全局系统配置

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| configKey | VARCHAR(100) | UNIQUE | — | 配置键名 |
| configValue | TEXT | 是 | — | 配置值 |
| description | TEXT | 否 | NULL | 描述 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**已使用的配置键**: `payroll_cutoff_day`（薪酬截止日，默认4）, `payroll_auto_create`（是否自动创建薪酬批次）, `employee_activation_rule`（员工自动激活规则）

---

### 3.4 `leave_types` — 假期类型（按国家）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| countryCode | VARCHAR(3) | 是 | — | 所属国家 |
| leaveTypeName | VARCHAR(100) | 是 | — | 假期名称（如 Annual Leave, Sick Leave） |
| annualEntitlement | INT | 否 | 0 | 法定年度天数 |
| isPaid | BOOLEAN | 是 | true | 是否带薪 |
| requiresApproval | BOOLEAN | 是 | true | 是否需要审批 |
| description | TEXT | 否 | NULL | 描述 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**索引**: `country_code_idx(countryCode)`

**数据量**: 系统预置 130 个国家的 881 条假期类型记录。

---

### 3.5 `customers` — 客户

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| clientCode | VARCHAR(20) | UNIQUE | — | 自动生成：CUS-0001 |
| companyName | VARCHAR(255) | 是 | — | 公司名称 |
| legalEntityName | VARCHAR(255) | 否 | NULL | 法律实体名称 |
| registrationNumber | VARCHAR(100) | 否 | NULL | 注册号 |
| industry | VARCHAR(100) | 否 | NULL | 行业 |
| address | TEXT | 否 | NULL | 地址 |
| city | VARCHAR(100) | 否 | NULL | 城市 |
| state | VARCHAR(100) | 否 | NULL | 州/省 |
| country | VARCHAR(100) | 是 | — | 注册国家 |
| postalCode | VARCHAR(20) | 否 | NULL | 邮编 |
| primaryContactName | VARCHAR(255) | 否 | NULL | 主要联系人 |
| primaryContactEmail | VARCHAR(320) | 否 | NULL | 联系邮箱 |
| primaryContactPhone | VARCHAR(20) | 否 | NULL | 联系电话 |
| billingCycle | ENUM | 是 | `monthly` | 账单周期：`monthly`, `quarterly`, `annual` |
| settlementCurrency | VARCHAR(3) | 是 | `USD` | 结算货币 |
| language | ENUM | 是 | `en` | 发票语言：`en`, `zh` |
| billingEntityId | INT | 否 | NULL | 关联的账单主体 FK → `billing_entities.id` |
| depositMultiplier | INT | 是 | 2 | 押金倍数 = (baseSalary + estEmployerCost) × multiplier |
| status | ENUM | 是 | `active` | 状态：`active`, `suspended`, `terminated` |
| notes | TEXT | 否 | NULL | 备注 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**索引**: `company_name_idx`, `country_idx`, `status_idx`

---

### 3.6 `customer_contacts` — 客户联系人

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| customerId | INT | 是 | — | FK → `customers.id` |
| contactName | VARCHAR(255) | 是 | — | 联系人姓名 |
| email | VARCHAR(320) | 是 | — | 邮箱 |
| phone | VARCHAR(20) | 否 | NULL | 电话 |
| role | VARCHAR(100) | 否 | NULL | 职位/角色 |
| isPrimary | BOOLEAN | 是 | false | 是否主要联系人 |
| hasPortalAccess | BOOLEAN | 是 | false | 是否有门户访问权限 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

---

### 3.7 `customer_pricing` — 客户定价

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| customerId | INT | 是 | — | FK → `customers.id` |
| pricingType | ENUM | 是 | — | `global_discount`（全局折扣）或 `country_specific`（国家特定价格） |
| globalDiscountPercent | DECIMAL(5,2) | 否 | NULL | 全局折扣百分比（如 10 = 10% off） |
| countryCode | VARCHAR(3) | 否 | NULL | 适用国家（仅 country_specific） |
| serviceType | ENUM | 否 | NULL | 服务类型：`eor`, `visa_eor`, `aor` |
| fixedPrice | DECIMAL(15,2) | 否 | NULL | 固定价格（仅 country_specific） |
| currency | VARCHAR(3) | 否 | `USD` | 价格货币 |
| effectiveFrom | DATE | 是 | — | 生效日期 |
| effectiveTo | DATE | 否 | NULL | 失效日期 |
| isActive | BOOLEAN | 是 | true | 是否激活 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**定价优先级**: `country_specific` > `global_discount` > 国家标准费率。创建新定价时自动停用同类旧定价。

---

### 3.8 `customer_contracts` — 客户合同

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| customerId | INT | 是 | — | FK → `customers.id` |
| contractName | VARCHAR(255) | 是 | — | 合同名称 |
| contractType | VARCHAR(100) | 否 | NULL | 合同类型 |
| fileUrl | TEXT | 否 | NULL | S3 文件 URL |
| fileKey | VARCHAR(500) | 否 | NULL | S3 文件 Key |
| signedDate | DATE | 否 | NULL | 签署日期 |
| effectiveDate | DATE | 否 | NULL | 生效日期 |
| expiryDate | DATE | 否 | NULL | 到期日期 |
| status | ENUM | 是 | `draft` | 状态：`draft`, `signed`, `expired`, `terminated` |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

---

### 3.9 `customer_leave_policies` — 客户假期政策

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| customerId | INT | 是 | — | FK → `customers.id` |
| countryCode | VARCHAR(3) | 是 | — | 适用国家 |
| leaveTypeId | INT | 是 | — | FK → `leave_types.id` |
| annualEntitlement | INT | 是 | — | 年度天数（≥ 法定最低值） |
| expiryRule | ENUM | 是 | `year_end` | 过期规则：`year_end`, `anniversary`, `no_expiry` |
| carryOverDays | INT | 是 | 0 | 可结转天数（0 = 不结转） |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**业务规则**: 可从国家法定假期一键初始化，也可自定义。`annualEntitlement` 不得低于法定最低值。

---

### 3.10 `employees` — 员工

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| employeeCode | VARCHAR(20) | UNIQUE | — | 自动生成：EMP-0001 |
| customerId | INT | 是 | — | FK → `customers.id` |
| firstName | VARCHAR(100) | 是 | — | 名 |
| lastName | VARCHAR(100) | 是 | — | 姓 |
| email | VARCHAR(320) | 是 | — | 邮箱 |
| phone | VARCHAR(20) | 否 | NULL | 电话 |
| dateOfBirth | DATE | 否 | NULL | 出生日期 |
| gender | ENUM | 否 | NULL | `male`, `female`, `other`, `prefer_not_to_say` |
| nationality | VARCHAR(100) | 否 | NULL | 国籍 |
| idNumber | VARCHAR(100) | 否 | NULL | 证件号码 |
| idType | VARCHAR(50) | 否 | NULL | 证件类型 |
| address | TEXT | 否 | NULL | 地址 |
| city | VARCHAR(100) | 否 | NULL | 城市 |
| state | VARCHAR(100) | 否 | NULL | 州/省 |
| country | VARCHAR(100) | 是 | — | **雇佣国家**（决定法定货币、薪酬批次归属） |
| postalCode | VARCHAR(20) | 否 | NULL | 邮编 |
| department | VARCHAR(100) | 否 | NULL | 部门 |
| jobTitle | VARCHAR(255) | 是 | — | 职位 |
| serviceType | ENUM | 是 | `eor` | 服务类型：`eor`, `visa_eor`, `aor` |
| employmentType | ENUM | 是 | `long_term` | 雇佣类型：`fixed_term`, `long_term` |
| startDate | DATE | 是 | — | 入职日期 |
| endDate | DATE | 否 | NULL | 合同结束日期 |
| status | ENUM | 是 | `pending_review` | 生命周期状态（见下方状态流转图） |
| baseSalary | DECIMAL(15,2) | 是 | — | 基本工资（当地法定货币） |
| salaryCurrency | VARCHAR(3) | 是 | `USD` | 工资货币（自动从 country 的 localCurrency 设定） |
| estimatedEmployerCost | DECIMAL(15,2) | 否 | `0` | 预估雇主成本（用于押金计算） |
| requiresVisa | BOOLEAN | 是 | false | 是否需要签证（nationality ≠ country 时自动设为 true） |
| visaStatus | ENUM | 否 | `not_required` | 签证状态 |
| visaExpiryDate | DATE | 否 | NULL | 签证到期日 |
| visaNotes | TEXT | 否 | NULL | 签证备注 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**员工状态流转**:
```
pending_review → onboarding → contract_signed → active ⇄ on_leave
                                                   ↓
                                              offboarding → terminated
```

**自动化规则**:
- `contract_signed` → `active`：每日 00:01 北京时间，当 startDate ≤ 今天时自动激活
- `active` → `on_leave`：当假期记录 startDate ≤ 今天时自动切换
- `on_leave` → `active`：当假期记录 endDate < 今天时自动恢复

---

### 3.11 `employee_contracts` — 员工合同

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| employeeId | INT | 是 | — | FK → `employees.id` |
| contractType | VARCHAR(100) | 否 | NULL | 合同类型 |
| fileUrl | TEXT | 否 | NULL | S3 文件 URL |
| fileKey | VARCHAR(500) | 否 | NULL | S3 文件 Key |
| signedDate | DATE | 否 | NULL | 签署日期 |
| effectiveDate | DATE | 否 | NULL | 生效日期 |
| expiryDate | DATE | 否 | NULL | 到期日期 |
| status | ENUM | 是 | `draft` | 状态：`draft`, `signed`, `expired`, `terminated` |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

---

### 3.12 `employee_documents` — 员工文件

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| employeeId | INT | 是 | — | FK → `employees.id` |
| documentType | ENUM | 是 | — | `resume`, `passport`, `national_id`, `work_permit`, `visa`, `contract`, `education`, `other` |
| documentName | VARCHAR(255) | 是 | — | 文件名 |
| fileUrl | TEXT | 是 | — | S3 文件 URL |
| fileKey | VARCHAR(500) | 是 | — | S3 文件 Key |
| mimeType | VARCHAR(100) | 否 | NULL | MIME 类型 |
| fileSize | INT | 否 | NULL | 文件大小（字节） |
| notes | TEXT | 否 | NULL | 备注 |
| uploadedAt | TIMESTAMP | 是 | NOW() | 上传时间 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

---

### 3.13 `leave_balances` — 假期余额

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| employeeId | INT | 是 | — | FK → `employees.id` |
| leaveTypeId | INT | 是 | — | FK → `leave_types.id` |
| year | INT | 是 | — | 年度 |
| totalEntitlement | INT | 是 | — | 总天数（来自客户假期政策） |
| used | INT | 是 | 0 | 已使用天数（从 leave_records 自动计算） |
| remaining | INT | 是 | — | 剩余天数 = totalEntitlement - used |
| expiryDate | DATE | 否 | NULL | 过期日期 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**业务规则**: `used` 字段由系统从 `leave_records` 自动计算，不可手动编辑。

---

### 3.14 `leave_records` — 请假记录

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| employeeId | INT | 是 | — | FK → `employees.id` |
| leaveTypeId | INT | 是 | — | FK → `leave_types.id` |
| startDate | DATE | 是 | — | 开始日期 |
| endDate | DATE | 是 | — | 结束日期 |
| days | DECIMAL(4,1) | 是 | — | 天数（支持半天：0.5） |
| status | ENUM | 是 | `submitted` | `submitted`（可编辑）, `locked`（薪酬截止后锁定） |
| reason | TEXT | 否 | NULL | 请假原因 |
| submittedBy | INT | 否 | NULL | 提交人 FK → `users.id` |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

---

### 3.15 `adjustments` — 异动薪酬

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| employeeId | INT | 是 | — | FK → `employees.id` |
| customerId | INT | 是 | — | 自动从 employee 填充，FK → `customers.id` |
| payrollRunId | INT | 否 | NULL | 锁定后关联的薪酬批次 |
| adjustmentType | ENUM | 是 | — | `bonus`, `allowance`, `reimbursement`, `deduction`, `other` |
| category | ENUM | 否 | NULL | 细分类别（见枚举值） |
| description | TEXT | 否 | NULL | 描述 |
| amount | DECIMAL(15,2) | 是 | — | 金额 |
| currency | VARCHAR(3) | 是 | `USD` | 货币（自动从员工国家填充） |
| receiptFileUrl | TEXT | 否 | NULL | 报销凭证 URL（仅 reimbursement） |
| receiptFileKey | VARCHAR(500) | 否 | NULL | 报销凭证 S3 Key |
| status | ENUM | 是 | `submitted` | `submitted`（可编辑）, `locked`（截止后锁定） |
| submittedBy | INT | 否 | NULL | 提交人 |
| effectiveMonth | DATE | 是 | — | 生效月份（YYYY-MM-01 格式） |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**category 枚举值**: `housing`, `transport`, `meals`, `performance_bonus`, `year_end_bonus`, `overtime`, `travel_reimbursement`, `equipment_reimbursement`, `absence_deduction`, `other`

**截止规则**: 每月 N+1 月 4 日 23:59 北京时间后，上月的 submitted 记录自动锁定为 locked。

---

### 3.16 `payroll_runs` — 薪酬批次

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| countryCode | VARCHAR(3) | 是 | — | 国家代码（按国家组织薪酬批次） |
| payrollMonth | DATE | 是 | — | 薪酬月份（每月1日） |
| currency | VARCHAR(3) | 是 | — | 当地法定货币 |
| status | ENUM | 是 | `draft` | `draft`, `pending_approval`, `approved`, `rejected` |
| totalGross | DECIMAL(15,2) | 否 | `0` | 总应发 |
| totalDeductions | DECIMAL(15,2) | 否 | `0` | 总扣除 |
| totalNet | DECIMAL(15,2) | 否 | `0` | 总实发 |
| totalEmployerCost | DECIMAL(15,2) | 否 | `0` | 总雇主成本 |
| submittedBy | INT | 否 | NULL | 提交人 |
| submittedAt | TIMESTAMP | 否 | NULL | 提交时间 |
| approvedBy | INT | 否 | NULL | 审批人 |
| approvedAt | TIMESTAMP | 否 | NULL | 审批时间 |
| rejectedBy | INT | 否 | NULL | 驳回人 |
| rejectedAt | TIMESTAMP | 否 | NULL | 驳回时间 |
| rejectionReason | TEXT | 否 | NULL | 驳回原因 |
| notes | TEXT | 否 | NULL | 备注 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**唯一约束**: `(countryCode, payrollMonth)` — 同一国家同一月份只能有一个薪酬批次。

**状态流转**: `draft` → `pending_approval` → `approved` / `rejected`。`approved` 为终态。

---

### 3.17 `payroll_items` — 薪酬明细

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| payrollRunId | INT | 是 | — | FK → `payroll_runs.id` |
| employeeId | INT | 是 | — | FK → `employees.id` |
| baseSalary | DECIMAL(15,2) | 是 | — | 基本工资 |
| bonus | DECIMAL(15,2) | 否 | `0` | 奖金（从 adjustments 聚合） |
| allowances | DECIMAL(15,2) | 否 | `0` | 津贴（从 adjustments 聚合） |
| reimbursements | DECIMAL(15,2) | 否 | `0` | 报销（从 adjustments 聚合） |
| deductions | DECIMAL(15,2) | 否 | `0` | 扣款（从 adjustments 聚合） |
| taxDeduction | DECIMAL(15,2) | 否 | `0` | 个税扣除 |
| socialSecurityDeduction | DECIMAL(15,2) | 否 | `0` | 社保个人部分 |
| unpaidLeaveDeduction | DECIMAL(15,2) | 否 | `0` | 无薪假扣除 |
| unpaidLeaveDays | DECIMAL(4,1) | 否 | `0` | 无薪假天数 |
| gross | DECIMAL(15,2) | 是 | — | 应发 = baseSalary + bonus + allowances - unpaidLeaveDeduction |
| net | DECIMAL(15,2) | 是 | — | 实发 = gross - taxDeduction - socialSecurityDeduction - deductions |
| employerSocialContribution | DECIMAL(15,2) | 否 | `0` | 雇主社保 |
| totalEmploymentCost | DECIMAL(15,2) | 是 | — | 总雇佣成本 = gross + employerSocialContribution |
| currency | VARCHAR(3) | 是 | `USD` | 货币 |
| notes | TEXT | 否 | NULL | 备注 |
| adjustmentsBreakdown | JSON | 否 | NULL | 异动明细（JSON 格式） |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**计算公式**:
- `gross` = baseSalary + bonus + allowances - unpaidLeaveDeduction
- `net` = gross - taxDeduction - socialSecurityDeduction - deductions + reimbursements
- `totalEmploymentCost` = gross + employerSocialContribution

---

### 3.18 `invoices` — 发票

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| customerId | INT | 是 | — | FK → `customers.id` |
| billingEntityId | INT | 否 | NULL | FK → `billing_entities.id` |
| invoiceNumber | VARCHAR(100) | UNIQUE | — | 发票编号 |
| invoiceType | ENUM | 是 | — | `deposit`, `monthly`, `one_time`, `deposit_refund`, `credit_note` |
| invoiceMonth | DATE | 否 | NULL | 账单月份（月度发票） |
| currency | VARCHAR(3) | 是 | — | 结算货币 |
| exchangeRate | DECIMAL(10,6) | 否 | `1` | 汇率 |
| exchangeRateWithMarkup | DECIMAL(10,6) | 否 | `1` | 含加价的汇率 |
| subtotal | DECIMAL(15,2) | 是 | — | 小计 |
| serviceFeeTotal | DECIMAL(15,2) | 否 | `0` | 服务费总计 |
| tax | DECIMAL(15,2) | 否 | `0` | VAT 总计 |
| total | DECIMAL(15,2) | 是 | — | 总计 = subtotal + serviceFeeTotal + tax |
| status | ENUM | 是 | `draft` | 状态（见下方） |
| dueDate | DATE | 否 | NULL | 到期日 |
| sentDate | TIMESTAMP | 否 | NULL | 发送日期 |
| paidDate | TIMESTAMP | 否 | NULL | 付款日期 |
| paidAmount | DECIMAL(15,2) | 否 | NULL | 实际付款金额 |
| relatedInvoiceId | INT | 否 | NULL | 关联发票（信用票据/退款） |
| notes | TEXT | 否 | NULL | 客户可见备注 |
| internalNotes | TEXT | 否 | NULL | 内部备注 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**发票状态流转**: `draft` → `pending_review` → `sent` → `paid` / `overdue` / `cancelled` / `void`

---

### 3.19 `invoice_items` — 发票行项目

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| invoiceId | INT | 是 | — | FK → `invoices.id` |
| employeeId | INT | 否 | NULL | FK → `employees.id`（可选） |
| description | VARCHAR(500) | 是 | — | 行项目描述 |
| quantity | DECIMAL(10,2) | 是 | `1` | 数量 |
| unitPrice | DECIMAL(15,2) | 是 | — | 单价 |
| amount | DECIMAL(15,2) | 是 | — | 金额 = quantity × unitPrice |
| itemType | ENUM | 是 | — | 类型（见枚举值） |
| countryCode | VARCHAR(3) | 否 | NULL | 关联国家 |
| localCurrency | VARCHAR(3) | 否 | NULL | 原始货币 |
| localAmount | DECIMAL(15,2) | 否 | NULL | 原始金额 |
| exchangeRate | DECIMAL(10,6) | 否 | NULL | 使用的汇率 |
| exchangeRateWithMarkup | DECIMAL(10,6) | 否 | NULL | 含加价汇率 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**itemType 枚举值**: `employment_cost`, `service_fee`, `bonus`, `allowance`, `reimbursement`, `deduction`, `deposit`, `deposit_refund`, `credit`, `vat`, `other`

---

### 3.20 `exchange_rates` — 汇率

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| fromCurrency | VARCHAR(3) | 是 | — | 源货币 |
| toCurrency | VARCHAR(3) | 是 | — | 目标货币 |
| rate | DECIMAL(10,6) | 是 | — | 汇率 |
| rateWithMarkup | DECIMAL(10,6) | 是 | — | 含加价汇率 = rate × (1 + markupPercentage/100) |
| markupPercentage | DECIMAL(5,2) | 是 | `5.00` | 加价百分比 |
| source | VARCHAR(100) | 否 | NULL | 数据来源 |
| effectiveDate | DATE | 是 | — | 生效日期 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

**唯一约束**: `(fromCurrency, toCurrency, effectiveDate)`

---

### 3.21 `audit_logs` — 审计日志

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| userId | INT | 否 | NULL | 操作人（NULL = 系统自动） |
| userName | VARCHAR(255) | 否 | NULL | 操作人名称 |
| action | VARCHAR(100) | 是 | — | 操作类型 |
| entityType | VARCHAR(100) | 是 | — | 实体类型 |
| entityId | INT | 否 | NULL | 实体 ID |
| changes | JSON | 否 | NULL | 变更详情 |
| ipAddress | VARCHAR(50) | 否 | NULL | IP 地址 |
| userAgent | TEXT | 否 | NULL | User Agent |
| createdAt | TIMESTAMP | 是 | NOW() | — |

---

### 3.22 `system_settings` — 系统设置

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| key | VARCHAR(100) | UNIQUE | — | 设置键名 |
| value | TEXT | 是 | — | 设置值 |
| description | TEXT | 否 | NULL | 描述 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

---

### 3.23 `billing_entities` — 账单主体

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INT AUTO_INCREMENT | PK | — | 主键 |
| entityName | VARCHAR(255) | 是 | — | 实体名称 |
| legalName | VARCHAR(255) | 是 | — | 法律名称 |
| registrationNumber | VARCHAR(100) | 否 | NULL | 注册号 |
| taxId | VARCHAR(100) | 否 | NULL | 税号 |
| country | VARCHAR(100) | 是 | — | 注册国家 |
| address | TEXT | 否 | NULL | 地址 |
| city | VARCHAR(100) | 否 | NULL | 城市 |
| state | VARCHAR(100) | 否 | NULL | 州/省 |
| postalCode | VARCHAR(20) | 否 | NULL | 邮编 |
| bankName | VARCHAR(255) | 否 | NULL | 银行名称 |
| bankAccountNumber | VARCHAR(100) | 否 | NULL | 银行账号 |
| bankSwiftCode | VARCHAR(20) | 否 | NULL | SWIFT 代码 |
| bankRoutingNumber | VARCHAR(50) | 否 | NULL | 路由号 |
| bankIban | VARCHAR(50) | 否 | NULL | IBAN |
| beneficiaryName | VARCHAR(255) | 否 | NULL | 收款人名称 |
| beneficiaryAddress | TEXT | 否 | NULL | 收款人地址 |
| currency | VARCHAR(3) | 是 | `USD` | 默认货币 |
| contactEmail | VARCHAR(320) | 否 | NULL | 联系邮箱 |
| contactPhone | VARCHAR(20) | 否 | NULL | 联系电话 |
| isDefault | BOOLEAN | 是 | false | 是否默认主体 |
| isActive | BOOLEAN | 是 | true | 是否激活 |
| notes | TEXT | 否 | NULL | 备注 |
| createdAt | TIMESTAMP | 是 | NOW() | — |
| updatedAt | TIMESTAMP | 是 | NOW() | — |

---

## 4. 枚举值域汇总

| 枚举名称 | 值域 |
|----------|------|
| 用户角色 | `admin`, `customer_manager`, `operations_manager`, `finance_manager`, `user` |
| 员工状态 | `pending_review`, `onboarding`, `contract_signed`, `active`, `on_leave`, `offboarding`, `terminated` |
| 服务类型 | `eor`, `visa_eor`, `aor` |
| 雇佣类型 | `fixed_term`, `long_term` |
| 签证状态 | `not_required`, `pending_application`, `application_submitted`, `approved`, `rejected`, `expired` |
| 客户状态 | `active`, `suspended`, `terminated` |
| 定价类型 | `global_discount`, `country_specific` |
| 合同状态 | `draft`, `signed`, `expired`, `terminated` |
| 异动类型 | `bonus`, `allowance`, `reimbursement`, `deduction`, `other` |
| 异动/假期状态 | `submitted`, `locked` |
| 薪酬批次状态 | `draft`, `pending_approval`, `approved`, `rejected` |
| 发票类型 | `deposit`, `monthly`, `one_time`, `deposit_refund`, `credit_note` |
| 发票状态 | `draft`, `pending_review`, `sent`, `paid`, `overdue`, `cancelled`, `void` |
| 发票行项目类型 | `employment_cost`, `service_fee`, `bonus`, `allowance`, `reimbursement`, `deduction`, `deposit`, `deposit_refund`, `credit`, `vat`, `other` |
| 文件类型 | `resume`, `passport`, `national_id`, `work_permit`, `visa`, `contract`, `education`, `other` |
| 假期过期规则 | `year_end`, `anniversary`, `no_expiry` |
| 账单周期 | `monthly`, `quarterly`, `annual` |
| 发薪周期 | `monthly`, `semi_monthly` |
