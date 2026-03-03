#!/bin/bash
# 快速部署脚本 - 简化版
# 适用于已经准备好的ECS环境

set -e

echo "🚀 GEA EOR SaaS 快速部署脚本"
echo "=================================="

# 检查是否为root用户
if [[ $EUID -ne 0 ]]; then
   echo "❌ 请使用root用户运行此脚本"
   exit 1
fi

# 获取ECS公网IP
ECS_IP=$(curl -s ifconfig.me)
echo "🌐 ECS公网IP: $ECS_IP"

# 1. 系统更新
echo "📦 正在更新系统..."
apt update && apt upgrade -y

# 2. 安装基础软件
echo "🔧 正在安装基础软件..."
apt install -y curl git vim nginx mysql-server nodejs npm

# 3. 安装Node.js 22
echo "📋 正在安装Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 4. 安装全局包
echo "📥 正在安装全局npm包..."
npm install -g pnpm pm2

# 5. MySQL配置
echo "🗄️ 正在配置MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS gea_eor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true
mysql -e "CREATE USER IF NOT EXISTS 'geauser'@'localhost' IDENTIFIED BY 'GeaEor@2024!';" || true
mysql -e "GRANT ALL PRIVILEGES ON gea_eor_db.* TO 'geauser'@'localhost';" || true
mysql -e "FLUSH PRIVILEGES;"

# 6. 创建应用目录
echo "📁 正在创建应用目录..."
mkdir -p /opt/gea-eor
cd /opt/gea-eor

# 7. 克隆代码（请替换为实际仓库地址）
echo "📋 正在克隆代码..."
if [ -d "geaplatform_trae" ]; then
    echo "代码目录已存在，正在更新..."
    cd geaplatform_trae
    git pull origin main
else
    echo "请提供您的代码仓库地址:"
    read -r REPO_URL
    git clone "$REPO_URL" geaplatform_trae
    cd geaplatform_trae
fi

# 8. 安装依赖
echo "⚙️ 正在安装项目依赖..."
pnpm install

# 9. 创建环境配置
echo "🔧 正在创建环境配置..."
cat > .env << EOF
# 基础配置
NODE_ENV=production
PORT=3000
JWT_SECRET=$(openssl rand -base64 32)

# 数据库配置
DATABASE_URL=mysql://geauser:GeaEor@2024!@localhost:3306/gea_eor_db

# 文件存储（本地存储）
STORAGE_TYPE=local
UPLOAD_DIR=/opt/gea-eor/uploads

# 邮件配置（测试环境）
EMAIL_SMTP_HOST=localhost
EMAIL_FROM=noreply@your-domain.com
EMAIL_ADMIN=admin@your-domain.com

# AI服务（测试环境）
AI_PROVIDER=mock

# 系统配置
DEFAULT_CURRENCY=CNY
DEFAULT_TIMEZONE=Asia/Shanghai
EOF

# 10. 数据库迁移
echo "🔄 正在执行数据库迁移..."
pnpm db:push || echo "⚠️ 数据库迁移失败，请手动检查"

# 11. 构建应用
echo "🏗️ 正在构建应用..."
pnpm build

# 12. 配置Nginx
echo "🌐 正在配置Nginx..."
cat > /etc/nginx/sites-available/gea-eor << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /opt/gea-eor/geaplatform_trae/dist/public;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用Nginx配置
ln -sf /etc/nginx/sites-available/gea-eor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 13. 启动应用
echo "🚀 正在启动应用..."
pm2 start dist/index.js --name "gea-eor-app" || echo "⚠️ 应用启动失败"
pm2 save

# 14. 配置防火墙
echo "🔥 正在配置防火墙..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 15. 验证部署
echo "🔍 正在验证部署..."
sleep 3

# 检查状态
if pm2 status | grep -q "online"; then
    echo "✅ 应用启动成功"
else
    echo "❌ 应用启动失败"
fi

# 获取公网IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-ecs-ip")

# 最终输出
echo ""
echo "🎉 部署完成！"
echo "=================================="
echo "应用状态: $(pm2 status | grep gea-eor-app | awk '{print $4}' 2>/dev/null || echo 'unknown')"
echo "访问地址: http://$PUBLIC_IP"
echo "管理命令: pm2 {start|stop|restart|logs} gea-eor-app"
echo "日志查看: pm2 logs gea-eor-app --lines 50"
echo ""
echo "📋 后续步骤:"
echo "1. 访问 http://$PUBLIC_IP 测试应用"
echo "2. 配置域名（可选）"
echo "3. 设置SSL证书（可选）"
echo "4. 查看应用日志确认运行状态"
echo ""
echo "🆘 故障排除:"
echo "- 查看日志: pm2 logs gea-eor-app"
echo "- 重启应用: pm2 restart gea-eor-app"
echo "- 检查状态: pm2 status"
echo "- 系统资源: htop"
echo ""
echo "🚀 部署脚本执行完成！"