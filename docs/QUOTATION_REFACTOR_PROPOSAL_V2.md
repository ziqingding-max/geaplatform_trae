# GEA Platform 报价功能重构方案评估报告 (V2)

## 1. 需求确认与补充分析

在您的确认基础上，我进一步深挖了代码库，重点排查了上下游的关联逻辑，特别是**Leads 转 Customers** 的关键链路，以及前后端引用的所有细节。

**核心需求回顾：**
将现有的高度耦合的报价流程拆分为三部分：
1. **服务费报价 (Service Fees)**：支持多选国家，统一设定服务费。
2. **雇主成本测算 (Cost Simulations)**：独立的成本计算器。
3. **国家指南 (Country Guides)**：独立选择需要附带的国家指南。

**上下游关键链路分析 (Crucial Discoveries)：**
1. **`sales.ts` -> `convertToCustomer` 逻辑**：
   - 当前逻辑：当 Lead 状态变为 `msa_signed` 时，系统会查找该 Lead 下最新的一份 Quotation，读取其 `snapshotData`（包含 `countryCode`, `serviceType`, `serviceFee` 等），然后循环调用 `createCustomerPricing` 写入 `customer_pricing` 表。
   - **重构挑战**：由于新版支持“多选国家统一定价”，`snapshotData` 的结构将发生变化。在转换时，必须能够正确解析新的数据结构，将“一个价格配置对应多个国家”展开为“每个国家一条 `customer_pricing` 记录”。
2. **`htmlPdfService.ts` -> `generateQuotationPdf` 逻辑**：
   - 当前逻辑：高度依赖每个 Item 同时包含薪资、服务费和测算结果（`calcDetails`）。
   - **重构挑战**：需要彻底解耦，按 Service Fees 和 Cost Simulations 两个独立模块进行渲染。
3. **前端 `QuotationCreatePage.tsx` 逻辑**：
   - 需要引入多选组件（如 `MultiSelect`），并将页面划分为三个清晰的模块。

---

## 2. 完整落地方案 (End-to-End Implementation Plan)

为了确保不产生关联 bug，开发将分为 4 个阶段，严格按照敏捷开发要求执行。

### Phase 1: 后端数据模型与接口层重构 (Backend & Data Model)

**1. 调整 JSON Schema (在应用层，不改表结构)**
`quotations.countries` 和 `quotations.snapshotData` 存储的 JSON 结构更新为：
```typescript
interface QuotationDataV2 {
  version: "v2";
  serviceFees: {
    countries: string[]; // 多选国家，例如 ["SG", "MY"]
    serviceType: "eor" | "visa_eor" | "aor";
    currency: string;
    serviceFee: number;
    oneTimeFee?: number;
  }[];
  costSimulations: {
    countryCode: string;
    regionCode?: string;
    salary: number;
    currency: string;
    employerCost: number;
    calcDetails: any[]; // 包含具体的社保公积金明细
    exchangeRate: number;
    usdEmploymentCost: number;
  }[];
  countryGuides: string[]; // 需要附带指南的国家列表，例如 ["SG", "MY"]
}
```

**2. 修改 `quotationRouter.ts` 和 `quotationService.ts`**
- 更新 `create` 和 `update` 的 Zod input schema。
- 在 `quotationService.ts` 中，分别处理 `serviceFees` 和 `costSimulations`。
- 保留对旧版 V1 格式的读取兼容性，确保历史数据不会崩溃。

**3. 修改 `sales.ts` 中的 `convertToCustomer`**
- 增加对 `version: "v2"` 的判断。
- 遇到 V2 数据时，遍历 `serviceFees`，再内层遍历 `countries`，为每一个国家调用一次 `createCustomerPricing`。
- **关键点**：这正是您提到的“按照国家创建多个相同的价格生效在 customers pricing 里面”。

### Phase 2: PDF 渲染引擎升级 (PDF Generation)

**修改 `htmlPdfService.ts` -> `generateQuotationPdf`**
- **兼容性处理**：如果是旧版 V1 数据，继续使用原有的渲染逻辑。
- **V2 渲染逻辑**：
  - **Section 1: Pricing Summary (Service Fees)**
    - 表格列：Countries (如 SG, MY), Service Type, Service Fee, One-time Fee。
  - **Section 2: Estimated Employment Costs (如果有)**
    - 表格列：Country, Gross Salary, Employer Cost, Total Estimated Cost。
    - 附带具体的 Cost Breakdown。
  - **Section 3: Country Guides**
    - 复用现有的合并逻辑，根据 `countryGuides` 列表生成对应的 PDF 并合并。

### Phase 3: 前端交互重构 (Frontend UI)

**重写 `QuotationCreatePage.tsx`**
- **UI 结构调整**：使用三个独立的卡片 (Cards) 或手风琴 (Accordion) 面板。
- **Part 1: Service Fees**
  - 引入 `MultiSelect` 组件（或修改现有的 `CountrySelect` 支持多选）。
  - 用户可以添加多行，每行选择多个国家，输入统一的服务费。
- **Part 2: Cost Simulations (可选)**
  - 用户可以选择国家，输入薪资，点击“计算”，结果以只读卡片形式展示。
- **Part 3: Country Guides (可选)**
  - 展示一个国家列表（默认勾选 Part 1 和 Part 2 中出现过的国家），用户可自由增删。

### Phase 4: 全量测试与验证 (Testing & Clean Up)

**测试用例：**
1. **创建新版报价单**：包含服务费（多国）、成本测算、国家指南。
2. **PDF 生成测试**：验证新版 PDF 排版是否美观，数据是否准确。
3. **转化测试 (Lead -> Customer)**：将包含多国服务费的报价单关联的 Lead 推进到 `msa_signed`，验证 `customer_pricing` 表是否正确生成了多条记录。
4. **历史数据兼容性测试**：打开旧版报价单的编辑页面，验证是否正常；下载旧版报价单的 PDF，验证是否正常。
5. **Clean Up**：测试完成后，删除测试产生的 Lead、Customer、Quotation 和 S3 文件。

---

## 3. 风险评估与应对策略

| 风险点 | 应对策略 |
|---|---|
| 历史报价单在转 Customer 时解析失败 | 在 `convertToCustomer` 中保留完整的 V1 解析逻辑，只有检测到 `version: "v2"` 时才使用新逻辑。 |
| PDF 模板重写导致旧版 PDF 无法下载 | `htmlPdfService.ts` 中根据数据结构动态选择渲染模板（V1 Template vs V2 Template）。 |
| 前端多选组件缺失 | 如果项目中没有现成的 `MultiSelect` 组件，将基于 `radix-ui` (shadcn) 实现一个简单的多选下拉框。 |

---

**请您最后确认：**
这份包含上下游链路分析（特别是 `convertToCustomer` 逻辑）的方案是否符合您的预期？确认后，我将立即按照 Phase 1 -> 4 的顺序开始开发。
