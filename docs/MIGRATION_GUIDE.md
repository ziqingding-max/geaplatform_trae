# GEA 平台 — SQLite 到 PostgreSQL 迁移部署指南

## 概述

本指南适用于将 GEA EOR SaaS 平台从 SQLite 数据库迁移到 PostgreSQL 数据库的生产环境部署。迁移后，系统将使用 Docker 容器化的 PostgreSQL 16 作为数据存储，支持高并发和企业级稳定性。

## 前置条件

在开始迁移之前，请确认以下条件已满足：

| 条件 | 说明 |
|------|------|
| 服务器 | 阿里云 ECS 或同等配置，已安装 Docker 和 Docker Compose |
| 磁盘空间 | 至少 2GB 可用空间（PostgreSQL 数据卷 + 备份） |
| 代码分支 | 已合并 `feature/migrate-sqlite-to-postgresql` 到 `main` |
| 维护窗口 | 建议安排 15-30 分钟的维护窗口 |

## 迁移步骤

### 第一步：更新 .env 配置

SSH 登录到生产服务器后，进入项目目录并编辑 `.env` 文件：

```bash
cd /opt/geaplatform_trae
vim .env
```

在 `.env` 中**新增**以下三个变量（保留其他现有变量不变）：

```env
# PostgreSQL Docker 配置（新增）
POSTGRES_DB=gea_production
POSTGRES_USER=gea
POSTGRES_PASSWORD=<你的强密码>
```

生成强密码的命令：

```bash
openssl rand -hex 24
```

> **注意：** `DATABASE_URL` 不需要手动设置。`docker-compose.prod.yml` 会自动使用上述三个变量拼接出完整的连接字符串传给应用容器。

### 第二步：备份现有 SQLite 数据库

在执行任何操作之前，**务必手动备份**当前的 SQLite 数据库：

```bash
# 从运行中的容器复制 SQLite 数据库
mkdir -p /opt/geaplatform_trae/data
docker cp gea-saas-app:/app/data/production.db /opt/geaplatform_trae/data/production.db

# 额外备份一份到 backups 目录
mkdir -p /opt/geaplatform_trae/backups
cp /opt/geaplatform_trae/data/production.db /opt/geaplatform_trae/backups/sqlite_manual_backup_$(date +%Y%m%d_%H%M%S).db

# 确认备份文件存在且大小正常
ls -lh /opt/geaplatform_trae/data/production.db
ls -lh /opt/geaplatform_trae/backups/sqlite_manual_backup_*.db
```

### 第三步：执行迁移部署（一条命令）

```bash
cd /opt/geaplatform_trae && bash scripts/deploy-prod.sh main --no-cache --migrate-sqlite
```

**参数说明：**

| 参数 | 作用 |
|------|------|
| `main` | 部署 main 分支 |
| `--no-cache` | 强制全量构建（因为依赖从 libsql 变为 postgres，必须无缓存构建） |
| `--migrate-sqlite` | 启用 SQLite 数据迁移模式 |

**脚本将自动执行以下流程：**

1. 环境预检（检查 `.env`、Docker、磁盘空间、SQLite 文件）
2. 备份 SQLite 数据库
3. 拉取最新代码
4. 构建新的 Docker 镜像（包含 PostgreSQL 驱动）
5. 停止旧容器，启动新容器（PostgreSQL + App + Nginx）
6. 健康检查
7. **推送表结构到 PostgreSQL**（`drizzle-kit push`）
8. **执行 SQLite → PostgreSQL 数据迁移**
9. 重启应用加载迁移后的数据
10. 冒烟测试
11. 清理和报告

### 第四步：验证迁移结果

部署脚本完成后，手动验证以下内容：

```bash
# 1. 检查所有容器是否正常运行
docker compose -f docker-compose.prod.yml ps

# 2. 检查 PostgreSQL 是否可连接
docker exec gea-saas-postgres pg_isready -U gea

# 3. 检查数据库中的表和数据量
docker exec gea-saas-postgres psql -U gea -d gea_production -c "\dt"
docker exec gea-saas-postgres psql -U gea -d gea_production -c "SELECT COUNT(*) FROM employees;"
docker exec gea-saas-postgres psql -U gea -d gea_production -c "SELECT COUNT(*) FROM customers;"
docker exec gea-saas-postgres psql -U gea -d gea_production -c "SELECT COUNT(*) FROM invoices;"

# 4. 检查应用日志是否有错误
docker logs gea-saas-app --tail 50

# 5. 通过浏览器访问系统，检查核心功能
#    - 登录管理后台
#    - 查看员工列表
#    - 查看发票列表
#    - 查看薪资运行记录
```

## 后续常规部署

迁移完成后，后续的常规部署**不再需要** `--migrate-sqlite` 参数：

```bash
# 常规部署（与之前用法完全一致）
cd /opt/geaplatform_trae && bash scripts/deploy-prod.sh

# 指定分支部署
cd /opt/geaplatform_trae && bash scripts/deploy-prod.sh dev

# 强制无缓存构建
cd /opt/geaplatform_trae && bash scripts/deploy-prod.sh main --no-cache
```

常规部署时，脚本会自动使用 `pg_dump` 备份 PostgreSQL 数据库（替代之前的 SQLite 文件复制）。

## 回滚方案

### 情况 A：迁移后发现应用有问题

如果迁移后应用出现问题，但数据已经在 PostgreSQL 中：

```bash
# 查看应用日志定位问题
docker logs gea-saas-app --tail 100

# 如果是代码问题，回滚到上一个版本
cd /opt/geaplatform_trae && git checkout <上一个commit> && bash scripts/deploy-prod.sh --no-cache
```

### 情况 B：需要完全回退到 SQLite 版本

如果需要完全回退到 SQLite 版本（极端情况）：

```bash
# 1. 停止所有容器
docker compose -f docker-compose.prod.yml down

# 2. 回退代码到迁移前的版本
git checkout <迁移前的commit hash>

# 3. 恢复 SQLite 备份
cp /opt/geaplatform_trae/backups/sqlite_manual_backup_*.db /opt/geaplatform_trae/data/production.db

# 4. 使用旧的部署方式重新部署
bash scripts/deploy-prod.sh --no-cache
```

### 情况 C：PostgreSQL 数据损坏，需要从备份恢复

```bash
# 1. 找到最近的备份文件
ls -lt /opt/geaplatform_trae/backups/pg_production_*.sql.gz

# 2. 停止应用容器（保持 PostgreSQL 运行）
docker compose -f docker-compose.prod.yml stop app

# 3. 恢复备份
gunzip -c /opt/geaplatform_trae/backups/pg_production_XXXXXXXX_XXXXXX.sql.gz | \
  docker exec -i gea-saas-postgres psql -U gea -d gea_production

# 4. 重启应用
docker compose -f docker-compose.prod.yml start app
```

## 数据持久化说明

PostgreSQL 数据存储在 Docker 命名卷 `gea_pgdata` 中：

```bash
# 查看卷信息
docker volume inspect geaplatform_trae_gea_pgdata

# 卷数据存储在宿主机的 /var/lib/docker/volumes/ 目录下
# 即使容器被删除重建，数据也不会丢失（只要不执行 docker volume rm）
```

> **重要提醒：** `docker compose down` 不会删除数据卷。只有 `docker compose down -v` 才会删除卷（**绝对不要在生产环境执行 `-v` 参数**）。

## 架构变更对比

| 项目 | 迁移前（SQLite） | 迁移后（PostgreSQL） |
|------|------------------|---------------------|
| 数据库 | SQLite 文件 (`production.db`) | PostgreSQL 16 Docker 容器 |
| 数据存储 | 容器内 `/app/data/production.db` | Docker 命名卷 `gea_pgdata` |
| 备份方式 | `docker cp` 复制文件 | `pg_dump` 导出 SQL |
| 并发支持 | 单写锁（不适合多用户） | MVCC 多版本并发控制 |
| 连接方式 | 文件路径 | TCP 连接字符串 |
| 容器数量 | 3 个（app + nginx + certbot） | 4 个（postgres + app + nginx + certbot） |
