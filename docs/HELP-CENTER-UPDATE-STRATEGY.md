# Client Portal Help Center 自动化内容更新策略

> **版本**: 1.0
> **日期**: 2026-02-28
> **作者**: Manus AI
> **适用系统**: GEA EOR SaaS Admin — `app.geahr.com` (Client Portal)

---

## 1. 摘要

本文档为 GEA EOR SaaS Admin 系统的客户门户 (Client Portal) **帮助中心 (Help Center)** 设计了一套完整的自动化内容更新策略，涵盖内容框架、数据库架构、外部数据源、内容聚合引擎、定时任务调度和前端推送机制六大维度。

**核心问题**：当前帮助中心的所有内容（操作指引、FAQ、更新日志）均硬编码在前端文件 `client/src/pages/portal/PortalHelpCenter.tsx` 中。任何内容修改都需要工程师手动修改代码并重新部署，维护成本极高，且完全无法实现"自动更新"。

**解决方案**：通过以下四个核心改造，将帮助中心从静态页面升级为动态知识平台：

1. **内容框架扩展**：在现有"操作指引"和"FAQ"基础上，新增"全球合规动态"、"市场洞察"和"产品更新日志"三大内容板块，覆盖 GEA 客户最关心的全球雇佣信息。
2. **数据库驱动**：新增 `help_categories` 和 `help_articles` 两张数据库表，将所有内容结构化存储，实现内容与代码解耦。
3. **自动化聚合引擎**：创建 `helpContentService.ts`，结合 RSS Feed 抓取、Manus LLM 摘要与翻译，以及 `CHANGELOG.md` 解析，实现内容的全自动入库。
4. **定时推送通知**：在客户门户首页 (Dashboard) 以非侵入式通知栏的形式，主动向用户推送最新内容。

---

## 2. 现状分析

### 2.1. 现有帮助中心结构

当前 `PortalHelpCenter.tsx` 包含三个 Tab 页：

| Tab | 内容类型 | 当前数据来源 | 条目数量 |
|:---|:---|:---|:---|
| **Guides (操作指引)** | 系统功能操作步骤 | 硬编码数组 `GUIDE_SECTIONS` | 7 个模块 |
| **FAQ** | 常见问题解答 | 硬编码数组 `FAQ_ITEMS` | 8 个问题 |
| **Changelog (更新日志)** | 系统版本更新记录 | 硬编码数组 `UPDATE_ENTRIES` | 1 个版本 |

值得注意的是，帮助中心目前**没有对应的后端 tRPC 路由**（`docs/client-portal-spec.md` 中 Help Center 一行的后端路由列为"—"），这意味着所有内容完全由前端静态维护，是本次改造的核心出发点。

### 2.2. 可复用的系统能力

对代码库的深度分析发现，系统已具备支撑自动化更新所需的全部基础设施：

| 能力 | 现有实现 | 复用方式 |
|:---|:---|:---|
| **外部 API 抓取** | `server/services/exchangeRateFetchService.ts` | 作为内容抓取服务的代码模板 |
| **定时任务调度** | `server/cronJobs.ts` (7 个 Cron Job) | 新增 2 个 Help Center 专属 Cron Job |
| **LLM 服务** | `server/_core/llm.ts` (Manus LLM) | 用于文章摘要生成和中英文翻译 |
| **数据库操作** | `server/db.ts` (Drizzle ORM) | 新增 `help_articles` 相关 CRUD 函数 |
| **Portal tRPC** | `server/portal/portalRouter.ts` (9 个路由) | 新增 `helpCenter` 路由 |
| **通知服务** | `server/_core/notification.ts` | 可选：用于邮件推送 |

---

## 3. 内容框架设计

### 3.1. 五大内容板块

帮助中心的内容将扩展为以下五个板块，覆盖"系统使用"和"行业知识"两大维度：

| 板块 | Slug | 英文名 | 内容定位 | 数据来源类型 | 更新频率 |
|:---|:---|:---|:---|:---|:---|
| **操作指引** | `guides` | Guides | 系统各功能模块的操作步骤与最佳实践 | 手动编写 | 功能发布时 |
| **常见问题** | `faq` | FAQ | 客户高频问题的标准化解答 | 手动编写 | 按需 |
| **产品更新** | `changelog` | Changelog | 系统版本更新记录，自动同步 `CHANGELOG.md` | 自动解析 | 每次部署后 |
| **全球合规动态** | `compliance-updates` | Compliance Updates | 全球主要国家劳动法、税务、签证政策最新变化 | 外部 RSS / API | 每日 |
| **市场洞察** | `market-insights` | Market Insights | 全球雇佣、远程工作、薪酬福利行业报告与趋势 | 外部 RSS / API | 每周 |

### 3.2. 内容质量标准

为确保自动抓取的内容质量，所有自动入库的文章必须满足以下标准：

- **相关性**：文章主题必须与全球雇佣、劳动法、薪酬、合规或人力资源相关。
- **双语支持**：所有文章必须提供英文原文和中文摘要（通过 LLM 翻译生成）。
- **来源标注**：必须记录文章来源名称和原始 URL，方便用户追溯。
- **去重机制**：通过检查 `sourceUrl` 字段避免重复入库同一篇文章。

---

## 4. 数据库架构设计

### 4.1. `help_categories` 表

用于管理内容分类，支持前端动态渲染 Tab 导航。

```typescript
// drizzle/schema.ts 新增内容
export const helpCategories = mysqlTable(
  "help_categories",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 50 }).notNull().unique(),
    nameEn: varchar("name_en", { length: 100 }).notNull(),
    nameCn: varchar("name_cn", { length: 100 }).notNull(),
    descriptionEn: text("description_en"),
    descriptionCn: text("description_cn"),
    displayOrder: int("display_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    hcSlugIdx: uniqueIndex("hc_slug_idx").on(table.slug),
  })
);
export type HelpCategory = typeof helpCategories.$inferSelect;
export type InsertHelpCategory = typeof helpCategories.$inferInsert;
```

### 4.2. `help_articles` 表

核心内容表，存储所有文章、FAQ 条目和更新日志。

```typescript
// drizzle/schema.ts 新增内容
export const helpArticles = mysqlTable(
  "help_articles",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("category_id").notNull(),
    titleEn: varchar("title_en", { length: 255 }).notNull(),
    titleCn: varchar("title_cn", { length: 255 }),
    contentEn: text("content_en").notNull(),  // 英文内容 (Markdown)
    contentCn: text("content_cn"),            // 中文内容 (Markdown, 由 LLM 生成)
    source: varchar("source", { length: 100 }),    // 例: "Manual", "Littler", "SHRM", "CHANGELOG.md"
    sourceUrl: varchar("source_url", { length: 512 }).unique(), // 用于去重
    publishedAt: timestamp("published_at").defaultNow().notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    isPushed: boolean("is_pushed").default(false).notNull(), // 是否已推送到 Dashboard
    viewCount: int("view_count").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    haArticleCategoryIdIdx: index("ha_article_category_id_idx").on(table.categoryId),
    haArticlePublishedAtIdx: index("ha_article_published_at_idx").on(table.publishedAt),
    haArticleSourceUrlIdx: uniqueIndex("ha_article_source_url_idx").on(table.sourceUrl),
  })
);
export type HelpArticle = typeof helpArticles.$inferSelect;
export type InsertHelpArticle = typeof helpArticles.$inferInsert;
```

### 4.3. 初始数据

执行 `pnpm db:push` 后，通过 SQL 插入初始分类数据：

```sql
INSERT INTO help_categories (slug, name_en, name_cn, display_order) VALUES
  ('guides',             'Guides',              '操作指引',     1),
  ('faq',                'FAQ',                 '常见问题',     2),
  ('changelog',          'Changelog',           '产品更新',     3),
  ('compliance-updates', 'Compliance Updates',  '全球合规动态', 4),
  ('market-insights',    'Market Insights',     '市场洞察',     5);
```

---

## 5. 外部数据源规划

### 5.1. 全球合规动态数据源

以下数据源专注于全球劳动法、雇佣合规和签证政策，与 GEA 的 EOR 业务高度相关：

| 数据源名称 | 机构类型 | RSS Feed URL | 内容特点 | 优先级 |
|:---|:---|:---|:---|:---|
| **Littler Mendelson** | 全球劳动法律所 | `https://www.littler.com/publication-press/publication/feed` | 覆盖 40+ 国家劳动法变化，权威性最高 | P0 |
| **Fragomen** | 全球移民法律所 | `https://www.fragomen.com/insights/rss.xml` | 专注签证、工作许可、移民政策 | P0 |
| **KPMG Tax News** | 四大会计师事务所 | `https://home.kpmg/xx/en/home/insights/2021/02/tax-news-flash.html` | 全球税务政策变化 | P1 |
| **ILO (国际劳工组织)** | 联合国机构 | `https://www.ilo.org/global/about-the-ilo/newsroom/news/lang--en/rss.xml` | 全球劳工标准和政策 | P1 |
| **EY Global Tax Alerts** | 四大会计师事务所 | `https://www.ey.com/en_gl/tax/tax-alerts` | 全球税务合规动态 | P2 |

### 5.2. 市场洞察数据源

以下数据源提供全球雇佣市场趋势、薪酬报告和远程工作洞察：

| 数据源名称 | 机构类型 | RSS Feed URL | 内容特点 | 优先级 |
|:---|:---|:---|:---|:---|
| **SHRM** | 全球最大 HR 协会 | `https://www.shrm.org/rss/pages/rss.aspx?feed=news` | 人力资源管理新闻与研究 | P0 |
| **Papaya Global Blog** | EOR 行业同行 | `https://papayaglobal.com/blog/feed/` | 全球薪酬、EOR 行业洞察 | P0 |
| **Remote.com Blog** | 远程工作平台 | `https://remote.com/blog/rss.xml` | 远程工作、全球雇佣趋势 | P1 |
| **Deel Blog** | EOR 行业同行 | `https://www.deel.com/blog/rss.xml` | 全球雇佣、合规最佳实践 | P1 |
| **Mercer Insights** | 全球 HR 咨询 | `https://www.mercer.com/our-thinking/rss.html` | 薪酬基准、福利趋势 | P2 |

### 5.3. 数据抓取策略

对于每个 RSS Feed，采用以下处理流程：

1. **抓取**：通过 `fetch()` 获取 RSS XML，使用 `fast-xml-parser` 或正则解析 `<item>` 节点。
2. **去重**：检查 `sourceUrl` 是否已存在于 `help_articles` 表中，存在则跳过。
3. **过滤**：使用关键词列表（`employment`, `labor law`, `payroll`, `compliance`, `EOR`, `visa`, `tax`）过滤不相关文章。
4. **AI 处理**：调用 Manus LLM (`server/_core/llm.ts`) 完成：
   - 生成不超过 300 字的英文摘要。
   - 将摘要翻译为中文。
5. **入库**：将处理好的内容写入 `help_articles` 表。

---

## 6. 自动化内容聚合引擎

### 6.1. 服务文件结构

在 `server/services/` 目录下新建 `helpContentService.ts`：

```typescript
/**
 * Help Content Service
 *
 * Responsibilities:
 * 1. Fetch and parse RSS feeds from external compliance/HR sources
 * 2. Use LLM to generate summaries and Chinese translations
 * 3. Parse CHANGELOG.md for product update entries
 * 4. Write processed content to help_articles table (with deduplication)
 */

// ── 核心函数签名 ──────────────────────────────────────────────────────────────

/**
 * 主入口：抓取所有已配置的 RSS Feed 并入库
 * 由 Cron Job (每日 02:00) 调用
 */
export async function fetchAndStoreExternalContent(): Promise<{
  fetched: number;
  stored: number;
  skipped: number;
  errors: string[];
}>;

/**
 * 解析 CHANGELOG.md 并将最新版本同步到 help_articles
 * 由服务器启动时调用
 */
export async function syncChangelogToHelpCenter(): Promise<void>;

/**
 * 使用 LLM 处理单篇文章（摘要 + 翻译）
 */
async function processArticleWithLLM(
  titleEn: string,
  contentEn: string
): Promise<{ summaryEn: string; titleCn: string; contentCn: string }>;

/**
 * 抓取单个 RSS Feed 并返回文章列表
 */
async function fetchRssFeed(
  feedUrl: string,
  sourceName: string
): Promise<Array<{ title: string; content: string; url: string; publishedAt: Date }>>;
```

### 6.2. LLM Prompt 设计

对于每篇抓取的文章，使用以下 Prompt 调用 Manus LLM：

```
You are a professional HR and employment law content editor for GEA, a global Employer of Record (EOR) company serving clients in 15+ countries.

Given the following article title and content, please:
1. Write a concise English summary (max 250 words) focusing on key implications for global employers.
2. Translate the summary title and body into Simplified Chinese.

Article Title: {title}
Article Content: {content}

Respond in JSON format:
{
  "summaryEn": "...",
  "titleCn": "...",
  "contentCn": "..."
}
```

---

## 7. 定时任务调度策略

### 7.1. 新增 Cron Jobs

在 `server/cronJobs.ts` 中新增以下两个定时任务：

| 任务名称 | 执行时间 (北京时间) | Cron 表达式 | 说明 |
|:---|:---|:---|:---|
| **Help Center 内容抓取** | 每日 02:00 | `0 2 * * *` | 抓取所有 P0/P1 RSS Feed，LLM 处理后入库 |
| **市场洞察周报** | 每周一 09:00 | `0 9 * * 1` | 专门抓取 P1/P2 市场洞察类 Feed，生成周报摘要 |

### 7.2. 完整 Cron Job 时间表（更新后）

以下是包含新增任务后的完整定时任务列表：

| 执行时间 | 任务名称 | 说明 |
|:---|:---|:---|
| 每日 00:01 | 员工自动激活 | 激活到达入职日期的员工 |
| 每日 00:02 | 假期状态转换 | 更新员工在职/休假状态 |
| 每日 00:03 | 逾期发票检测 | 标记逾期未付发票 |
| 每日 00:05 | 汇率自动抓取 | 从 ECB/ExchangeRate-API 获取最新汇率 |
| **每日 02:00** | **Help Center 合规动态抓取** | **新增：抓取全球劳动法/合规 RSS，LLM 处理入库** |
| 每月 1 日 00:10 | 假期余额累计 | 为员工累计年假余额 |
| 每月 5 日 00:00 | 数据自动锁定 | 锁定上月调整项和假期数据 |
| 每月 5 日 00:01 | 薪酬单自动创建 | 基于锁定数据创建薪酬单 |
| **每周一 09:00** | **Help Center 市场洞察周报** | **新增：抓取市场洞察类 Feed，生成周报** |

### 7.3. 错误处理与容灾

参考 `exchangeRateFetchService.ts` 的双源容灾模式，内容抓取服务采用以下容灾策略：

- **单源失败不影响整体**：每个 RSS Feed 独立抓取，一个 Feed 失败不影响其他 Feed 的处理。
- **重试机制**：每个 Feed 最多重试 2 次，使用 `AbortSignal.timeout(15000)` 防止请求挂起。
- **日志记录**：所有抓取结果（成功/跳过/失败）记录到 `console.log`，格式与现有 Cron Job 一致。
- **LLM 降级**：若 LLM 调用失败，直接存储原始英文内容（`contentCn` 留空），不阻塞入库流程。

---

## 8. 前端改造方案

### 8.1. 新建 Portal tRPC 路由

在 `server/portal/routers/` 下新建 `portalHelpCenterRouter.ts`：

```typescript
// server/portal/routers/portalHelpCenterRouter.ts
export const portalHelpCenterRouter = portalRouter({
  // 获取所有分类（用于渲染 Tab）
  listCategories: publicProcedure.query(async () => { ... }),

  // 按分类获取文章列表（支持分页和搜索）
  listArticles: publicProcedure
    .input(z.object({
      categorySlug: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ input }) => { ... }),

  // 获取 Dashboard 推送通知（未推送的最新文章）
  getPendingPushNotifications: protectedPortalProcedure
    .query(async () => { ... }),

  // 标记文章推送通知已读
  markPushNotificationRead: protectedPortalProcedure
    .input(z.object({ articleId: z.number() }))
    .mutation(async ({ input }) => { ... }),
});
```

### 8.2. 改造 `PortalHelpCenter.tsx`

主要变更点如下：

- **移除**：删除所有静态数据数组 (`GUIDE_SECTIONS`, `FAQ_ITEMS`, `UPDATE_ENTRIES`)。
- **新增**：使用 `portalTrpc.helpCenter.listCategories.useQuery()` 动态生成 Tab 列表。
- **新增**：使用 `portalTrpc.helpCenter.listArticles.useQuery({ categorySlug, search })` 获取文章内容。
- **保留**：现有的搜索框、Accordion 展开/折叠、双语切换等 UI 交互逻辑。
- **新增**：文章来源和发布时间的展示，增强内容可信度。

### 8.3. Dashboard 推送通知

在 `PortalDashboard.tsx` 顶部添加可关闭的通知栏：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔔 Help Center 有 3 条新内容  ·  [查看全球合规动态]  ·  [查看市场洞察]  ·  [×] │
└─────────────────────────────────────────────────────────────────────────────┘
```

通知栏的行为规则：
- 仅在存在 `isPushed = false` 的文章时显示。
- 用户点击"查看"链接后，跳转至帮助中心对应分类，并将相关文章的 `isPushed` 标记为 `true`。
- 用户点击"×"关闭后，将所有未推送文章标记为已推送，7 天内不再显示同类通知。
- 通知状态存储在 `localStorage`，避免每次刷新都重新显示。

---

## 9. 实施路线图

### 第一阶段：后端基础建设（预计 2-3 小时）

1. 在 `drizzle/schema.ts` 中添加 `helpCategories` 和 `helpArticles` 两张表定义。
2. 执行 `pnpm db:push` 生成并应用数据库迁移。
3. 插入初始 5 个分类的 Seed 数据。
4. 在 `server/db.ts` 中添加 `help_articles` 相关的 CRUD 辅助函数。
5. 创建 `server/portal/routers/portalHelpCenterRouter.ts` 并实现 `listCategories` 和 `listArticles` 过程。
6. 在 `server/portal/portalRouter.ts` 中注册新路由。
7. 将 `PortalHelpCenter.tsx` 中的现有静态内容通过脚本迁移到数据库作为初始数据。

### 第二阶段：前端动态化改造（预计 1-2 小时）

1. 修改 `PortalHelpCenter.tsx`，移除静态数据，改为通过 tRPC 动态获取内容。
2. 确保搜索功能在新数据结构下正常工作（服务端搜索）。
3. 添加文章来源、发布时间等元信息展示。
4. 编写 Vitest 测试，覆盖 `listCategories` 和 `listArticles` 过程。

### 第三阶段：自动化引擎（预计 3-4 小时）

1. 安装 `fast-xml-parser` 依赖用于 RSS 解析。
2. 创建 `server/services/helpContentService.ts`，实现 RSS 抓取、LLM 处理和数据库写入逻辑。
3. 实现 `CHANGELOG.md` 解析逻辑，自动同步版本更新到帮助中心。
4. 在 `server/cronJobs.ts` 中添加"每日合规动态抓取"和"每周市场洞察周报"两个 Cron Job。
5. 在服务器启动逻辑中调用 `syncChangelogToHelpCenter()`。

### 第四阶段：Dashboard 推送通知（预计 1-2 小时）

1. 在 `portalHelpCenterRouter.ts` 中实现 `getPendingPushNotifications` 和 `markPushNotificationRead` 过程。
2. 在 `PortalDashboard.tsx` 中添加通知栏组件。
3. 实现通知已读状态的本地存储逻辑。
4. 添加中英文 i18n 翻译键到 `client/src/lib/i18n.ts`。

---

## 10. 注意事项与风险管理

### 10.1. 合规风险

自动抓取的外部内容仅作为**参考信息**展示，不构成法律建议。建议在帮助中心的"全球合规动态"和"市场洞察"板块顶部添加免责声明：

> "以下内容由系统自动聚合自公开资讯源，仅供参考，不构成法律或税务建议。如需专业咨询，请联系您的 GEA 客户经理。"

### 10.2. LLM 调用成本控制

为避免 LLM 调用成本过高，建议：
- 每次 Cron Job 运行最多处理 **20 篇**新文章（通过 `ARTICLES_PER_RUN` 常量控制）。
- 仅对 P0/P1 优先级的数据源使用 LLM 处理；P2 数据源直接存储原文。
- 对超过 2000 字的文章，先截断到 2000 字再传入 LLM。

### 10.3. 数据库存储规划

预计每日新增约 10-20 篇文章，每篇平均 2KB，每年约 7-14MB。这对于 TiDB Serverless 来说完全可控，无需特别优化。建议设置一个清理策略：保留最近 **2 年**的文章，更早的文章自动归档（设置 `isPublished = false`）。

### 10.4. 遵循现有规范

所有代码变更必须遵循以下项目规范：
- **双语翻译**：所有新增 UI 文本必须在 `client/src/lib/i18n.ts` 中添加中英文翻译键。
- **Vitest 测试**：所有新增 tRPC 过程必须有对应的测试，并使用 `TestCleanup` 清理测试数据。
- **Portal 数据隔离**：新增的 Portal 路由必须使用 `protectedPortalProcedure`，确保数据按 `customerId` 隔离（注意：帮助中心内容是全局共享的，无需按 `customerId` 过滤，可使用 `publicProcedure`）。
- **不修改 `server/_core/`**：所有新增服务文件放在 `server/services/` 目录下。
