#!/usr/bin/env bash

# 数据迁移执行脚本（Bash版本）
# 用于在没有Node.js的环境中执行数据分析和清理

echo "🚀 开始数据迁移分析流程..."
echo ""

# 检查必要的文件是否存在
check_files() {
    local files=(
        "./data/data-exports/production/customers.json"
        "./data/seed-migration-data.json"
        "./data/data-exports/baseline/countries_config.json"
        "./data/data-exports/baseline/leave_types.json"
        "./data/data-exports/baseline/public_holidays.json"
    )
    
    for file in "${files[@]}"; do
        if [[ ! -f "$file" ]]; then
            echo "❌ 缺失文件: $file"
            return 1
        fi
    done
    echo "✅ 所有必要文件都存在"
    return 0
}

# 分析客户数据
analyze_customers() {
    echo "📊 分析客户数据..."
    
    if [[ -f "./data/data-exports/production/customers.json" ]]; then
        local total=$(jq '. | length' ./data/data-exports/production/customers.json)
        local real_customers=$(jq '[.[] | select(.clientCode | startswith("CUS-330"))] | length' ./data/data-exports/production/customers.json)
        local test_customers=$(jq '[.[] | select(.clientCode | test("CUS-(930|960|990)"))] | length' ./data/data-exports/production/customers.json)
        
        echo "总客户数: $total"
        echo "实际业务客户: $real_customers (CUS-330系列)"
        echo "测试客户: $test_customers (CUS-930/960/990系列)"
        
        # 保存清理后的数据
        jq '[.[] | select(.clientCode | startswith("CUS-330"))]' ./data/data-exports/production/customers.json > ./data/data-exports/production/customers-cleaned.json
        
        # 生成测试数据报告
        jq '{
            metadata: {
                originalCount: (. | length),
                realCustomersCount: ([.[] | select(.clientCode | startswith("CUS-330"))] | length),
                testCustomersCount: ([.[] | select(.clientCode | test("CUS-(930|960|990)"))] | length),
                cleanedAt: now
            },
            realCustomers: [.[] | select(.clientCode | startswith("CUS-330"))],
            removedTestCustomers: [.[] | select(.clientCode | test("CUS-(930|960|990)"))]
        }' ./data/data-exports/production/customers.json > ./data/data-exports/production/test-customers-report.json
        
        echo "✅ 清理后的数据已保存到: ./data/data-exports/production/customers-cleaned.json"
        echo "📋 详细报告已保存到: ./data/data-exports/production/test-customers-report.json"
        
        return 0
    else
        echo "❌ 客户数据文件不存在"
        return 1
    fi
}

# 显示数据摘要
show_summary() {
    echo ""
    echo "📈 数据迁移摘要:"
    echo "=================="
    echo ""
    
    if [[ -f "./data/data-exports/production/test-customers-report.json" ]]; then
        local total=$(jq '.metadata.originalCount' ./data/data-exports/production/test-customers-report.json)
        local real=$(jq '.metadata.realCustomersCount' ./data/data-exports/production/test-customers-report.json)
        local test=$(jq '.metadata.testCustomersCount' ./data/data-exports/production/test-customers-report.json)
        
        echo "1. 数据概况:"
        echo "   - 原始客户总数: $total"
        echo "   - 实际业务客户: $real"
        echo "   - 测试客户: $test"
        echo ""
        
        echo "2. 清理结果:"
        echo "   - 删除测试客户: $test 个"
        echo "   - 保留实际客户: $real 个"
        if [[ $total -gt 0 ]]; then
            local percentage=$((test * 100 / total))
            echo "   - 清理比例: $percentage%"
        fi
        echo ""
        
        echo "3. 建议操作:"
        echo "   ✅ 使用清理后的客户数据 (customers-cleaned.json)"
        echo "   ✅ 保留测试数据报告用于备份"
        echo "   ✅ 继续导入其他业务数据"
        echo ""
        
        echo "4. 后续步骤:"
        echo "   - 导入系统基础数据 (countries, leave_types, holidays)"
        echo "   - 导入实际业务客户数据"
        echo "   - 导入员工和发票数据"
        echo "   - 验证数据完整性"
    fi
}

# 检查基础数据
show_baseline_summary() {
    echo ""
    echo "🌍 系统基础数据摘要:"
    echo "====================="
    
    local baseline_files=(
        "./data/data-exports/baseline/countries_config.json:国家配置"
        "./data/data-exports/baseline/leave_types.json:假期类型"
        "./data/exports/baseline/public_holidays.json:公共假期"
        "./data/data-exports/baseline/system_config.json:系统配置"
    )
    
    for file_info in "${baseline_files[@]}"; do
        IFS=':' read -r file desc <<< "$file_info"
        if [[ -f "$file" ]]; then
            local count=$(jq '. | length' "$file" 2>/dev/null || echo "0")
            echo "   ✅ $desc: $count 条记录"
        else
            echo "   ❌ $desc: 文件不存在"
        fi
    done
}

# 检查seed数据
show_seed_summary() {
    echo ""
    echo "💼 Seed迁移数据摘要:"
    echo "===================="
    
    if [[ -f "./data/seed-migration-data.json" ]]; then
        local customers=$(jq '.customers | length' ./data/seed-migration-data.json)
        local employees=$(jq '.employees | length' ./data/seed-migration-data.json)
        
        echo "   ✅ 客户数据: $customers 家"
        echo "   ✅ 员工数据: $employees 名"
        
        # 检查是否有发票数据
        local invoices=$(jq '.invoices // [] | length' ./data/seed-migration-data.json)
        if [[ $invoices -gt 0 ]]; then
            echo "   ✅ 发票数据: $invoices 张"
        else
            echo "   ℹ️  发票数据: 无"
        fi
    else
        echo "   ❌ Seed数据文件不存在"
    fi
}

# 主函数
main() {
    echo "🚀 开始数据迁移分析流程..."
    echo ""
    
    # 1. 检查文件
    echo "🔍 第一步：检查必要文件"
    if ! check_files; then
        echo "❌ 文件检查失败，终止流程"
        exit 1
    fi
    echo ""
    
    # 2. 显示基础数据摘要
    show_baseline_summary
    
    # 3. 显示seed数据摘要
    show_seed_summary
    
    # 4. 分析客户数据
    echo ""
    echo "📊 第二步：分析客户数据"
    if ! analyze_customers; then
        echo "❌ 客户数据分析失败"
        exit 1
    fi
    
    # 5. 显示摘要
    show_summary
    
    echo ""
    echo "🎉 数据迁移分析完成！"
    echo ""
    echo "下一步操作:"
    echo "1. 检查生成的清理数据文件"
    echo "2. 确认无误后执行实际数据导入"
    echo "3. 使用清理后的客户数据进行后续操作"
}

# 检查jq命令是否存在
if ! command -v jq &> /dev/null; then
    echo "❌ 错误: jq命令未找到，请先安装jq"
    echo "   Ubuntu/Debian: sudo apt-get install jq"
    echo "   macOS: brew install jq"
    echo "   CentOS/RHEL: sudo yum install jq"
    exit 1
fi

# 执行主函数
main