# 猎头赋能工具 (Headhunter Toolkit) 产品需求与技术设计文档

**文档版本**: v1.0
**作者**: Manus AI
**日期**: 2026-03-29

---

## 1. 产品愿景与定位

### 1.1 业务背景
作为全球领先的 EOR/AOR 服务商，GEA 拥有丰富的全球用工合规、薪酬和福利数据。出海猎头在进行跨国人才寻访和客户 BD 时，面临着巨大的信息差（如：当地薪资水平、法定福利、解雇风险、入职周期等）。

### 1.2 产品定位
打造一个**模块化、可组合、极具专业度**的“猎头专属工作台”。不仅提供单点的信息查询，更通过“加入提案 (Add to Proposal)”的购物车模式，帮助猎头一键生成带有 GEA 品牌的专业客户报告，从而：
1. 提升猎头的专业形象和成单率。
2. 潜移默化地向猎头客户植入 GEA 的品牌和 EOR 解决方案。

---

## 2. 身份验证与权限隔离方案 (核心架构)

由于猎头并非 GEA 的内部运营人员，也不同于常规的 EOR 客户，我们需要在现有的 Admin 架构中进行严格的**身份隔离**和**权限控制**。

### 2.1 方案对比与最终选择

| 方案 | 描述 | 优点 | 缺点 | 结论 |
| :--- | :--- | :--- | :--- | :--- |
| **方案 A: 独立 Partner Portal** | 像客户 Portal 一样，单独起一个 `partner.geahr.com` 域名。 | 物理隔离最彻底，安全性最高。 | 开发成本高，需要重写整套前端 Layout 和路由。 | ❌ 放弃，太重 |
| **方案 B: Admin 内部角色隔离** | 在现有的 Admin 系统中新增 `headhunter` 角色，通过菜单和路由权限控制。 | 开发成本低，复用现有 UI 组件。 | 如果权限中间件漏写，存在越权访问 Admin 数据的风险。 | ✅ **采纳** (需配合严格的中间件) |

### 2.2 身份验证：飞书扫码强制登录 (Feishu SSO)

为了确保账号不被滥用，并降低注册门槛，我们采用**飞书扫码授权登录**作为猎头的唯一/主要入口。

**接入流程设计：**
1. **飞书开放平台配置**：在飞书开发者后台创建“网页应用”，获取 `App ID` 和 `App Secret`，配置回调 URL（如 `https://admin.geahr.com/api/auth/feishu/callback`）。
2. **前端登录页改造**：在 Admin 的登录页 (`/login`) 增加一个“猎头/合作伙伴登录”的 Tab，嵌入飞书的 JS SDK (`https://lf1-cdn-tos.bytegoofy.com/goofy/lark/op/h5-js-sdk-1.5.23.js`)，直接在网页内渲染飞书二维码。
3. **后端 OAuth 2.0 交互**：
   - 猎头使用飞书 App 扫码授权后，前端获取到临时授权码 `code`。
   - 前端将 `code` 发送给 GEA 后端 `/api/auth/feishu/login`。
   - 后端使用 `App ID` + `App Secret` 换取 `app_access_token`，再用 `code` 换取 `user_access_token`，最后拉取猎头的飞书身份信息（姓名、手机号、邮箱）。
4. **账号映射与自动注册**：
   - 后端检查 `users` 表是否存在该飞书 `openId` 或邮箱。
   - 如果不存在，**自动创建**一个 `role="headhunter"` 的账号，并标记为激活。
   - 签发 Admin JWT Token，写入 Cookie，完成登录。

### 2.3 权限控制中间件 (RBAC)

在 `server/procedures.ts` 中新增专属中间件，确保猎头**绝对无法**访问薪酬、发票等核心业务数据：

```typescript
// 仅允许内部 Admin 和 猎头访问 Toolkit
export const toolkitProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasAnyRole(ctx.user.role, ["admin", "headhunter", "sales"])) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Toolkit access required" });
  }
  return next({ ctx });
});

// 确保原有 adminProcedure 会拦截 headhunter
// (现有的 isAdmin 逻辑已经满足：hasRole(role, "admin"))
```

在前端 `Layout.tsx` 中，根据 `user.role === 'headhunter'`，**隐藏**所有 Client Management、Operations、Finance 菜单，仅展示 Toolkit 菜单。

---

## 3. 核心功能模块设计 (The 5 Blocks)

Toolkit 采用卡片式聚合页 (`/admin/toolkit`) 作为统一入口。

### 3.1 Global Start Date Predictor (全球入职日预测器)
*   **产品形态**：一个交互式日历组件。
*   **输入**：目标国家、候选人当前状态（是否在职）、预计发 Offer 日期。
*   **计算逻辑**：
    `建议入职日` = `Offer日` + `当地法定通知期 (Notice Period)` + `GEA EOR SLA (如 5 个工作日)` + `跳过期间的公共假日和周末`。
*   **输出**：在日历上高亮显示“最早合规入职日”，并生成一段可复制的话术（如：“考虑到德国 3 个月的通知期及 10 月的 2 个公共假日，建议将入职日定在 2026 年 2 月 1 日”）。

### 3.2 Global Benefits Explorer (全球福利大辞典)
*   **产品形态**：结构化的国家福利卡片。
*   **数据分类**：
    *   **Statutory (法定强制)**：如菲律宾 13 薪、巴西交通补贴 (VT)。不给违法。
    *   **Customary (市场惯例)**：如印度商业医疗险、欧洲补充年假。不给招不到人。
*   **核心亮点**：每个福利配有 **"Pitch Card" (向客户解释的商业话术)**，猎头可以一键复制，直接用于解答客户“为什么有这项成本”的疑问。

### 3.3 Enhanced Salary Benchmark (全维度薪酬基准)
*   **产品形态**：基于现有 `salary_benchmarks` 表的增强版可视化。
*   **功能**：支持按国家、岗位、职级筛选，展示 25th / Median / 75th 分位数的薪资区间图表（柱状图或箱线图）。
*   **新增能力**：支持正向/反向推算（输入期望净收入，结合税率估算毛收入）。

### 3.4 Hiring Compliance Cheat Sheet (招聘合规速查)
*   **产品形态**：国家维度的核心合规指标看板。
*   **内容包含**：法定试用期上限、背景调查合法性限制、竞业限制协议 (Non-compete) 的有效性要求、解雇成本预估（Severance pay 规则）。

### 3.5 Document Template Center (全球文档模版库)
*   **产品形态**：文件列表与下载中心。
*   **内容**：按国家分类的标准劳动合同 (Bilingual)、Offer Letter 模版、NDA (保密协议)、IP Assignment (知识产权转让协议)。
*   **格式**：提供 PDF 预览和 Word 原文件下载。

---

## 4. 核心交互：“加入提案”与一键导出 (The Cart & Export)

这是整个 Toolkit 的灵魂，将零散的工具串联成闭环。

### 4.1 购物车交互 (Toolkit Cart)
*   **全局状态**：前端引入 `ToolkitCartContext`。
*   **操作**：在薪酬查询结果、福利卡片、合规速查页面的右上角，统一放置 `[+] Add to Proposal` 按钮。
*   **悬浮窗**：页面右下角常驻一个“提案夹 (Proposal Drawer)”，点击展开可查看已选中的模块（如：已选 `越南-薪酬数据`、`越南-法定福利`）。

### 4.2 动态 PDF 生成引擎 (Export Engine)
*   **操作**：在悬浮窗点击“Generate Report (生成报告)”。
*   **后端处理**：
    1. 接收选中的模块 ID 和快照数据。
    2. 使用 Puppeteer / HTML-to-PDF 引擎，套用 GEA 官方品牌模版（带 Logo、免责声明）。
    3. 将薪酬图表、福利清单、合规要点拼接成一份排版精美的 PDF。
    4. 如果购物车中包含 Word 模版，则将 PDF 报告与 Word 模版一起打包成 ZIP 文件返回。

---

## 5. 实施路径与影响评估

### 5.1 数据库扩展 (Schema Changes)
需要新增以下表，完全独立，**不会影响**现有 EOR 算薪和财务核心逻辑：
1. `global_benefits`：存储各国的法定/补充福利及话术。
2. `document_templates`：存储模版文件的 S3/OSS 路径及元数据。
3. `users` 表 `role` 字段枚举增加 `headhunter`。

### 5.2 上下游影响评估
*   **路由层**：通过 `toolkitProcedure` 严格隔离，不会引发数据泄露。
*   **认证层**：飞书登录作为并行的 Auth Provider 接入 `/api/auth/feishu/login`，不影响现有的邮箱密码登录和客户 Portal 登录。
*   **性能**：PDF 生成属于 CPU 密集型操作，建议采用异步队列或限制并发，避免阻塞 Admin 主线程。

### 5.3 敏捷迭代计划
*   **Sprint 1**：飞书扫码登录接入、权限中间件改造、前端 Layout 隔离。
*   **Sprint 2**：福利大辞典、入职日预测器、合规速查卡的数据建模与页面开发。
*   **Sprint 3**：购物车交互上下文、动态 PDF 报告导出引擎。

---
*请确认此方案，确认后将按此 PRD 进行代码开发。*
