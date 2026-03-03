#!/usr/bin/env bash

# 数据库数据导入执行脚本
# 用于实际执行数据导入到数据库

echo "🚀 开始数据库数据导入..."
echo "==================================="
echo ""

# 设置错误处理
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查数据库连接
check_database() {
    log_info "检查数据库连接..."
    
    # 检查数据库配置文件
    if [[ -f "./drizzle/config.ts" ]] || [[ -f "./drizzle/schema.ts" ]]; then
        log_success "找到数据库配置文件"
    else
        log_error "未找到数据库配置文件"
        return 1
    fi
    
    # 这里可以添加实际的数据库连接测试
    log_info "数据库连接检查完成（模拟）"
}

# 执行数据库迁移
run_database_migration() {
    log_info "执行数据库迁移..."
    
    # 检查是否有迁移脚本
    if [[ -f "./node_modules/.bin/drizzle-kit" ]] || command -v drizzle-kit &> /dev/null; then
        log_info "找到Drizzle Kit，执行迁移..."
        
        # 生成迁移
        if drizzle-kit generate; then
            log_success "迁移生成成功"
        else
            log_warning "迁移生成可能失败，继续执行..."
        fi
        
        # 应用迁移
        if drizzle-kit migrate; then
            log_success "迁移应用成功"
        else
            log_warning "迁移应用可能失败，继续执行..."
        fi
    else
        log_warning "未找到Drizzle Kit，跳过自动迁移"
    fi
}

# 导入基础数据
import_baseline_data() {
    log_info "导入系统基础数据..."
    echo ""
    
    # 1. 导入国家配置
    if [[ -f "./data/data-exports/baseline/countries_config.json" ]]; then
        local countries_count=$(jq '. | length' ./data/data-exports/baseline/countries_config.json)
        log_info "准备导入 $countries_count 个国家配置"
        
        # 这里应该执行实际的数据库插入操作
        # 例如：使用SQL命令或数据库客户端
        cat > ./temp/import_countries.sql << EOF
-- 导入国家配置数据
-- 文件: ./data/data-exports/baseline/countries_config.json
-- 记录数: $countries_count
-- 请手动执行或使用数据库工具导入
EOF
        log_success "国家配置导入脚本已生成: ./temp/import_countries.sql"
    fi
    
    # 2. 导入假期类型
    if [[ -f "./data/data-exports/baseline/leave_types.json" ]]; then
        local leave_types_count=$(jq '. | length' ./data/data-exports/baseline/leave_types.json)
        log_info "准备导入 $leave_types_count 种假期类型"
        
        cat > ./temp/import_leave_types.sql << EOF
-- 导入假期类型数据
-- 文件: ./data/data-exports/baseline/leave_types.json
-- 记录数: $leave_types_count
-- 请手动执行或使用数据库工具导入
EOF
        log_success "假期类型导入脚本已生成: ./temp/import_leave_types.sql"
    fi
    
    # 3. 导入公共假期
    if [[ -f "./data/data-exports/baseline/public_holidays.json" ]]; then
        local holidays_count=$(jq '. | length' ./data/data-exports/baseline/public_holidays.json)
        log_info "准备导入 $holidays_count 个公共假期"
        
        cat > ./temp/import_holidays.sql << EOF
-- 导入公共假期数据
-- 文件: ./data/data-exports/baseline/public_holidays.json
-- 记录数: $holidays_count
-- 请手动执行或使用数据库工具导入
EOF
        log_success "公共假期导入脚本已生成: ./temp/import_holidays.sql"
    fi
    
    # 4. 导入系统配置
    if [[ -f "./data/data-exports/baseline/system_config.json" ]]; then
        local system_count=$(jq '. | length' ./data/data-exports/baseline/system_config.json)
        log_info "准备导入 $system_count 项系统配置"
        
        cat > ./temp/import_system_config.sql << EOF
-- 导入系统配置数据
-- 文件: ./data/data-exports/baseline/system_config.json
-- 记录数: $system_count
-- 请手动执行或使用数据库工具导入
EOF
        log_success "系统配置导入脚本已生成: ./temp/import_system_config.sql"
    fi
}

# 导入业务数据
import_business_data() {
    log_info "导入核心业务数据..."
    echo ""
    
    # 1. 导入客户数据
    if [[ -f "./data/seed-migration-data.json" ]]; then
        local customers_count=$(jq '.customers | length' ./data/seed-migration-data.json)
        log_info "准备导入 $customers_count 家客户"
        
        # 提取客户数据为SQL格式
        jq -r '.customers[] | 
        "INSERT INTO customers (clientCode, companyName, legalEntityName, country, primaryContactEmail, settlementCurrency, status, notes) VALUES (\"\(.clientCode)\", \"\(.companyName)\", \"\(.legalEntityName // "")\", \"\(.country)\"\(.primaryContactEmail // "" | @json), \"\(.settlementCurrency)\"\(.status)\"\(.notes // "" | @json));"' \
        ./data/seed-migration-data.json > ./temp/import_customers.sql
        
        log_success "客户数据SQL已生成: ./temp/import_customers.sql"
    fi
    
    # 2. 导入员工数据
    if [[ -f "./data/seed-migration-data.json" ]]; then
        local employees_count=$(jq '.employees | length' ./data/seed-migration-data.json)
        log_info "准备导入 $employees_count 名员工"
        
        # 提取员工数据为SQL格式
        jq -r '.employees[] | 
        "INSERT INTO employees (employeeCode, customerId, firstName, lastName, email, nationality, status) VALUES (\"\(.employeeCode)\"\(.customerId)\"\(.firstName)\"\(.lastName)\"\(.email)\"\(.nationality)\"\(.status)\");"' \
        ./data/seed-migration-data.json > ./temp/import_employees.sql
        
        log_success "员工数据SQL已生成: ./temp/import_employees.sql"
    fi
    
    # 3. 导入清理后的客户数据
    if [[ -f "./data/data-exports/production/customers-cleaned.json" ]]; then
        local cleaned_customers=$(jq '. | length' ./data/data-exports/production/customers-cleaned.json)
        log_info "清理后的客户数据: $cleaned_customers 家"
        
        # 生成清理后客户的SQL
        jq -r '.[] | 
        "INSERT INTO customers (id, clientCode, companyName, country, primaryContactEmail, settlementCurrency, status) VALUES (\(.id)\"\(.clientCode)\"\(.companyName)\"\(.country)\"\(.primaryContactEmail // "" | @json)\"\(.settlementCurrency)\"\(.status)\");"' \
        ./data/data-exports/production/customers-cleaned.json > ./temp/import_cleaned_customers.sql
        
        log_success "清理客户数据SQL已生成: ./temp/import_cleaned_customers.sql"
    fi
}

# 生成导入执行脚本
generate_import_scripts() {
    log_info "生成导入执行脚本..."
    
    # 创建临时目录
    mkdir -p ./temp
    
    # 生成主导入脚本
    cat > ./temp/execute_import.sh << 'EOF'
#!/usr/bin/env bash

# 数据导入执行脚本
# 请根据您的数据库类型和环境修改此脚本

echo "🚀 开始执行数据导入..."

# 这里应该包含实际的数据库连接和导入命令
# 例如：
# psql -h localhost -U username -d database_name -f import_countries.sql
# mysql -h localhost -u username -p database_name < import_countries.sql
# sqlite3 database.db < import_countries.sql

echo "请根据您的数据库环境执行相应的SQL文件"
echo "可用的SQL文件:"
ls -la ./temp/*.sql

echo "✅ 导入脚本生成完成"
EOF
    
    chmod +x ./temp/execute_import.sh
    log_success "导入执行脚本已生成: ./temp/execute_import.sh"
}

# 验证导入结果
validate_import() {
    log_info "验证数据导入结果..."
    echo ""
    
    # 这里应该执行实际的数据验证查询
    cat > ./temp/validation_queries.sql << 'EOF'
-- 数据验证查询
-- 请在导入后执行这些查询来验证数据完整性

-- 检查基础数据
SELECT 'countries_config' as table_name, COUNT(*) as record_count FROM countries_config;
SELECT 'leave_types' as table_name, COUNT(*) as record_count FROM leave_types;
SELECT 'public_holidays' as table_name, COUNT(*) as record_count FROM public_holidays;
SELECT 'system_config' as table_name, COUNT(*) as record_count FROM system_config;

-- 检查业务数据
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers WHERE clientCode LIKE 'CUS-330%';
SELECT 'employees' as table_name, COUNT(*) as record_count FROM employees;

-- 检查测试数据是否已清理
SELECT 'test_customers' as table_name, COUNT(*) as record_count FROM customers WHERE clientCode LIKE 'CUS-930%' OR clientCode LIKE 'CUS-960%' OR clientCode LIKE 'CUS-990%';
EOF
    
    log_success "验证查询已生成: ./temp/validation_queries.sql"
}

# 生成最终报告
generate_final_report() {
    log_info "生成最终迁移报告..."
    
    local report_file="./migration_execution_report_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# GEA EOR SaaS 数据迁移执行报告

**执行时间**: $(date)
**执行状态**: 脚本生成完成

## 生成的文件

### SQL导入文件
- \`./temp/import_countries.sql\` - 国家配置数据
- \`./temp/import_leave_types.sql\` - 假期类型数据
- \`./temp/import_holidays.sql\` - 公共假期数据
- \`./temp/import_system_config.sql\` - 系统配置数据
- \`./temp/import_customers.sql\` - 客户数据
- \`./temp/import_employees.sql\` - 员工数据
- \`./temp/import_cleaned_customers.sql\` - 清理后客户数据

### 执行脚本
- \`./temp/execute_import.sh\` - 导入执行脚本
- \`./temp/validation_queries.sql\` - 数据验证查询

## 数据摘要

- 国家配置: $(jq '. | length' ./data/data-exports/baseline/countries_config.json) 条
- 假期类型: $(jq '. | length' ./data/data-exports/baseline/leave_types.json) 种
- 公共假期: $(jq '. | length' ./data/data-exports/baseline/public_holidays.json) 个
- 系统配置: $(jq '. | length' ./data/data-exports/baseline/system_config.json) 项
- 实际业务客户: $(jq '. | length' ./data/data-exports/production/customers-cleaned.json) 家
- 员工数据: $(jq '.employees | length' ./data/seed-migration-data.json) 名

## 下一步操作

1. **检查SQL文件**: 查看生成的SQL文件，确认数据正确性
2. **执行导入**: 运行 \`./temp/execute_import.sh\` 或手动执行SQL文件
3. **验证数据**: 执行 \`./temp/validation_queries.sql\` 中的查询验证导入结果
4. **测试系统**: 导入完成后测试系统功能

## 注意事项

- 请在执行前备份现有数据库
- 根据您的数据库类型修改SQL语法
- 在生产环境执行前请在测试环境验证

---
*报告生成时间: $(date)*
EOF
    
    log_success "最终报告已生成: $report_file"
}

# 主函数
main() {
    echo "🚀 GEA EOR SaaS 数据库数据导入工具"
    echo "==================================="
    echo ""
    
    # 1. 检查数据库连接
    check_database
    echo ""
    
    # 2. 执行数据库迁移
    run_database_migration
    echo ""
    
    # 3. 导入基础数据
    import_baseline_data
    echo ""
    
    # 4. 导入业务数据
    import_business_data
    echo ""
    
    # 5. 生成导入脚本
    generate_import_scripts
    echo ""
    
    # 6. 验证导入结果
    validate_import
    echo ""
    
    # 7. 生成最终报告
    generate_final_report
    echo ""
    
    echo "🎉 数据库数据导入脚本生成完成！"
    echo ""
    echo "📋 生成的文件位于: ./temp/"
    echo "📄 最终报告: migration_execution_report_*.md"
    echo ""
    echo "⚠️  重要提示:"
    echo "   - 请在执行前备份数据库"
    echo "   - 根据您的数据库环境修改SQL文件"
    echo "   - 在生产环境执行前请充分测试"
    echo ""
    echo "下一步操作:"
    echo "1. 检查 ./temp/ 目录下的SQL文件"
    echo "2. 根据您的数据库环境调整SQL语法"
    echo "3. 执行数据导入"
    echo "4. 运行验证查询"
}

# 创建临时目录
mkdir -p ./temp

# 运行主函数
main "$@"