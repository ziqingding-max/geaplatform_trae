#!/usr/bin/env bash

# Vercel部署数据查看脚本
# 用于在Vercel部署环境中查看数据

echo "🚀 准备Vercel部署数据查看功能..."
echo "==================================="
echo ""

# 创建数据查看API端点
create_data_view_api() {
    echo "📡 创建数据查看API端点..."
    
    # 创建API路由文件
    mkdir -p server/routers/data-view
    
    cat > server/routers/data-view.ts << 'EOF'
import { z } from "zod";
import { protectedProcedure, router } from "../procedures";
import { db } from "../../db";
import { customers, employees, countriesConfig, leaveTypes, publicHolidays } from "../../../drizzle/schema";
import { count, sql } from "drizzle-orm";

export const dataViewRouter = router({
  // 获取数据概览
  getOverview: protectedProcedure
    .query(async () => {
      try {
        const [
          customerCount,
          employeeCount,
          countriesCount,
          leaveTypesCount,
          holidaysCount
        ] = await Promise.all([
          db.select({ count: count() }).from(customers),
          db.select({ count: count() }).from(employees),
          db.select({ count: count() }).from(countriesConfig),
          db.select({ count: count() }).from(leaveTypes),
          db.select({ count: count() }).from(publicHolidays)
        ]);

        return {
          customers: customerCount[0].count,
          employees: employeeCount[0].count,
          countries: countriesCount[0].count,
          leaveTypes: leaveTypesCount[0].count,
          holidays: holidaysCount[0].count
        };
      } catch (error) {
        console.error("获取数据概览失败:", error);
        throw new Error("无法获取数据概览");
      }
    }),

  // 获取客户列表（分页）
  getCustomers: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(10),
      search: z.string().optional()
    }))
    .query(async ({ input }) => {
      try {
        const offset = (input.page - 1) * input.pageSize;
        
        let query = db.select({
          id: customers.id,
          clientCode: customers.clientCode,
          companyName: customers.companyName,
          country: customers.country,
          primaryContactEmail: customers.primaryContactEmail,
          settlementCurrency: customers.settlementCurrency,
          status: customers.status
        }).from(customers);

        if (input.search) {
          query = query.where(
            sql`${customers.companyName} LIKE ${`%${input.search}%`} 
               OR ${customers.clientCode} LIKE ${`%${input.search}%`}
               OR ${customers.country} LIKE ${`%${input.search}%`}`
          );
        }

        const [data, totalCount] = await Promise.all([
          query.limit(input.pageSize).offset(offset),
          db.select({ count: count() }).from(customers)
        ]);

        return {
          data,
          total: totalCount[0].count,
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(totalCount[0].count / input.pageSize)
        };
      } catch (error) {
        console.error("获取客户列表失败:", error);
        throw new Error("无法获取客户列表");
      }
    }),

  // 获取员工列表（分页）
  getEmployees: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(10),
      customerId: z.number().optional()
    }))
    .query(async ({ input }) => {
      try {
        const offset = (input.page - 1) * input.pageSize;
        
        let query = db.select({
          id: employees.id,
          employeeCode: employees.employeeCode,
          firstName: employees.firstName,
          lastName: employees.lastName,
          email: employees.email,
          nationality: employees.nationality,
          status: employees.status,
          customerId: employees.customerId
        }).from(employees);

        if (input.customerId) {
          query = query.where(sql`${employees.customerId} = ${input.customerId}`);
        }

        const [data, totalCount] = await Promise.all([
          query.limit(input.pageSize).offset(offset),
          db.select({ count: count() }).from(employees)
        ]);

        return {
          data,
          total: totalCount[0].count,
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(totalCount[0].count / input.pageSize)
        };
      } catch (error) {
        console.error("获取员工列表失败:", error);
        throw new Error("无法获取员工列表");
      }
    }),

  // 获取系统配置数据
  getSystemConfig: protectedProcedure
    .query(async () => {
      try {
        const [
          countries,
          leaveTypes,
          holidays
        ] = await Promise.all([
          db.select().from(countriesConfig),
          db.select().from(leaveTypes),
          db.select().from(publicHolidays)
        ]);

        return {
          countries: countries.slice(0, 10), // 限制显示数量
          leaveTypes: leaveTypes.slice(0, 10),
          holidays: holidays.slice(0, 10)
        };
      } catch (error) {
        console.error("获取系统配置失败:", error);
        throw new Error("无法获取系统配置");
      }
    })
});
EOF

    echo "✅ 数据查看API已创建"
}

# 创建前端数据查看页面
create_frontend_data_view() {
    echo "🖥️  创建前端数据查看页面..."
    
    # 创建数据查看页面
    mkdir -p client/src/pages/admin/data-view
    
    cat > client/src/pages/admin/data-view/index.tsx << 'EOF'
import { trpc } from "../../../lib/trpc";
import { DataTable } from "../../../components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useState } from "react";

export default function DataViewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 获取数据概览
  const { data: overview, isLoading: overviewLoading } = trpc.dataView.getOverview.useQuery();
  
  // 获取客户列表
  const { data: customers, isLoading: customersLoading } = trpc.dataView.getCustomers.useQuery({
    page: currentPage,
    pageSize,
    search: searchTerm
  });

  // 获取员工列表
  const { data: employees, isLoading: employeesLoading } = trpc.dataView.getEmployees.useQuery({
    page: 1,
    pageSize: 5
  });

  // 获取系统配置
  const { data: systemConfig, isLoading: configLoading } = trpc.dataView.getSystemConfig.useQuery();

  const loading = overviewLoading || customersLoading || employeesLoading || configLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">数据查看器</h1>
        <Badge variant="outline">生产数据</Badge>
      </div>

      {/* 数据概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">客户总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.customers || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">员工总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.employees || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">国家配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.countries || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">假期类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.leaveTypes || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公共假期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.holidays || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 客户数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>客户数据</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="搜索客户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={() => setCurrentPage(1)}>搜索</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              显示 {customers?.data?.length || 0} / {customers?.total || 0} 条记录
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户代码</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">国家</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">货币</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers?.data?.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.clientCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.settlementCurrency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                          {customer.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {customers && customers.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  第 {currentPage} 页，共 {customers.totalPages} 页
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    上一页
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(Math.min(customers.totalPages, currentPage + 1))}
                    disabled={currentPage >= customers.totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 员工数据预览 */}
      <Card>
        <CardHeader>
          <CardTitle>员工数据预览（最新5条）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">员工代码</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">国籍</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees?.data?.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.employeeCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.firstName} {employee.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.nationality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                        {employee.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 系统配置预览 */}
      {systemConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>国家配置（前10个）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemConfig.countries?.map((country: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{country.name}</span>
                    <Badge variant="outline">{country.code}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>假期类型（前10个）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemConfig.leaveTypes?.map((leaveType: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{leaveType.name}</span>
                    <Badge variant="outline">{leaveType.countryCode}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>公共假期（前10个）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemConfig.holidays?.map((holiday: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{holiday.name}</span>
                    <Badge variant="outline">{holiday.date}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
EOF

    echo "✅ 前端数据查看页面已创建"
}

# 更新路由配置
update_routes() {
    echo "🛣️  更新路由配置..."
    
    # 更新Admin路由
    if [[ -f "client/src/App.tsx" ]]; then
        # 备份原文件
        cp client/src/App.tsx client/src/App.tsx.backup
        
        # 添加数据查看路由
        sed -i '/import.*Layout.*from.*".*Layout"/a\
import DataViewPage from "./pages/admin/data-view";' client/src/App.tsx
        
        # 在路由配置中添加数据查看页面
        sed -i '/path: "\/customers"/a\
        { path: "/data-view", element: <DataViewPage /> },' client/src/App.tsx
        
        echo "✅ Admin路由已更新"
    fi
    
    # 更新后端路由
    if [[ -f "server/routers.ts" ]]; then
        # 备份原文件
        cp server/routers.ts server/routers.ts.backup
        
        # 添加数据查看路由导入
        sed -i '/import.*countriesRouter.*from/a\
import { dataViewRouter } from "./routers/data-view";' server/routers.ts
        
        # 在路由器合并中添加数据查看路由
        sed -i '/countries: countriesRouter,/a\
  dataView: dataViewRouter,' server/routers.ts
        
        echo "✅ 后端路由已更新"
    fi
}

# 更新侧边栏导航
update_sidebar() {
    echo "📋 更新侧边栏导航..."
    
    if [[ -f "client/src/components/Layout.tsx" ]]; then
        # 备份原文件
        cp client/src/components/Layout.tsx client/src/components/Layout.tsx.backup
        
        # 在侧边栏添加数据查看菜单项
        sed -i '/icon: "Users"/a\
    {\
      title: "数据查看",\
      href: "/data-view",\
      icon: "Database",\
    },' client/src/components/Layout.tsx
        
        echo "✅ 侧边栏导航已更新"
    fi
}

# 创建部署配置
create_deployment_config() {
    echo "⚙️  创建部署配置..."
    
    # 创建Vercel环境变量配置
    cat > .env.example << 'EOF'
# 数据库配置
DATABASE_URL=
DATABASE_AUTH_TOKEN=

# OAuth配置
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_REDIRECT_URI=

# AWS S3配置
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# 其他配置
NODE_ENV=production
PORT=3000
EOF

    # 创建部署说明
    cat > DEPLOYMENT_GUIDE.md << 'EOF'
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
EOF

    echo "✅ 部署配置已创建"
}

# 主函数
main() {
    echo "🚀 Vercel部署数据查看功能设置"
    echo "==================================="
    echo ""
    
    # 1. 创建数据查看API
    create_data_view_api
    echo ""
    
    # 2. 创建前端页面
    create_frontend_data_view
    echo ""
    
    # 3. 更新路由配置
    update_routes
    echo ""
    
    # 4. 更新侧边栏
    update_sidebar
    echo ""
    
    # 5. 创建部署配置
    create_deployment_config
    echo ""
    
    echo "🎉 Vercel部署数据查看功能设置完成！"
    echo ""
    echo "📋 完成的功能:"
    echo "   ✅ 数据查看API端点"
    echo "   ✅ 前端数据查看页面"
    echo "   ✅ 路由配置更新"
    echo "   ✅ 侧边栏导航更新"
    echo "   ✅ 部署配置和说明"
    echo ""
    echo "🚀 下一步操作:"
    echo "   1. 检查生成的文件"
    echo "   2. 配置环境变量"
    echo "   3. 执行数据迁移"
    echo "   4. 部署到Vercel"
    echo "   5. 访问 /data-view 查看数据"
    echo ""
    echo "📖 详细说明请查看: DEPLOYMENT_GUIDE.md"
}

# 执行主函数
main "$@"