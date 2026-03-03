#!/bin/bash
# GEA EOR SaaS 一键部署脚本
# 适用于阿里云ECS Ubuntu 22.04 LTS

set -e  # 遇到错误立即退出

echo "🚀 开始部署 GEA EOR SaaS 系统..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# 检查是否为root用户
if [[ $EUID -ne 0 ]]; then
   error "请使用root用户运行此脚本"
fi

# 检查系统版本
if ! grep -q "Ubuntu 22.04" /etc/os-release; then
    warn "此脚本针对Ubuntu 22.04 LTS优化，其他版本可能需要修改"
fi

info "系统检查完成"

# 更新系统
info "正在更新系统..."
apt update && apt upgrade -y

# 安装基础软件
info "正在安装基础软件..."
apt install -y curl wget git vim htop nginx mysql-server redis-tools ufw

# 安装Node.js 22
info "正在安装Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 验证安装
node_version=$(node --version)
npm_version=$(npm --version)
info "Node.js版本: $node_version"
info "npm版本: $npm_version"

# 安装全局npm包
info "正在安装全局npm包..."
npm install -g pnpm pm2

# MySQL配置
info "正在配置MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS gea_eor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true
mysql -e "CREATE USER IF NOT EXISTS 'geauser'@'localhost' IDENTIFIED BY 'GeaEor@2024!';" || true
mysql -e "GRANT ALL PRIVILEGES ON gea_eor_db.* TO 'geauser'@'localhost';" || true
mysql -e "FLUSH PRIVILEGES;"

# 创建应用目录
info "正在创建应用目录..."
mkdir -p /opt/gea-eor
cd /opt/gea-eor

# 克隆代码（需要替换为实际仓库地址）
info "正在克隆代码..."
if [ -d "geaplatform_trae" ]; then
    warn "代码目录已存在，正在更新..."
    cd geaplatform_trae
    git pull origin main
else
    git clone https://github.com/your-username/geaplatform_trae.git
    cd geaplatform_trae
fi

# 安装项目依赖
info "正在安装项目依赖..."
pnpm install

# 创建环境配置文件
info "正在创建环境配置文件..."
cat > .env << EOF
# 基础配置
NODE_ENV=production
PORT=3000
JWT_SECRET=$(openssl rand -base64 32)

# 数据库配置
DATABASE_URL=mysql://geauser:GeaEor@2024!@localhost:3306/gea_eor_db

# 文件存储（本地存储，测试环境）
STORAGE_TYPE=local
UPLOAD_DIR=/opt/gea-eor/uploads

# 邮件配置（测试环境使用本地邮件）
EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=587
EMAIL_FROM=noreply@your-domain.com
EMAIL_ADMIN=admin@your-domain.com

# AI服务（测试环境使用模拟服务）
AI_PROVIDER=mock

# 系统配置
DEFAULT_CURRENCY=CNY
DEFAULT_TIMEZONE=Asia/Shanghai
EOF

# 创建上传目录
mkdir -p /opt/gea-eor/uploads
chown -R www-data:www-data /opt/gea-eor/uploads

# 数据库迁移
info "正在执行数据库迁移..."
pnpm db:push || warn "数据库迁移失败，请手动检查"

# 构建应用
info "正在构建应用..."
pnpm build

# 配置Nginx
info "正在配置Nginx..."
cat > /etc/nginx/sites-available/gea-eor << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /opt/gea-eor/geaplatform_trae/dist/public;
    index index.html;
    
    # 前端静态文件
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 上传文件处理
    location /uploads {
        alias /opt/gea-eor/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用Nginx站点
ln -sf /etc/nginx/sites-available/gea-eor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t || error "Nginx配置测试失败"

# 重启Nginx
systemctl restart nginx
systemctl enable nginx

# 配置防火墙
info "正在配置防火墙..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 创建PM2配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'gea-eor-app',
    script: 'dist/index.js',
    cwd: '/opt/gea-eor/geaplatform_trae',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/opt/gea-eor/logs/err.log',
    out_file: '/opt/gea-eor/logs/out.log',
    log_file: '/opt/gea-eor/logs/combined.log',
    time: true
  }]
};
EOF

# 创建日志目录
mkdir -p /opt/gea-eor/logs
chown -R www-data:www-data /opt/gea-eor/logs

# 启动应用
info "正在启动应用..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup || warn "PM2开机自启配置失败，请手动执行: pm2 startup"

# 系统优化
info "正在优化系统配置..."
echo 'vm.swappiness=10' >> /etc/sysctl.conf
echo 'net.core.somaxconn=65535' >> /etc/sysctl.conf
sysctl -p

# 添加SWAP（如果内存小于4GB）
total_memory=$(free -m | awk 'NR==2{print $2}')
if [ $total_memory -lt 4096 ]; then
    info "检测到内存小于4GB，正在添加SWAP空间..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 创建系统服务
info "正在创建系统服务..."
cat > /etc/systemd/system/gea-eor.service << 'EOF'
[Unit]
Description=GEA EOR Application
After=network.target mysql.service

[Service]
Type=forking
User=www-data
WorkingDirectory=/opt/gea-eor/geaplatform_trae
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable gea-eor.service

# 部署验证
info "正在验证部署..."
sleep 5

# 检查应用状态
if pm2 status | grep -q "online"; then
    info "✅ 应用启动成功"
else
    error "❌ 应用启动失败"
fi

# 检查端口监听
if netstat -tuln | grep -q ":3000"; then
    info "✅ 应用端口监听正常"
else
    error "❌ 应用端口未监听"
fi

# 检查Nginx
if systemctl is-active --quiet nginx; then
    info "✅ Nginx运行正常"
else
    error "❌ Nginx未运行"
fi

# 检查MySQL
if systemctl is-active --quiet mysql; then
    info "✅ MySQL运行正常"
else
    error "❌ MySQL未运行"
fi

# 创建管理脚本
cat > /opt/gea-eor/manage.sh << 'EOF'
#!/bin/bash
# GEA EOR 管理脚本

case "$1" in
    start)
        pm2 start ecosystem.config.js
        ;;
    stop)
        pm2 stop ecosystem.config.js
        ;;
    restart)
        pm2 restart ecosystem.config.js
        ;;
    status)
        pm2 status
        ;;
    logs)
        pm2 logs gea-eor-app --lines 50
        ;;
    update)
        cd /opt/gea-eor/geaplatform_trae
        git pull origin main
        pnpm install
        pnpm build
        pm2 restart ecosystem.config.js
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs|update}"
        exit 1
        ;;
esac
EOF

chmod +x /opt/gea-eor/manage.sh
ln -sf /opt/gea-eor/manage.sh /usr/local/bin/gea-eor

# 最终信息
echo ""
echo "🎉 部署完成！"
echo "=================="
echo "应用状态: $(pm2 status | grep gea-eor-app | awk '{print $4}')"
echo "访问地址: http://$(curl -s ifconfig.me)"
echo "管理命令: gea-eor {start|stop|restart|status|logs|update}"
echo "日志文件: /opt/gea-eor/logs/"
echo "配置目录: /opt/gea-eor/geaplatform_trae/.env"
echo ""
echo "📋 后续步骤:"
echo "1. 访问应用测试功能"
echo "2. 配置域名（可选）"
echo "3. 设置SSL证书（可选）"
echo "4. 配置监控告警"
echo "5. 创建备份策略"
echo ""
echo "🆘 故障排除:"
echo "- 查看日志: gea-eor logs"
echo "- 重启应用: gea-eor restart"
echo "- 检查状态: gea-eor status"
echo "- 系统资源: htop"
echo ""

info "部署脚本执行完成！"