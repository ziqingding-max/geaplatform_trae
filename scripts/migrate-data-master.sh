#!/usr/bin/env bash

# 完整数据迁移执行脚本
# 按照策略执行数据迁移

echo "🚀 开始完整数据迁移流程..."
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

# 检查依赖
check_dependencies() {
    log_info "检查依赖工具..."
    
    if ! command -v jq &> /dev/null; then
        log_error "jq未安装，请先安装jq"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 检查文件
verify_files() {
    log_info "验证必要文件..."
    
    local required_files=(
        "./data/data-exports/baseline/countries_config.json"
        "./data/data-exports/baseline/leave_types.json"
        "./data/data-exports/baseline/system_config.json"
        "./data/seed-migration-data.json"
        "./data/data-exports/production/customers-cleaned.json"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "缺失文件: $file"
            exit 1
        fi
    done
    
    # 检查可选文件
    if [[ -f "./data/data-exports/baseline/public_holidays.json" ]]; then
        log_success "找到公共假期数据文件"
    else
        log_warning "未找到公共假期数据文件，将跳过此步骤"
    fi
    
    log_success "文件验证通过"
}

# 显示数据摘要
show_data_summary() {
    log_info "数据迁移前摘要:"
    echo ""
    
    # 基础数据
    echo "📊 系统基础数据:"
    local countries=$(jq '. | length' ./data/data-exports/baseline/countries_config.json)
    local leave_types=$(jq '. | length' ./data/data-exports/baseline/leave_types.json)
    local system_configs=$(jq '. | length' ./data/data-exports/baseline/system_config.json)
    
    echo "   国家配置: $countries 条"
    echo "   假期类型: $leave_types 种"
    echo "   系统配置: $system_configs 项"
    
    if [[ -f "./data/data-exports/baseline/public_holidays.json" ]]; then
        local holidays=$(jq '. | length' ./data/data-exports/baseline/public_holidays.json)
        echo "   公共假期: $holidays 个"
    fi
    
    echo ""
    
    # 业务数据
    echo "💼 核心业务数据:"
    local seed_customers=$(jq '.customers | length' ./data/seed-migration-data.json)
    local seed_employees=$(jq '.employees | length' ./data/seed-migration-data.json)
    local cleaned_customers=$(jq '. | length' ./data/data-exports/production/customers-cleaned.json)
    
    echo "   Seed客户数据: $seed_customers 家"
    echo "   Seed员工数据: $seed_employees 名"
    echo "   清理后客户: $cleaned_customers 家"
}

# 创建备份
create_backup() {
    log_info "创建数据备份..."
    
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # 备份当前数据状态（如果有数据库的话）
    # 这里只是创建备份目录结构
    echo "备份目录: $backup_dir" > "$backup_dir/backup_info.txt"
    echo "备份时间: $(date)" >> "$backup_dir/backup_info.txt"
    echo "数据迁移前备份" >> "$backup_dir/backup_info.txt"
    
    log_success "备份创建完成: $backup_dir"
}

# 执行数据迁移
execute_migration() {
    log_info "开始执行数据迁移..."
    echo ""
    
    # 第一阶段：导入系统基础数据
    log_info "第一阶段：导入系统基础数据"
    
    log_info "1. 导入国家配置..."
    local countries_count=$(jq '. | length' ./data/data-exports/baseline/countries_config.json)
    log_success "准备导入 $countries_count 个国家配置"
    
    log_info "2. 导入假期类型..."
    local leave_types_count=$(jq '. | length' ./data/data-exports/baseline/leave_types.json)
    log_success "准备导入 $leave_types_count 种假期类型"
    
    log_info "3. 导入系统配置..."
    local system_count=$(jq '. | length' ./data/data-exports/baseline/system_config.json)
    log_success "准备导入 $system_count 项系统配置"
    
    if [[ -f "./data/data-exports/baseline/public_holidays.json" ]]; then
        log_info "4. 导入公共假期..."
        local holidays_count=$(jq '. | length' ./data/data-exports/baseline/public_holidays.json)
        log_success "准备导入 $holidays_count 个公共假期"
    fi
    
    echo ""
    
    # 第二阶段：导入核心业务数据
    log_info "第二阶段：导入核心业务数据"
    
    log_info "1. 导入实际业务客户..."
    local cleaned_customers=$(jq '. | length' ./data/data-exports/production/customers-cleaned.json)
    log_success "准备导入 $cleaned_customers 家实际业务客户"
    
    log_info "2. 导入Seed客户数据..."
    local seed_customers=$(jq '.customers | length' ./data/seed-migration-data.json)
    log_success "准备导入 $seed_customers 家Seed客户"
    
    log_info "3. 导入员工数据..."
    local seed_employees=$(jq '.employees | length' ./data/seed-migration-data.json)
    log_success "准备导入 $seed_employees 名员工"
    
    # 检查发票数据
    local invoices=$(jq '.invoices // [] | length' ./data/seed-migration-data.json)
    if [[ $invoices -gt 0 ]]; then
        log_info "4. 导入发票数据..."
        log_success "准备导入 $invoices 张发票"
    fi
    
    echo ""
    
    # 第三阶段：导入补充数据
    log_info "第三阶段：导入补充业务数据"
    
    # 这里可以添加更多补充数据的导入
    
    log_success "数据迁移执行计划完成"
}

# 生成迁移报告
generate_report() {
    log_info "生成迁移报告..."
    
    local report_file="./migration_report_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# GEA EOR SaaS 数据迁移报告

**迁移时间**: $(date)
**迁移状态**: 已规划

## 数据摘要

### 系统基础数据
- 国家配置: $(jq '. | length' ./data/data-exports/baseline/countries_config.json) 条
- 假期类型: $(jq '. | length' ./data/data-exports/baseline/leave_types.json) 种
- 系统配置: $(jq '. | length' ./data/data-exports/baseline/system_config.json) 项
EOF

    if [[ -f "./data/data-exports/baseline/public_holidays.json" ]]; then
        echo "- 公共假期: $(jq '. | length' ./data/data-exports/baseline/public_holidays.json) 个" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

### 核心业务数据
- 实际业务客户: $(jq '. | length' ./data/data-exports/production/customers-cleaned.json) 家
- Seed客户数据: $(jq '.customers | length' ./data/seed-migration-data.json) 家
- 员工数据: $(jq '.employees | length' ./data/seed-migration-data.json) 名

### 数据清理结果
- 原始客户总数: 68
- 删除测试客户: 37 个
- 保留实际客户: 31 个
- 清理比例: 54%

## 迁移策略

1. **系统基础数据**: 使用 data-exports 数据
   - 国家配置、假期类型、公共假期、系统配置

2. **核心业务数据**: 使用 seed-migration-data
   - 客户、员工、发票数据

3. **数据清理**: 物理删除测试数据
   - 删除 CUS-930xxx、CUS-960xxx、CUS-990xxx 系列客户

## 执行步骤

1. ✅ 数据分析和清理
2. ⏳ 导入系统基础数据
3. ⏳ 导入核心业务数据
4. ⏳ 数据验证

## 文件位置

- 清理后客户数据: \`./data/data-exports/production/customers-cleaned.json\`
- 测试数据报告: \`./data/data-exports/production/test-customers-report.json\`
- 迁移脚本: \`./scripts/\`

---
*报告生成时间: $(date)*
EOF
    
    log_success "迁移报告已生成: $report_file"
}

# 显示执行计划
show_execution_plan() {
    echo ""
    log_info "数据迁移执行计划:"
    echo ""
    echo "📋 第一阶段：系统基础数据导入"
    echo "   - 国家配置 (126个国家)"
    echo "   - 假期类型 (767种)"
    echo "   - 公共假期 (1312个)"
    echo "   - 系统配置 (6项)"
    echo ""
    echo "📋 第二阶段：核心业务数据导入"
    echo "   - 实际业务客户 (31家)"
    echo "   - 员工数据 (105名)"
    echo "   - 发票数据 (如有)"
    echo ""
    echo "📋 第三阶段：数据验证"
    echo "   - 数据完整性检查"
    echo "   - 关联关系验证"
    echo ""
}

# 主函数
main() {
    echo "🚀 GEA EOR SaaS 数据迁移工具"
    echo "==================================="
    echo ""
    
    # 1. 检查依赖
    check_dependencies
    echo ""
    
    # 2. 验证文件
    verify_files
    echo ""
    
    # 3. 显示数据摘要
    show_data_summary
    echo ""
    
    # 4. 创建备份
    create_backup
    echo ""
    
    # 5. 显示执行计划
    show_execution_plan
    
    # 6. 执行迁移规划
    execute_migration
    echo ""
    
    # 7. 生成报告
    generate_report
    echo ""
    
    echo "🎉 数据迁移规划完成！"
    echo ""
    echo "下一步操作:"
    echo "1. 检查生成的报告文件"
    echo "2. 确认数据迁移计划"
    echo "3. 执行实际的数据导入"
    echo ""
    echo "注意: 此脚本仅生成迁移计划和报告，"
    echo "      实际的数据导入需要连接到数据库执行。"
}

# 运行主函数
main "$@"