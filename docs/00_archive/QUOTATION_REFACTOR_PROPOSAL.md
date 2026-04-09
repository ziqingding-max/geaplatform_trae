# GEA Platform 报价功能重构方案评估报告

## 1. 需求理解与确认

根据您的要求，您希望将目前 `admin` 端 `Sales` 模块下的 `quotations`（报价）功能进行拆分和重构。

**现有逻辑：**
目前在创建报价时，用户添加的是一个个“国家项目”（Item），每个项目包含：国家、服务类型（EOR/Visa EOR/AOR）、人数、员工薪资。系统会根据选择的国家和薪资，自动计算出“雇主成本”（Employer Cost），并结合服务费（Service Fee）计算出该国家的总成本。同时，在报价单生成时，可以选择是否附带该国家的“国家指南”（Country Guide）。

**您的重构需求：**
您希望将这个高度耦合的流程拆分为三个独立但最终可合并的部分：
1. **第一部分：纯服务费报价 (Service Fee Quotation)**
   - 不再强制绑定具体员工薪资和雇主成本测算。
   - 用户可以选择**多个国家**，并为这些国家统一设定一个服务费价格（例如：EOR服务费统一 $500/人/月，适用于SG, MY, TH）。
2. **第二部分：雇主成本测算 (Employer Cost Simulation)**
   - 作为一个独立的工具或模块。
   - 用户选择特定国家，输入预估工资后，系统进行社保/公积金等雇主成本的单点测算。
3. **第三部分：国家指南 (Country Guide)**
   - 作为一个独立的可选模块。
   - 用户可以选择需要哪些国家的指南。
4. **最终合并 (Final Assembly)**
   - 在生成最终发送给客户的报价单（PDF）时，将上述三个部分（服务费报价 + 雇主成本测算结果 + 国家指南）灵活组合成一份完整的文档。

**请您确认上述理解是否准确？**

---

## 2. 可行性与难度评估

从产品、开发和测试三个视角来看，这个需求是**完全可行**的，但具有**中等偏上（Medium-High）**的开发难度。主要挑战在于数据模型的重构和历史数据的兼容。

### 2.1 产品经理视角 (Product Perspective)

**优势与价值：**
- **提升灵活性：** 很多时候销售在初期接触客户时，客户可能还不知道具体要雇佣什么薪资的员工，只需要看服务费报价。拆分后，销售可以快速出具“纯服务费报价单”，缩短销售周期。
- **功能解耦：** 雇主成本测算可以作为一个独立的“计算器”工具，不仅在报价时使用，甚至可以开放给客户门户（Client Portal）使用。
- **用户体验提升：** 现有的交互要求每个国家都必须输入薪资，对于批量报价（如覆盖亚太10国）操作繁琐。多选国家统一定价的设计极大提升了操作效率。

**需要注意的业务逻辑：**
- **报价单总金额的定义：** 目前 `quotations` 表有一个 `totalMonthly` 字段，如果只报服务费，这个总金额就只是服务费总和；如果包含了成本测算，是否要把测算成本加进总金额？建议在界面上明确区分 "Estimated Service Fee" 和 "Estimated Total Employment Cost"。
- **转为客户 (Closed Won) 时的影响：** 目前 Sales Lead 转化为 Customer 时，会读取最新 Quotation 的价格写入 `customer_pricing`。重构后，我们需要确保新的“多国统一定价”结构能够正确解析并同步到 `customer_pricing` 表中。

### 2.2 开发工程师视角 (Engineering Perspective)

**架构影响与修改范围：**

1. **数据库层 (`drizzle/schema.ts`)：**
   - 现有的 `quotations.countries` 和 `quotations.snapshotData` 存储的是包含 `salary` 和 `employerCost` 的大 JSON。
   - **调整：** 需要修改 JSON Schema 结构。建议将 JSON 结构拆分为三个节点：
     ```json
     {
       "serviceFees": [
         { "countries": ["SG", "MY"], "serviceType": "eor", "fee": 500, "currency": "USD" }
       ],
       "costSimulations": [
         { "countryCode": "SG", "salary": 5000, "currency": "SGD", "employerCost": 850, "details": [...] }
       ],
       "countryGuides": ["SG", "MY"]
     }
     ```

2. **后端路由 (`server/routers/quotationRouter.ts` & `sales.ts`)：**
   - 修改 `create` 和 `update` 的 Zod input schema，适配新的三段式结构。
   - 调整 `sales.ts` 中 `convertToCustomer` 的逻辑，使其能从新的 `serviceFees` 结构中提取数据写入 `customer_pricing`。

3. **服务层 (`server/services/quotationService.ts` & `htmlPdfService.ts`)：**
   - `quotationService.ts`：计算逻辑需要拆分。原来是遍历 items 顺便调用 `calculationService`。现在需要分别处理 `serviceFees` 和 `costSimulations`。
   - `htmlPdfService.ts`：**这是最大的修改点**。PDF 模板（`generateQuotationPdf`）需要彻底重写。目前的 HTML 模板是按行项目（包含薪资和成本）渲染表格的。重构后需要分为三个 Section：
     - Section 1: Service Fees (表格：国家列表 | 服务类型 | 单价)
     - Section 2: Estimated Employer Costs (如果有测算数据)
     - Section 3: Country Guides (现有的合并逻辑基本可复用)

4. **前端界面 (`client/src/pages/QuotationCreatePage.tsx`)：**
   - 页面需要从“单列表表单”重构为“三步走”或“三个独立卡片”的复杂表单。
   - 引入多选国家组件（Multi-select Country）。
   - 独立的成本计算器 UI。

**难度与风险：**
- **难度：中等偏上**。涉及到全栈（DB, API, Service, UI, PDF渲染）的联动修改。
- **风险（连带Bug）：** 最大的风险在于**历史报价单的兼容性**。由于 `countries` 字段是 JSON，旧数据是旧格式，新代码在读取、展示和重新生成 PDF 时，必须做好向下兼容（Fallback 逻辑），否则会导致历史报价单无法查看或下载报错。

### 2.3 测试工程师视角 (QA Perspective)

**测试重点与策略：**

1. **向后兼容性测试 (Backward Compatibility)：**
   - 必须验证重构前创建的处于 `draft`, `sent`, `accepted` 状态的报价单，在重构后能否正常打开编辑页面。
   - 必须验证旧报价单能否正常下载 PDF（PDF 模板需要兼容旧的 JSON 数据结构）。

2. **边界条件测试：**
   - 只添加服务费，不添加成本测算和国家指南，能否正常生成 PDF？
   - 成本测算的货币与服务费的货币不一致时，总计金额的汇率转换是否正确？
   - 多选国家时（如选择了 10 个国家），PDF 渲染是否会越界或分页错误？

3. **上下游链路测试 (End-to-End)：**
   - 走通 `Lead -> Quotation -> MSA Signed -> Closed Won -> Customer Pricing` 的全链路。
   - 重点验证多国统一定价在转化为 Customer 后，`customer_pricing` 表中是否为这几个国家都正确创建了独立的价格记录。

4. **Clean Up 动作：**
   - 自动化测试脚本需要更新，清理测试产生的新格式 Quotation 和 S3 上的 PDF 文件。

---

## 3. 完整落地方案建议

如果您确认需求无误，我建议按照以下步骤进行敏捷开发：

### Phase 1: 数据模型与接口层重构 (Backend)
1. 在 `quotationService.ts` 中定义新的 `QuotationDataV2` 接口，包含 `serviceFees`, `simulations`, `guides`。
2. 更新 `quotationRouter.ts` 的 Zod schema，支持 V2 格式，同时在读取时兼容 V1 格式。
3. 调整 `sales.ts` 中的 `convertToCustomer` 逻辑，支持解析 V2 格式。

### Phase 2: PDF 渲染引擎升级 (PDF Generation)
1. 在 `htmlPdfService.ts` 中，为 V2 数据结构设计新的 HTML 模板。
2. 实现模块化渲染：根据传入的数据动态决定是否渲染 Cost Simulation Section 和 Country Guide Section。
3. 保留对 V1 数据的渲染支持（或者在 Service 层写一个 V1 转 V2 的 Adapter）。

### Phase 3: 前端交互重构 (Frontend)
1. 重写 `QuotationCreatePage.tsx`。
2. **UI 设计建议**：采用 Tabs 或 垂直折叠面板（Accordion）的方式组织页面：
   - **Step 1: Service Fees (Required)** -> 使用 Tag Input 支持多选国家。
   - **Step 2: Cost Simulation (Optional)** -> 独立的计算器卡片，可多次添加测算。
   - **Step 3: Country Guides (Optional)** -> Checkbox 列表，自动勾选 Step 1 和 2 中出现过的国家，允许手动增删。

### Phase 4: 全量测试与修复 (Testing)
1. 执行历史数据兼容性测试。
2. 执行全链路转化测试。

---

**下一步：**
请您：
1. **确认**我对您需求的理解是否100%准确。
2. **确认**是否同意上述的重构方案和数据结构调整。
3. 如果有任何需要微调的地方（例如：成本测算是否需要强制必须有对应的服务费国家？），请告诉我。

得到您的确认后，我将立即开始代码开发。
