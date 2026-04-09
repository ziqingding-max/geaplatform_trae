# 猎头赋能工具 (Headhunter Toolkit) 需求理解与完整方案

## 一、 需求理解与确认

**核心目标**：在 GEA 平台的 Admin Portal 的 Toolkit 模块中，新增和完善面向“猎头同事”的赋能工具，旨在为猎头在 BD（商务拓展）客户和前置服务（如候选人沟通、谈薪、发 Offer）过程中提供强有力的数据、内容和工具支持。

**需求拆解**：
1. **内容资产赋能**：提供全球不同国家的标准化文档模版（劳动合同、Offer Letter、保密协议等）。
2. **数据洞察赋能**：提供精细化的薪酬 Benchmark（多维度：岗位、职责、年限、行业等），帮助猎头在谈薪和向客户提供建议时有据可依。
3. **BD 转化助力**：提供能直接输出给客户的专业交付物（如包含薪酬、当地合规要求、用工成本的综合报告），提升专业度和签单率。

---

## 二、 产品经理视角 (Product Manager Perspective)

从用户体验和业务转化出发，我们不仅要提供“静态文件”，更要提供“动态工具”。建议将新增功能整合为以下几个核心模块：

### 1. Document Template Center (全球文档模版库)
*   **功能描述**：集中管理各国的标准化合规文件。
*   **内容涵盖**：
    *   劳动合同模版 (Employment Contracts - 区分固定期限/无固定期限)
    *   Offer Letter 模版 (中英双语)
    *   保密协议 (NDA) 及竞业限制协议
    *   AOR 独立承包商服务协议 (Contractor Agreements)
*   **进阶体验**：除了支持直接下载 Word/PDF 模版外，支持**“动态生成”**。猎头输入候选人姓名、薪资、职位等少量信息，系统一键生成带 GEA 品牌（或白标）的水印 PDF，直接发送给候选人或客户。

### 2. Enhanced Salary Benchmark (全维度薪酬基准引擎)
*   **现状痛点**：目前系统底层的 `salary_benchmarks` 表仅包含国家、岗位大类、职级和 25/50/75 分位薪资，维度较浅。
*   **升级方案**：
    *   **增加过滤维度**：引入“行业 (Industry)”、“工作年限 (Years of Experience)”、“具体技能栈 (Skills)” 等维度。
    *   **可视化呈现**：在 Admin 端提供直观的薪资分布图表（柱状图、箱线图）。
    *   **一键导出**：支持将特定岗位的薪酬报告导出为精美的 PDF（可附加当地的个税估算），作为 BD 客户时的“敲门砖”或“增值服务”。

### 3. Hiring Compliance Cheat Sheet (全球招聘合规速查卡)
*   **功能描述**：结合现有的 `countries_config` 和 `Country Guide`，为猎头提炼出“招聘阶段”最关心的几个核心指标，形成速查看板。
*   **核心字段**：
    *   法定试用期标准 (Probation Period)
    *   法定离职通知期 (Notice Period)
    *   面试禁忌问题 (当地反歧视法要求，如能否问婚姻状况、年龄等)
    *   背景调查限制 (当地对背调的法律边界)

### 4. BD Proposal Generator (猎头专属 BD 提案生成器)
*   **功能描述**：联动现有的“Cost Simulator (成本计算器)”和“Country Guide (国家指南)”，猎头在输入候选人预期薪资后，不仅能看到成本，还能一键生成一份包含：`薪酬基准` + `用工总成本预估` + `当地核心合规要求` 的综合 PDF 报告。

---

## 三、 开发工程师视角 (Developer Perspective)

从系统整体设计和敏捷开发要求出发，该功能主要属于 Toolkit 层的增强，**不会对核心的 EOR/AOR 算薪和财务流产生破坏性影响**。

### 1. 数据库模型扩展 (Schema Changes)
*   **新增 `document_templates` 表**：
    ```typescript
    export const documentTemplates = pgTable("document_templates", {
      id: serial("id").primaryKey(),
      countryCode: varchar("countryCode", { length: 3 }).notNull(),
      templateType: text("templateType", { enum: ["offer_letter", "labor_contract", "nda", "other"] }).notNull(),
      titleEn: varchar("titleEn", { length: 200 }).notNull(),
      titleZh: varchar("titleZh", { length: 200 }).notNull(),
      fileUrl: text("fileUrl").notNull(), // S3 存储路径 (用于直接下载 Word/PDF)
      dynamicFields: jsonb("dynamicFields"), // 记录该模版支持的动态填充字段，如 { "candidateName": "string", "salary": "number" }
      isActive: boolean("isActive").default(true).notNull(),
      updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    });
    ```
*   **扩展 `salary_benchmarks` 表**：
    *   新增 `industry` (行业) 字段。
    *   新增 `yearsOfExperience` (年限范围) 字段。

### 2. 后端 API 设计 (tRPC Routers)
*   新建 `server/routers/toolkitHeadhunterRouter.ts` (Admin 专用)：
    *   `listDocumentTemplates`: 获取模版列表。
    *   `generateDynamicDocument`: 基于 `pdf-lib` 或 `html-pdf` 服务，将用户输入的参数动态注入到 HTML 模版中并转为 PDF。
    *   完善现有的 `salaryBenchmarkRouter.ts`，增加复杂筛选逻辑和图表数据聚合接口。

### 3. 前端页面开发 (React + Tailwind)
*   在 Admin 端的 `Layout.tsx` 的 Toolkit 菜单下新增：
    *   `/admin/document-templates` (文档模版中心)
    *   `/admin/salary-benchmark` (目前 Portal 有，但 Admin 端缺失完整的可视化入口)
*   组件复用：最大化复用现有的 `CountrySelect`、`Card`、`Recharts` (图表库) 等 UI 组件。

### 4. 上下游影响评估 (Impact Analysis)
*   **低风险**：新增的表和路由完全独立，不影响 `employees`, `contractors`, `payroll_runs` 等核心表。
*   **连带点**：若动态生成 PDF 涉及品牌色或 Logo，需调用现有的 `pdfBrandTemplateService.ts`，确保与现有 Quotation 导出的 PDF 风格一致。

---

## 四、 测试工程师视角 (QA Perspective)

所有测试必须遵循 **After Test Clean Up (测试后清理)** 的硬性要求。

### 1. 测试用例设计 (Test Cases)
*   **功能测试**：
    *   验证不同国家、不同类型的文档模版能否正确筛选和下载。
    *   验证 Salary Benchmark 的多条件组合查询（如：中国 + IT行业 + 5-10年经验 + 高级工程师）是否返回准确的分位值。
    *   验证动态 PDF 生成：输入特殊字符（如超长姓名、CJK中日韩字符）时，PDF 渲染是否乱码或排版错位。
*   **集成测试**：
    *   验证前端组件调用 tRPC 接口时的鉴权（必须是 Admin 角色）。

### 2. 数据清理策略 (After Test Clean Up)
*   在自动化测试 (Vitest) 的 `afterEach` 或 `afterAll` 钩子中：
    *   删除测试用例注入到 `document_templates` 和 `salary_benchmarks` 的 Mock 数据。
    *   清理测试过程中上传到本地临时目录或 S3 存储桶的生成的 PDF 文件。
    *   确保不残留任何脏数据影响后续测试。

---

## 五、 实施计划建议 (Next Steps)

如果您确认上述理解和方案，我将按照敏捷开发的节奏，分为两个 Sprint 进行实施：
*   **Sprint 1**: 数据库 Schema 更新、Admin 端文档模版中心（列表展示与静态下载）及薪酬基准的 Admin 端可视化页面。
*   **Sprint 2**: 动态 PDF 模版生成引擎、猎头专属 BD 综合报告导出功能。

**请您确认：**
1. 需求理解是否准确？
2. 上述方案（尤其是产品侧提出的 4 个模块）是否符合您的期望？是否有需要增删改的地方？
3. 确认后，我将立即开始编写代码并最终提交 PR。
