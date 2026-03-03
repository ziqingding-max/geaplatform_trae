# Vercel部署数据查看功能指南

## 部署前准备

1. **环境变量配置**
   - 复制 `.env.example` 为 `.env`
   - 填写所有必要的环境变量
   - 在Vercel控制台中添加相同的环境变量

2. **数据库连接**
   - 确保数据库已正确配置
   - 运行数据迁移脚本导入数据
   - 验证数据完整性

3. **构建配置**
   - 确保 `vercel.json` 配置正确
   - 检查 `package.json` 中的构建脚本
   - 确认所有依赖已安装

## 部署步骤

1. **本地测试**
   ```bash
   pnpm install
   pnpm build
   pnpm start
   ```

2. **数据验证**
   ```bash
   # 运行数据迁移
   bash scripts/migrate-data-master.sh
   
   # 验证数据
   bash scripts/import-to-database.sh
   ```

3. **Vercel部署**
   ```bash
   # 连接Vercel项目
   vercel --prod
   ```

## 数据查看功能

部署完成后，您可以通过以下方式查看数据：

1. **Web界面**: `https://your-domain.com/data-view`
2. **API接口**: `https://your-domain.com/api/dataView.*`

## 功能说明

- **数据概览**: 显示各类数据的统计信息
- **客户列表**: 可搜索、分页查看客户数据
- **员工列表**: 查看员工基本信息
- **系统配置**: 查看国家、假期类型、公共假期等配置

## 注意事项

- 确保所有环境变量正确配置
- 数据库连接必须稳定可靠
- 生产环境建议启用HTTPS
- 定期备份重要数据
