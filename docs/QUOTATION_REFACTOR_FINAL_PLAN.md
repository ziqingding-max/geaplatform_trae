# Quotation 模块重构 — 最终方案

> 版本: V3 Final | 日期: 2026-03-20

---

## 一、需求总览

本次重构包含 **两大板块、六项工作**：

### 板块 A：Quotation 三段式报价重构

| 编号 | 工作项 | 说明 |
|---|---|---|
| A1 | **服务费报价** | 支持多选国家共享同一价格，如 SG+MY+TH 统一 $500/人/月 |
| A2 | **雇主成本测算** | 独立的测算工具，选国家+输入工资后单独计算雇主成本 |
| A3 | **国家指南** | 独立选择需要哪些国家的指南 |
| A4 | **PDF 合并输出** | 服务费报价 + 雇主成本测算结果 + 国家指南 → 合并为一份完整 PDF |

### 板块 B：Sales CRM 流程增强

| 编号 | 工作项 | 说明 |
|---|---|---|
| B1 | **Lead 详情页新增 Quotations Card** | 独立 Card 展示该 Lead 下所有 Quotation |
| B2 | **Pipeline 状态规则调整** | MSA Signed 前置校验增强 + 允许非 closed_won 状态回调 |
| B3 | **权限收紧与级联清理** | Lead 删除仅 admin + 级联删除 Quotations/Documents/Activities/ChangeLogs |
| B4 | **Quotation accepted 互斥** | 标记 accepted 时自动将同 Lead 下其他 draft/sent 标记为 expired |

---

## 二、板块 B 详细设计

### B1. Lead 详情页新增 Quotations Card

在 `SalesCRM.tsx` 的 Lead 详情页左侧区域（Documents Card 下方），新增一个独立的 **Quotations Card**：

- 调用 `trpc.quotations.list` 接口，传入 `leadId` 过滤
- 展示列表：报价编号、总金额、状态 Badge、有效期、创建时间
- 操作按钮：查看/下载 PDF、状态切换（与 Quotations 列表页一致的逻辑）
- 快捷入口：「+ New Quotation」按钮跳转到 `/quotations/new?leadId=xxx`

### B2. Pipeline 状态规则调整

#### 2a. MSA Signed 前置校验增强

当前已有校验：必须有 accepted quotation + MSA document。

**新增校验**：必须有且仅有 **1 个 accepted** 的 Quotation。如果有多个 accepted，拒绝推进并提示用户。

> 注：由于 B4 的互斥逻辑，正常流程下不会出现多个 accepted。此校验是防御性编程。

#### 2b. 允许非 closed_won 状态回调

**当前行为**：Pipeline 只允许单步前进（discovery → leads → quotation_sent → msa_sent → msa_signed），不允许回退。closed_lost 可以 reopen 但只能跳到任意阶段。

**新行为**：

| 当前状态 | 允许的状态变更 |
|---|---|
| `discovery` | → `leads`（前进）, → `closed_lost` |
| `leads` | → `quotation_sent`（前进）, → `discovery`（回调）, → `closed_lost` |
| `quotation_sent` | → `msa_sent`（前进）, → `leads`（回调）, → `closed_lost` |
| `msa_sent` | → `msa_signed`（前进）, → `quotation_sent`（回调）, → `closed_lost` |
| `msa_signed` | → `closed_won`（通过 closeWon 按钮）, **不允许回调**（已转化 Customer） |
| `closed_won` | **终态，不允许任何变更** |
| `closed_lost` | → 任意非终态阶段（reopen，当前已支持） |

**后端修改**：`sales.ts` 中的 Pipeline Order 校验逻辑，允许 `nextIndex === currentIndex - 1`（回退一步）。

**前端修改**：`SalesCRM.tsx` 的 Pipeline Progress Bar，已完成的阶段也可以点击（回调）。同时 `closed_lost` 状态需要显示 Pipeline Progress Bar 并允许选择回调到任意阶段。

### B3. 权限收紧与级联清理

#### 3a. Lead 删除权限

| 项目 | 当前 | 修改后 |
|---|---|---|
| 后端 Procedure | `crmProcedure`（admin + sales + customer_manager） | `adminProcedure`（仅 admin） |
| 业务校验 | closed_won 或已转化 Customer 不能删 | 新增：`msa_signed` 也不能删（无论是否已转化） |
| 前端 UI | 非 closed 且无 Customer 就显示删除按钮 | 通过 `useAuth()` + `isAdmin()` 判断，仅 admin 显示 |

#### 3b. Lead 删除时级联清理

```
删除 Lead 时执行：
1. 查找该 Lead 下所有 Quotation
   → 删除 S3 上的 PDF 文件（如果有 pdfKey）
   → 删除 quotations 记录
2. 查找该 Lead 下所有 salesDocuments
   → 删除 S3 上的文件（如果有 fileKey）
   → 删除 salesDocuments 记录
3. 删除该 Lead 下所有 salesActivities
4. 删除该 Lead 下所有 leadChangeLogs
5. 最后删除 salesLeads 记录
```

#### 3c. Quotation 删除权限

| 状态 | 当前 | 修改后 |
|---|---|---|
| `draft` | 所有 CRM 用户可删 | 保持不变 |
| `sent` / `accepted` / `rejected` / `expired` | 不可删除 | **仅 admin 可删** |

### B4. Quotation Accepted 互斥逻辑

当用户将某个 Quotation 标记为 `accepted` 时：

1. 后端自动查找同一 `leadId` 下所有其他状态为 `draft` 或 `sent` 的 Quotation
2. 将它们的状态批量更新为 `expired`
3. 返回结果中包含被自动 expired 的 Quotation 数量，前端 toast 提示

---

## 三、受影响文件完整清单

### 后端

| 文件 | 修改内容 |
|---|---|
| `server/routers/sales.ts` | B2 状态规则 + B3 删除权限/级联 + convertToCustomer 适配 V2 |
| `server/routers/quotationRouter.ts` | A1-A3 接口 schema 重写 + B3c 删除权限 + B4 accepted 互斥 |
| `server/services/quotationService.ts` | A1-A4 create/update/generatePdf 重写 |
| `server/services/htmlPdfService.ts` | A4 PDF 模板三段式重写 |
| `server/procedures.ts` | 无需修改（adminProcedure 已存在） |

### 前端

| 文件 | 修改内容 |
|---|---|
| `client/src/pages/SalesCRM.tsx` | B1 Quotations Card + B2 Pipeline 回调 UI + B3a 删除按钮权限 |
| `client/src/pages/QuotationCreatePage.tsx` | A1-A3 三段式表单重构 |
| `client/src/pages/Quotations.tsx` | B3c 非 draft 删除按钮（仅 admin）+ B4 expired 状态展示 |
| `client/src/lib/i18n.ts` | 新增 ~30 个 i18n key |

### 不受影响的文件

| 文件 | 原因 |
|---|---|
| `drizzle/schema.ts` | JSON 字段结构在应用层控制，表结构不变 |
| `drizzle/relations.ts` | 关系定义不变 |
| `server/services/calculationService.ts` | 已是独立服务，接口不变 |
| `server/services/countryGuidePdfService.ts` | 已是独立服务，接口不变 |
| `server/services/db/customerService.ts` | createCustomerPricing 接口不变 |
| `server/services/db/commonService.ts` | deleteSalesLead 保持原样，级联逻辑在 router 层实现 |
| `shared/roles.ts` | 角色工具函数不变 |

---

## 四、数据兼容性

### V1/V2 双版本策略

`snapshotData` JSON 结构增加 `version` 字段：

```typescript
// V1（现有）: snapshotData 是 items 数组
[{ countryCode, serviceType, headcount, salary, currency, serviceFee, exchangeRate }]

// V2（新版）: snapshotData 是结构化对象
{
  version: 2,
  serviceFees: [{ countries: ["SG","MY"], serviceType: "eor", serviceFee: 500, currency: "USD" }],
  costSimulations: [{ countryCode: "SG", salary: 5000, currency: "SGD", results: {...} }],
  countryGuides: ["SG", "MY"]
}
```

所有读取 `snapshotData` 的地方（`convertToCustomer`、`generatePdf`）都会先检测是否有 `version` 字段来判断版本。

### convertToCustomer 适配

V2 结构下，遍历 `serviceFees` → 内层遍历 `countries` 数组 → 为每个国家调用一次 `createCustomerPricing`，价格相同。

---

## 五、开发顺序（4 个 Phase）

| Phase | 内容 | 预计工作量 |
|---|---|---|
| 1 | 后端：B2 状态规则 + B3 权限/级联 + B4 互斥 | 中 |
| 2 | 后端：A1-A4 数据模型/接口/PDF 重构 | 高 |
| 3 | 前端：B1 Quotations Card + B2 Pipeline UI + B3 权限 UI + A1-A3 表单 | 高 |
| 4 | 全量测试 + 历史数据兼容性验证 | 中 |
