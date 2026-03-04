#!/bin/bash
# =============================================================================
# GEA EOR SaaS — 启用 SSL/HTTPS 脚本
# =============================================================================
# 使用前提：
#   1. 域名已解析到服务器 IP
#   2. 已通过 gea ssl 命令成功申请 SSL 证书
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[✅ OK]${NC} $1"; }
error() { echo -e "${RED}[❌ ERROR]${NC} $1"; exit 1; }

# 获取域名
read -p "请输入管理后台域名（如 admin.geahr.com）: " ADMIN_DOMAIN
read -p "请输入客户门户域名（如 app.geahr.com，如果相同请直接回车）: " PORTAL_DOMAIN
PORTAL_DOMAIN=${PORTAL_DOMAIN:-$ADMIN_DOMAIN}

PROJECT_DIR="/opt/gea-saas/geaplatform_trae"
cd ${PROJECT_DIR}

# 检查证书是否存在
if [ ! -d "certbot/conf/live/${ADMIN_DOMAIN}" ]; then
    error "未找到 ${ADMIN_DOMAIN} 的 SSL 证书，请先运行 gea ssl 申请证书"
fi

info "正在生成 HTTPS Nginx 配置..."

cat > nginx/conf.d/gea-saas.conf << EOF
# =============================================================================
# GEA EOR SaaS — Nginx HTTPS 配置
# =============================================================================

upstream gea_app {
    server app:3000;
    keepalive 32;
}

# ─── HTTP → HTTPS 重定向 ─────────────────────────────────────────────────
server {
    listen 80;
    server_name ${ADMIN_DOMAIN} ${PORTAL_DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# ─── 管理后台 HTTPS ──────────────────────────────────────────────────────
server {
    listen 443 ssl;
    http2 on;
    server_name ${ADMIN_DOMAIN};

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/${ADMIN_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${ADMIN_DOMAIN}/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 安全头
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 50m;

    location /api/ {
        proxy_pass http://gea_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    location / {
        proxy_pass http://gea_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://gea_app;
        proxy_set_header Host \$host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 如果管理后台和门户使用不同域名，添加门户的 server block
if [ "${ADMIN_DOMAIN}" != "${PORTAL_DOMAIN}" ]; then
    # 检查门户域名证书
    if [ -d "certbot/conf/live/${PORTAL_DOMAIN}" ]; then
        cat >> nginx/conf.d/gea-saas.conf << EOF

# ─── 客户门户 HTTPS ──────────────────────────────────────────────────────
server {
    listen 443 ssl;
    http2 on;
    server_name ${PORTAL_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${PORTAL_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${PORTAL_DOMAIN}/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 50m;

    location /api/ {
        proxy_pass http://gea_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    location / {
        proxy_pass http://gea_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://gea_app;
        proxy_set_header Host \$host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
        ok "已添加门户域名 ${PORTAL_DOMAIN} 的 HTTPS 配置"
    else
        warn "未找到 ${PORTAL_DOMAIN} 的证书，请单独申请"
    fi
fi

# 重启 Nginx
info "重启 Nginx 使 HTTPS 配置生效..."
docker compose -f docker-compose.prod.yml restart nginx

ok "HTTPS 已启用！"
echo ""
echo "  管理后台：https://${ADMIN_DOMAIN}"
if [ "${ADMIN_DOMAIN}" != "${PORTAL_DOMAIN}" ]; then
    echo "  客户门户：https://${PORTAL_DOMAIN}"
fi
echo ""
