# GEA Platform

GEA Platform 是一个全球化的名义雇主 (EOR) 和代理记录 (AOR) 平台。本系统通过三个独立的门户连接客户、员工/承包商和内部运营团队，提供从入职、薪酬计算、费用报销到合规管理的端到端解决方案。

## 🎯 3 小时快速上手指南

为了让新加入的开发人员能够快速理解系统并启动到生产环境，请严格按照以下顺序阅读和操作：

### 第一步：理解业务逻辑与架构 (1 小时)
在编写任何代码之前，**必须**先阅读以下两份核心文档。它们是系统的单点真相 (SSOT)：
1. **[核心业务逻辑与状态流转 (CORE_BUSINESS_LOGIC.md)](./docs/01_business/CORE_BUSINESS_LOGIC.md)**
   - 详细解释了 Employee (EOR) 与 Contractor (AOR) 的核心区别。
   - 包含了所有业务实体的状态机（入职、离职、发票、请假等）。
   - 解释了月度运营时间线和 Cron Job 的执行顺序。
2. **[技术架构与目录结构 (TECHNICAL_ARCHITECTURE.md)](./docs/02_technical/TECHNICAL_ARCHITECTURE.md)**
   - 解释了 Admin、Portal、Worker 三端架构。
   - 介绍了 PostgreSQL 16 + Drizzle ORM 的数据层设计。

### 第二步：本地开发环境启动 (1 小时)
1. 确保本地已安装 **Node.js 22** 和 **Docker**。
2. 复制环境变量文件：`cp .env.example .env`
3. 启动本地 PostgreSQL 数据库：`docker-compose up -d`
4. 安装依赖：`npm install` (或 `pnpm install`)
5. 执行数据库迁移：`npm run db:push`
6. 启动开发服务器：`npm run dev`
   - Admin 端: `http://localhost:5000`
   - Portal 端: `http://app.localhost:5000`
   - Worker 端: `http://worker.localhost:5000`

### 第三步：生产环境部署 (1 小时)
请参考 **[部署指南 (DEPLOYMENT_GUIDE.md)](./docs/02_technical/DEPLOYMENT_GUIDE.md)**。
- 生产环境目前部署在腾讯云。
- 部署分为“首次服务器初始化”和“日常 CI/CD 滚动更新”两个阶段。

---

## 📚 文档导航地图

为了保持根目录的整洁，所有详细文档均已归类到 `docs/` 目录下。

### 业务文档 (`docs/01_business/`)
- `CORE_BUSINESS_LOGIC.md`: 核心业务逻辑与状态流转 (SSOT)
- `PRODUCT.md`: 产品功能清单与路线图
- `WALLET-SYSTEM-SPEC-CN.md`: 钱包与资金系统详细规格

### 技术文档 (`docs/02_technical/`)
- `TECHNICAL_ARCHITECTURE.md`: 技术架构与目录结构
- `CONVENTIONS.md`: 代码规范与开发公约
- `DEPLOYMENT_GUIDE.md`: 生产环境部署指南
- `TESTING_STRATEGY.md`: 测试策略 (Jest 30 + ts-jest)

### 归档文档 (`docs/00_archive/`)
- 包含历史重构方案、旧版部署指南和临时笔记。

---

## 🛠 技术栈概览

- **前端**: React 18, Wouter, Tailwind CSS, shadcn/ui, React Query
- **后端**: Node.js 22, Express, tRPC
- **数据库**: PostgreSQL 16, Drizzle ORM
- **测试**: Jest 30, ts-jest
- **部署**: Docker, Nginx, PM2

---

## ⚠️ 开发红线与约束

作为核心开发团队的一员，请严格遵守以下红线（详见 `docs/PROJECT-INSTRUCTIONS.md`）：
1. **文档即单点真相 (SSOT)**：修改业务逻辑前，必须先更新 `CORE_BUSINESS_LOGIC.md`。
2. **绝对禁止测试数据污染**：所有测试必须在 `afterAll` 中调用 `TestCleanup` 清理数据。
3. **标准五步开发流**：Schema -> DB Query/Service -> tRPC Procedure -> Frontend UI -> Tests。
