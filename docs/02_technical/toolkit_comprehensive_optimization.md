# Toolkit 综合优化方案设计 (V3)

## 1. 产品经理视角 (PM)

### 业务目标与体验优化
本次优化旨在全面提升 Headhunter Toolkit 的用户体验、数据安全性和提案交付质量，解决当前存在的 6 个核心问题。

### 核心改进点
1. **内容可读性**：
   - **Global Benefits**：修复长文本不换行导致表格撑破的问题，确保描述信息在固定宽度内自动换行（`whitespace-pre-wrap`）。
   - **Salary Benchmark**：废弃密集型数据表格，重构为**卡片式分组视图**。按职位类别（Job Category）分组，每个职位使用水平范围条（P25-P50-P75）直观展示薪资区间，降低用户的认知负荷。
   - **Hiring Compliance**：移除底部的 `Source` 和 `Last Verified` 标记，使页面更清爽，聚焦核心合规信息。

2. **文档安全与下载体验**：
   - **Document Templates**：对现有的真实合同和 Offer 模版进行**脱敏处理**。清理其中的具体公司名、薪资数字、个人姓名等敏感信息，替换为 `[Company Name]`、`[Amount]` 等占位符，确保其作为安全、通用的 Template 提供给用户。
   - **文件名修复**：解决 CDN 随机字符串导致的文件名乱码问题，下载时将强制使用数据库中定义的真实 `fileName`。

3. **提案购物车 (Proposal Cart) 增强**：
   - **状态持久化**：修复当前切换 Toolkit 子页面导致购物车状态丢失的 Bug，确保在整个 Toolkit 模块内状态跨页面共享。
   - **作用域控制**：购物车入口（FAB 悬浮按钮）将**仅在用户进入 Toolkit 侧边栏内的功能时**显示，避免在非 Toolkit 页面（如 Dashboard、Settings）造成干扰。
   - **支持 Cost Simulator**：将 Cost Simulator 的计算结果（正算/倒算）接入购物车，支持一键添加到提案。

4. **提案 PDF 品牌化**：
   - 在生成的聚合 PDF 提案中，在目录页之后插入一页完整的 **CGL Group & GEA 公司介绍**（复用 Quotation 模块的文案），提升提案的专业度和品牌背书能力。
   - PDF 中将包含新增的 Cost Simulator 雇主成本明细表。

---

## 2. 开发工程师视角 (Dev)

### 架构与实现方案

#### 1. UI 布局与样式修复
- **Global Benefits**：修改 `client/src/pages/admin/toolkit/GlobalBenefits.tsx`，给 Description 所在的 `<TableCell>` 添加 `className="max-w-md break-words whitespace-pre-wrap"`。
- **Hiring Compliance**：修改 `client/src/pages/admin/toolkit/HiringCompliance.tsx`，删除底部的 `<div className="bg-muted/50...">...</div>` 包含 Source 信息的区块。

#### 2. Salary Benchmark 重构
- 修改 `client/src/pages/admin/toolkit/SalaryBenchmark.tsx`。
- 移除原有的 `<Table>` 和 `<BarChart>` 组件。
- 引入新的按 `jobCategory` 分组的渲染逻辑，使用 `Card` 组件包裹每个类别，内部使用自定义的 CSS 进度条（Progress Bar）来展示 P25, P50, P75 的相对位置。

#### 3. 购物车状态持久化与作用域
- **状态丢失原因**：当前 `ProposalCartProvider` 可能挂载在 `Layout` 内部某个随路由切换而重新挂载的节点上，或者 React Router 的 key 导致了重渲染。
- **解决方案**：
  - 将 `ProposalCartProvider` 提升到更外层（如 `App.tsx` 或 `Layout` 的最顶层）。
  - **作用域控制**：在 `ProposalCartDrawer.tsx` 中，使用 `useLocation` 获取当前路径，仅当 `location.pathname.includes('/admin/toolkit')` 时才渲染 FAB 按钮和 Drawer。

#### 4. Cost Simulator 接入购物车
- **数据结构**：扩展 `CartItemType` 增加 `'cost_simulator'`。
- **状态存储**：在 `AdminCostSimulator.tsx` 中，当计算完成后，展示 "Add to Proposal" 按钮，将当前的 `calculationResult`（包含 gross, net, employerTotal 等）序列化后存入 `CartItem` 的 `data` 字段（因为 Cost Simulator 数据不是简单的查库，而是动态计算的）。
- **后端支持**：修改 `server/routers/toolkitEnhancedRouter.ts` 中的 `generateProposal` 接口，支持接收 `cost_simulator` 类型的数据。
- **PDF 渲染**：在 `server/services/proposalPdfService.ts` 中新增 `renderCostSimulatorSection` 函数，渲染包含各项社保和个税的成本明细表。

#### 5. Document Templates 脱敏与下载
- **脱敏处理**：这是一个离线数据处理任务。我需要编写 Python 脚本下载 CDN 上的 20+ 个真实文件，使用 `python-docx` 或其他文本处理工具进行敏感词替换，然后重新上传到 CDN，并更新 `seedHeadhunterToolkit.ts` 中的 `fileUrl`。
- **下载重命名**：在 `DocumentTemplates.tsx` 中，修改 `handleDownload` 函数，不再使用 `window.open`，而是使用 `fetch(url)` 获取 Blob，然后创建 `<a>` 标签指定 `download={tpl.fileName}` 属性强制重命名。由于跨域问题，可能需要后端提供一个代理下载接口，或者确保 CDN 配置了正确的 CORS 和 Content-Disposition。最稳妥的方式是新增一个 tRPC 接口或 Express 路由用于代理下载并重命名。

#### 6. PDF 品牌化介绍
- 修改 `server/services/proposalPdfService.ts`。
- 在 `generateProposalPdf` 函数中，生成目录页之后，复用 `htmlPdfService.ts` 中的 `companyIntroHtml`（包含 About CGL Group 和 About GEA 的文案），作为独立的一页插入。

---

## 3. 测试工程师视角 (QA)

### 测试策略与覆盖点

1. **UI 渲染测试**：
   - 构造包含超长无空格文本的 Benefits 数据，验证表格是否被撑破。
   - 验证 Salary Benchmark 卡片视图在移动端和桌面端的响应式表现。

2. **购物车持久化与边界测试**：
   - 在 Global Benefits 中添加一项到购物车。
   - 点击侧边栏切换到 Salary Benchmark，验证购物车徽标数量是否保持不变，打开 Drawer 数据是否还在。
   - 切换到非 Toolkit 页面（如 Dashboard），验证购物车 FAB 是否消失。
   - 再次切回 Toolkit 页面，验证 FAB 重新出现且数据未丢失。

3. **Cost Simulator 集成测试**：
   - 执行一次正算（Gross to Net），加入购物车。
   - 执行一次倒算（Net to Gross），加入购物车。
   - 生成 PDF，验证 PDF 中是否正确渲染了两份计算结果的明细表，数值是否与页面显示一致。

4. **文件下载与脱敏验证**：
   - 随机抽查 3-5 个重新上传的 Document Templates，验证其中的具体公司名和薪资是否已被替换。
   - 点击前端下载按钮，验证下载的文件名是否为数据库中定义的 `fileName`（如 `US_Full Time_Offer Letter_Template.docx`），而不是乱码。

5. **PDF 品牌化验证**：
   - 导出任意 Proposal，检查第 3 页（目录后）是否包含完整的 CGL 和 GEA 英文/中文介绍。
