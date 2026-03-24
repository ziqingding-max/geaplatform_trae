#!/bin/bash
# =============================================================================
# GEA EOR SaaS — 生产环境标准化部署脚本
# =============================================================================
# 使用方法:
#   bash scripts/deploy-prod.sh              # 默认部署 main 分支
#   bash scripts/deploy-prod.sh dev          # 部署指定分支
#   bash scripts/deploy-prod.sh main --no-cache  # 强制无缓存构建（依赖变更时使用）
#
# 功能:
#   1. 环境预检（磁盘空间、.env 文件、Docker 服务）
#   2. 数据库自动备份 + 旧备份清理（保留最近 10 个）
#   3. 智能构建（默认使用缓存，--no-cache 参数强制全量构建）
#   4. 最小停机窗口（先 build 再 down/up）
#   5. 健康检查轮询（替代固定 sleep）
#   6. Migration 日志验证
#   7. 部署后冒烟测试
#   8. 失败自动回滚
#   9. 部署日志记录
# =============================================================================

set -euo pipefail

# ─── 配置 ───────────────────────────────────────────────────────────────────
PROJECT_DIR="/opt/geaplatform_trae"
COMPOSE_FILE="docker-compose.prod.yml"
APP_CONTAINER="gea-saas-app"
BACKUP_DIR="${PROJECT_DIR}/backups"
DEPLOY_LOG="${PROJECT_DIR}/deploy.log"
MAX_BACKUPS=10
HEALTH_CHECK_TIMEOUT=120  # 秒
HEALTH_CHECK_INTERVAL=5   # 秒
MIN_DISK_MB=2000           # 最低磁盘空间要求 (MB)

# ─── 参数解析 ─────────────────────────────────────────────────────────────
BRANCH="${1:-main}"
NO_CACHE=""
for arg in "$@"; do
  if [ "$arg" = "--no-cache" ]; then
    NO_CACHE="--no-cache"
  fi
done

# ─── 工具函数 ─────────────────────────────────────────────────────────────
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
TIMESTAMP_FILE=$(date '+%Y%m%d_%H%M%S')

log()   { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$DEPLOY_LOG"; }
info()  { log "ℹ️  $1"; }
ok()    { log "✅ $1"; }
warn()  { log "⚠️  $1"; }
fail()  { log "❌ $1"; }

# ─── 回滚函数 ─────────────────────────────────────────────────────────────
rollback() {
  fail "部署失败，开始自动回滚..."

  if [ -n "${PREV_COMMIT:-}" ]; then
    info "回滚代码到: $PREV_COMMIT"
    cd "$PROJECT_DIR"
    git checkout "$PREV_COMMIT" 2>/dev/null || git reset --hard "$PREV_COMMIT"

    info "使用旧代码重新构建..."
    docker compose -f "$COMPOSE_FILE" build 2>>"$DEPLOY_LOG"
    docker compose -f "$COMPOSE_FILE" down 2>>"$DEPLOY_LOG"
    docker compose -f "$COMPOSE_FILE" up -d 2>>"$DEPLOY_LOG"

    warn "已回滚到版本: $PREV_COMMIT"
    warn "请检查问题后重新部署"
  else
    fail "无法回滚：未记录到先前版本"
    fail "请手动检查并恢复"
  fi

  exit 1
}

# =============================================================================
# 开始部署
# =============================================================================
echo ""
echo "=============================================="
echo "  GEA SaaS 生产环境部署"
echo "  时间: $TIMESTAMP"
echo "  分支: $BRANCH"
echo "  构建: ${NO_CACHE:-使用缓存}"
echo "=============================================="
echo ""

echo "---" >> "$DEPLOY_LOG"
log "===== 部署开始 ===== 分支: $BRANCH"

cd "$PROJECT_DIR"

# =============================================================================
# 阶段 0: 环境预检
# =============================================================================
info "阶段 0/7: 环境预检"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
  fail "Docker 未运行，请先启动 Docker"
  exit 1
fi
ok "Docker 服务正常"

# 检查 docker-compose 文件
if [ ! -f "$COMPOSE_FILE" ]; then
  fail "找不到 $COMPOSE_FILE"
  exit 1
fi
ok "Compose 配置文件存在"

# 检查 .env 文件和关键变量
if [ -f ".env" ]; then
  MISSING_VARS=""
  for VAR in JWT_SECRET ADMIN_BOOTSTRAP_PASSWORD; do
    if ! grep -q "^${VAR}=" .env 2>/dev/null; then
      MISSING_VARS="${MISSING_VARS} ${VAR}"
    fi
  done
  if [ -n "$MISSING_VARS" ]; then
    warn ".env 中缺少关键变量:${MISSING_VARS}"
  else
    ok ".env 关键变量已配置"
  fi
else
  warn ".env 文件不存在，将使用 docker-compose 中的默认值"
fi

# 检查磁盘空间
AVAIL_MB=$(df -m "$PROJECT_DIR" | awk 'NR==2 {print $4}')
if [ "$AVAIL_MB" -lt "$MIN_DISK_MB" ]; then
  fail "磁盘空间不足: ${AVAIL_MB}MB 可用，需要至少 ${MIN_DISK_MB}MB"
  exit 1
fi
ok "磁盘空间充足: ${AVAIL_MB}MB 可用"

echo ""

# =============================================================================
# 阶段 1: 拉取代码
# =============================================================================
info "阶段 1/7: 拉取最新代码"

PREV_COMMIT=$(git rev-parse HEAD)
info "当前版本: $PREV_COMMIT"

git fetch origin "$BRANCH" 2>>"$DEPLOY_LOG"
git checkout "$BRANCH" 2>>"$DEPLOY_LOG"
git pull origin "$BRANCH" 2>>"$DEPLOY_LOG"

NEW_COMMIT=$(git rev-parse HEAD)
if [ "$PREV_COMMIT" = "$NEW_COMMIT" ]; then
  info "代码无变更 ($NEW_COMMIT)，继续部署以确保镜像同步"
else
  ok "代码已更新: ${PREV_COMMIT:0:8} → ${NEW_COMMIT:0:8}"
  # 显示变更摘要
  info "变更文件:"
  git diff --stat "$PREV_COMMIT" "$NEW_COMMIT" 2>/dev/null | tail -5
fi

echo ""

# =============================================================================
# 阶段 2: 备份数据库
# =============================================================================
info "阶段 2/7: 备份数据库"

mkdir -p "$BACKUP_DIR"
BACKUP_FILE="${BACKUP_DIR}/production_${TIMESTAMP_FILE}.db"

if docker ps --format '{{.Names}}' | grep -q "^${APP_CONTAINER}$"; then
  docker cp "${APP_CONTAINER}:/app/data/production.db" "$BACKUP_FILE" 2>/dev/null && \
    ok "数据库已备份: $(basename $BACKUP_FILE) ($(du -h "$BACKUP_FILE" | cut -f1))" || \
    warn "备份失败（数据库文件可能不存在，首次部署可忽略）"
else
  warn "容器未运行，跳过备份（首次部署可忽略）"
fi

# 清理旧备份，保留最近 MAX_BACKUPS 个
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/production_*.db 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
  REMOVE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
  ls -1t "$BACKUP_DIR"/production_*.db | tail -n "$REMOVE_COUNT" | xargs rm -f
  info "已清理 ${REMOVE_COUNT} 个旧备份，保留最近 ${MAX_BACKUPS} 个"
fi

echo ""

# =============================================================================
# 阶段 3: 构建镜像（服务仍在运行，不影响线上）
# =============================================================================
info "阶段 3/7: 构建 Docker 镜像"
if [ -n "$NO_CACHE" ]; then
  info "使用 --no-cache 全量构建（耗时较长）"
fi

BUILD_START=$(date +%s)
if ! docker compose -f "$COMPOSE_FILE" build $NO_CACHE 2>>"$DEPLOY_LOG"; then
  fail "镜像构建失败"
  warn "线上服务未受影响（尚未停止旧容器）"
  warn "请检查构建日志: $DEPLOY_LOG"
  exit 1
fi
BUILD_END=$(date +%s)
BUILD_DURATION=$((BUILD_END - BUILD_START))
ok "镜像构建完成 (耗时 ${BUILD_DURATION}s)"

echo ""

# =============================================================================
# 阶段 4: 停止旧容器 & 启动新容器（停机窗口开始）
# =============================================================================
info "阶段 4/7: 重启服务（停机窗口开始）"
DOWNTIME_START=$(date +%s)

docker compose -f "$COMPOSE_FILE" down 2>>"$DEPLOY_LOG"
info "旧容器已停止"

docker compose -f "$COMPOSE_FILE" up -d 2>>"$DEPLOY_LOG"
info "新容器已启动，等待健康检查..."

echo ""

# =============================================================================
# 阶段 5: 健康检查
# =============================================================================
info "阶段 5/7: 健康检查"

ELAPSED=0
HEALTHY=false

while [ "$ELAPSED" -lt "$HEALTH_CHECK_TIMEOUT" ]; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$APP_CONTAINER" 2>/dev/null || echo "starting")

  if [ "$STATUS" = "healthy" ]; then
    DOWNTIME_END=$(date +%s)
    DOWNTIME=$((DOWNTIME_END - DOWNTIME_START))
    HEALTHY=true
    ok "健康检查通过！停机时间: ${DOWNTIME}s"
    break
  fi

  ELAPSED=$((ELAPSED + HEALTH_CHECK_INTERVAL))
  printf "\r  等待中... %ds/%ds (状态: %s)  " "$ELAPSED" "$HEALTH_CHECK_TIMEOUT" "$STATUS"
  sleep "$HEALTH_CHECK_INTERVAL"
done

echo ""

if [ "$HEALTHY" = false ]; then
  fail "健康检查超时 (${HEALTH_CHECK_TIMEOUT}s)"
  info "容器日志:"
  docker logs "$APP_CONTAINER" --tail 30 2>&1 | tee -a "$DEPLOY_LOG"
  rollback
fi

echo ""

# =============================================================================
# 阶段 6: 验证 Migration & 冒烟测试
# =============================================================================
info "阶段 6/7: Migration 验证 & 冒烟测试"

# 检查 migration 日志
info "Migration 执行日志:"
docker logs "$APP_CONTAINER" 2>&1 | grep -E "\[Entrypoint\]|\[Migration\]" | tail -20

echo ""

# 冒烟测试：检查主页是否可访问
SMOKE_OK=true
if docker exec "$APP_CONTAINER" wget --no-verbose --tries=2 --spider http://localhost:3000/ 2>/dev/null; then
  ok "冒烟测试通过: 主页可访问"
else
  fail "冒烟测试失败: 主页不可访问"
  SMOKE_OK=false
fi

if [ "$SMOKE_OK" = false ]; then
  warn "冒烟测试未通过，但服务健康检查已通过"
  warn "建议手动检查服务状态，如需回滚执行:"
  warn "  cd $PROJECT_DIR && git checkout $PREV_COMMIT && bash scripts/deploy-prod.sh"
fi

echo ""

# =============================================================================
# 阶段 7: 清理 & 报告
# =============================================================================
info "阶段 7/7: 清理 & 部署报告"

# 清理悬空镜像
DANGLING=$(docker images -f "dangling=true" -q | wc -l)
if [ "$DANGLING" -gt 0 ]; then
  docker image prune -f > /dev/null 2>&1
  info "已清理 ${DANGLING} 个悬空镜像"
fi

echo ""
echo "=============================================="
echo "  部署完成"
echo "=============================================="
echo "  分支:     $BRANCH"
echo "  版本:     ${PREV_COMMIT:0:8} → ${NEW_COMMIT:0:8}"
echo "  构建耗时: ${BUILD_DURATION}s"
echo "  停机时间: ${DOWNTIME:-未知}s"
echo "  备份文件: $(basename "${BACKUP_FILE}" 2>/dev/null || echo '无')"
echo "  部署日志: $DEPLOY_LOG"
echo "=============================================="
echo "  回滚命令: cd $PROJECT_DIR && git checkout $PREV_COMMIT && bash scripts/deploy-prod.sh"
echo "=============================================="
echo ""

# 显示服务状态
docker compose -f "$COMPOSE_FILE" ps

log "===== 部署完成 ===== ${PREV_COMMIT:0:8} → ${NEW_COMMIT:0:8} 停机 ${DOWNTIME:-?}s"
