# 猎头赋能工具 (Headhunter Toolkit) 产品需求与技术设计文档

## 1. 产品愿景与定位

猎头赋能工具旨在为平台管理员（未来扩展至外部猎头）提供一套强大、便捷的全球用工知识与工具矩阵。通过将分散的薪酬、合规、福利及模版数据模块化，结合“购物车式”的组合交互与一键导出能力，大幅提升在 BD 客户及前线谈单过程中的专业度和效率，最终促进 EOR/AOR 业务的转化。

---

## 2. 用户角色与权限架构

基于对现有 `adminAuth.ts` 和 `shared/roles.ts` 的深入代码审阅，本期功能在权限控制上采取以下策略：

### 2.1 访问范围控制
本期 Toolkit 模块将直接集成于现有的 Admin 系统中。
*   **前台工具模块 (Toolkit Hub)**：向所有 Admin 系统的用户（即拥有 `user` 及以上角色的内部员工）开放。这确保了内部销售、客户经理也能利用这些工具赋能客户沟通。
*   **后台管理模块 (CMS)**：严格限制仅拥有 `admin` 角色的用户可访问。通过现有的 `isAdmin(roleStr)` 校验及 `adminProcedure` 中间件进行双重拦截。

### 2.2 菜单集成方案
在 `client/src/components/Layout.tsx` 中进行无缝集成，不破坏现有导航结构：
*   **Toolkit 菜单组**：将现有的“国家指南 (Country Guide)”、“成本模拟器 (Cost Simulator)”与新增的四大工具（入职日预测、薪酬基准、合规速查、福利大辞典、文档模版）合并至左侧边栏的 `Toolkit` 菜单组下。
*   **System 菜单组**：在 `System` 菜单组下新增 `Toolkit CMS` 入口，用于管理底层数据。

---

## 3. 核心功能模块设计 (前台)

### 3.1 统一工作台 (Toolkit Hub)
*   **页面路径**：`/admin/toolkit`
*   **UI/UX 设计**：采用卡片式应用商店布局。每个工具模块展示为一张独立的卡片（使用 Shadcn 的 `Card` 组件），包含图标、标题和简短描述。页面右下角常驻一个“加入提案 (Proposal Cart)”的悬浮抽屉 (Floating Drawer)。

### 3.2 📅 全球入职日预测器 (Global Start Date Predictor)
*   **业务逻辑**：猎头选择目标国家和拟定 Offer 日期。系统基于 `countries_config` 表中的 `noticePeriodDays`（法定通知期）和 `public_holidays` 表中的公共假日数据，自动推算最快入职日。
*   **交互设计**：集成 `react-day-picker` 日历组件，在日历上直观地用不同颜色高亮显示“通知期”、“公共假日”和“建议入职日”。

### 3.3 🎁 全球福利大辞典 (Global Benefits Explorer)
*   **业务逻辑**：展示目标国家的福利清单，明确区分“法定强制 (Statutory)”与“市场补充 (Customary)”。
*   **特色功能**：每项福利配备“一键复制话术 (Pitch Card)”，提供中英双语的对客解释文案。

### 3.4 📊 全维度薪酬基准引擎 (Enhanced Salary Benchmark)
*   **业务逻辑**：增强现有的薪酬查询功能。支持按国家、职能、资历进行多维度筛选。
*   **UI/UX 设计**：引入 `recharts` 图表库，将 P25、P50、P75 的薪资数据渲染为直观的箱线图或条形图，替代纯文本展示。

### 3.5 ⚖️ 招聘合规速查卡 (Hiring Compliance Cheat Sheet)
*   **业务逻辑**：提炼猎头最关心的硬性指标，如试用期限制、背调合法性、遣散费计算规则等。
*   **交互设计**：采用手风琴 (`Accordion`) 或信息卡片 (`Badge` + `Label`) 形式紧凑展示。

### 3.6 📄 全球文档模版库 (Document Templates)
*   **业务逻辑**：提供标准化的劳动合同、Offer Letter、NDA 等文件的下载。
*   **交互设计**：列表视图，支持按国家和文档类型过滤，提供直接下载链接。

### 3.7 🛒 提案生成器 (Proposal Builder)
*   **核心交互**：在上述每个模块的数据展示页，增加 `[+] Add to Proposal` 按钮。
*   **状态管理**：前端使用 React Context (`ToolkitCartContext`) 维护选中的模块数据（纯前端状态，无需落库）。
*   **导出引擎**：点击导出时，将收集的数据打包发送至后端的 PDF 生成服务 (`htmlPdfService.ts`)，复用现有的企业品牌模板，生成精美的综合 PDF 报告。

---

## 4. 后台管理模块设计 (CMS)

为了保证数据的持续更新与准确性，需开发仅供 Admin 使用的 CMS 后台。

*   **页面路径**：`/admin/toolkit-cms`
*   **UI 模式**：参考现有的 `KnowledgeBaseAdmin.tsx`，采用顶部 Tabs 切换不同的数据管理维度。
*   **数据追溯**：所有新增数据表均包含 `source`（如 `ai_generated`, `gea_official`）和 `lastVerifiedAt` 字段。在 CMS 列表中，对超期未校验的数据进行标黄预警。
*   **管理范围**：
    1.  **福利管理**：增删改查法定/补充福利及双语话术。
    2.  **合规管理**：编辑背调、遣散费等文本规则。
    3.  **模版管理**：上传文档至 S3，管理文件元数据。

---

## 5. 技术架构与数据模型设计

### 5.1 新增数据库 Schema (`drizzle/schema.ts`)

为了支持上述功能，需要新增以下三张独立的数据表。这些表与现有的 EOR/AOR 核心算薪表完全隔离，确保安全性。

| 表名 | 核心字段 | 关联关系 | 说明 |
| :--- | :--- | :--- | :--- |
| `global_benefits` | `id`, `countryCode`, `type` (statutory/customary), `nameEn`, `nameZh`, `descriptionEn`, `descriptionZh`, `source`, `lastVerifiedAt` | 关联 `countries_config` | 存储全球福利及对客话术 |
| `hiring_compliance` | `id`, `countryCode`, `probationRules`, `backgroundCheckRules`, `severanceRules`, `source`, `lastVerifiedAt` | 关联 `countries_config` | 存储招聘合规核心指标 |
| `document_templates` | `id`, `countryCode`, `documentType` (offer/contract/nda), `title`, `fileUrl`, `version`, `source` | 关联 `countries_config` | 存储文档模版的 S3 链接及元数据 |

### 5.2 API 路由设计 (`server/routers/toolkitRouter.ts`)

在 tRPC 架构中新增 `toolkitRouter`，包含以下核心接口：
*   `predictStartDate`: 接收国家和基准日期，结合 `public_holidays` 和 `noticePeriodDays` 计算入职日。
*   `getBenefits` / `upsertBenefit`: 福利数据的查询与维护。
*   `getCompliance` / `upsertCompliance`: 合规数据的查询与维护。
*   `getTemplates` / `upsertTemplate`: 模版元数据的查询与维护。
*   `generateProposalPdf`: 接收组合数据，调用 `htmlPdfService` 生成综合报告。

### 5.3 数据冷启动方案 (Seed Script)
*   编写独立的 `seedToolkitData.ts` 脚本。
*   利用 AI 知识库，为核心国家（如 CN, SG, US, VN 等）生成初始的福利、合规和薪酬数据，`source` 统一标记为 `ai_generated`。
*   文档模版暂由 AI 生成通用版本占位，后续由业务人员通过 CMS 替换为直营国家真实文件。

---

## 6. 上下游影响评估与风险控制

通过对代码库的深入审阅，确认本次开发方案具有极高的安全性：

1.  **数据库安全**：纯增量表设计（Add-only schema）。不修改任何现有的 `payroll_runs`、`invoices` 或 `employees` 表，对核心财务和发薪逻辑 **零影响**。
2.  **路由与中间件**：采用现有的 `adminProcedure` 和 `userProcedure`，无需改动底层的权限校验逻辑，不存在越权风险。
3.  **UI 隔离**：新增页面采用独立路由，Layout 的修改仅限于增加菜单项，不破坏现有的导航结构。
4.  **PDF 服务**：在 `htmlPdfService.ts` 中新增专用的 Proposal 渲染函数，与现有的 Quotation 和 Country Guide 渲染逻辑解耦。

---

## 7. 敏捷开发实施计划

开发将严格遵循敏捷模式，分为以下几个 Sprint，每个 Sprint 完成后均执行严格的 After Test Clean Up。

*   **Sprint 1: 基础设施与数据层**
    *   扩展 `schema.ts`，新增三张数据表。
    *   编写并执行 `seedToolkitData.ts`，完成核心国家的 AI 数据冷启动。
    *   开发后端的 `toolkitRouter` CRUD 接口。
*   **Sprint 2: CMS 管理后台开发**
    *   开发 `/admin/toolkit-cms` 页面，实现数据的增删改查与超期预警 UI。
*   **Sprint 3: 前台核心模块与 UI 开发**
    *   重构 Layout 菜单。
    *   开发统一的 Toolkit Hub 及五个独立的工具展示页。
    *   实现入职日预测算法及日历可视化。
    *   引入 Recharts 实现薪酬基准可视化。
*   **Sprint 4: 组合导出引擎与联调**
    *   开发前端购物车 Context 状态管理。
    *   扩展 `htmlPdfService.ts`，实现提案 PDF 生成。
    *   进行端到端完整测试与代码清理，提交 PR。
