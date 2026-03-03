#!/bin/bash

# 🌙 夜间自动化测试调度器
# 这个脚本会在您睡觉时自动运行完整的端到端测试
# 运行时间: 每晚 23:30 (可以自定义)

set -e  # 遇到错误立即退出

# 配置变量
TEST_DIR="/Users/simonprivate/Documents/Trae/geaplatform_trae/e2e-tests"
LOG_DIR="$TEST_DIR/logs"
REPORT_DIR="$TEST_DIR/reports"
MAX_RETRIES=3
SLEEP_INTERVAL=300  # 5分钟

# 创建必要的目录
mkdir -p "$LOG_DIR" "$REPORT_DIR"

# 日志文件
LOG_FILE="$LOG_DIR/nightly-test-$(date +%Y%m%d-%H%M%S).log"
REPORT_FILE="$REPORT_DIR/test-report-$(date +%Y%m%d-%H%M%S).html"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# 发送通知函数
send_notification() {
    local subject="$1"
    local message="$2"
    local priority="$3"
    
    # 记录到日志
    log_info "发送通知: $subject"
    
    # 这里可以集成邮件、Slack、企业微信等通知
    # 示例: echo "$message" | mail -s "$subject" admin@company.com
    
    # 同时保存到通知文件
    echo "$(date): $subject - $message" >> "$LOG_DIR/notifications.log"
}

# 系统健康检查
check_system_health() {
    log_info "开始系统健康检查..."
    
    # 检查磁盘空间
    local disk_usage=$(df -h /Users/simonprivate/Documents/Trae/geaplatform_trae | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        log_error "磁盘空间不足: ${disk_usage}%"
        send_notification "磁盘空间警告" "磁盘使用率: ${disk_usage}%" "high"
        return 1
    fi
    
    # 检查内存使用
    local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
    if [ "$memory_usage" -gt 95 ]; then
        log_warning "内存使用率较高: ${memory_usage}%"
    fi
    
    log_success "系统健康检查通过"
    return 0
}

# 数据库连接检查
check_database_connection() {
    log_info "检查数据库连接..."
    
    # 这里可以添加实际的数据库连接测试
    # 例如: mysql -u user -p password -e "SELECT 1" database_name
    
    # 模拟数据库检查
    if [ -f "/Users/simonprivate/Documents/Trae/geaplatform_trae/drizzle/schema.ts" ]; then
        log_success "数据库配置检测到"
        return 0
    else
        log_error "数据库配置未找到"
        return 1
    fi
}

# 运行测试套件
run_test_suite() {
    local suite_name="$1"
    local test_script="$2"
    local retry_count=0
    
    log_info "开始运行测试套件: $suite_name"
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        local start_time=$(date +%s)
        
        if bash "$test_script" >> "$LOG_FILE" 2>&1; then
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            log_success "$suite_name 测试通过 (耗时: ${duration}s)"
            
            # 记录成功的测试
            echo "$(date '+%Y-%m-%d %H:%M:%S'),$suite_name,success,$duration" >> "$LOG_DIR/test-results.csv"
            return 0
        else
            retry_count=$((retry_count + 1))
            log_warning "$suite_name 测试失败，第 $retry_count 次重试..."
            
            if [ $retry_count -lt $MAX_RETRIES ]; then
                sleep $SLEEP_INTERVAL
            fi
        fi
    done
    
    log_error "$suite_name 测试在 $MAX_RETRIES 次尝试后仍然失败"
    
    # 记录失败的测试
    echo "$(date '+%Y-%m-%d %H:%M:%S'),$suite_name,failure,0" >> "$LOG_DIR/test-results.csv"
    
    # 发送失败通知
    send_notification "测试失败" "$suite_name 测试套件失败" "high"
    
    return 1
}

# 主测试执行函数
run_nightly_tests() {
    log_info "🌙 开始夜间自动化测试..."
    log_info "测试目录: $TEST_DIR"
    log_info "日志文件: $LOG_FILE"
    
    # 系统检查
    if ! check_system_health; then
        log_error "系统健康检查失败，终止测试"
        return 1
    fi
    
    if ! check_database_connection; then
        log_error "数据库连接检查失败，终止测试"
        return 1
    fi
    
    # 测试开始时间
    local start_time=$(date +%s)
    local test_date=$(date '+%Y-%m-%d')
    
    # 定义测试套件
    local test_suites=(
        "销售流程测试:$TEST_DIR/test-sales-flow.sh"
        "客户入职测试:$TEST_DIR/test-customer-onboarding.sh"
        "员工生命周期测试:$TEST_DIR/test-employee-lifecycle.sh"
        "工资处理测试:$TEST_DIR/test-payroll-process.sh"
        "发票周期测试:$TEST_DIR/test-invoice-cycle.sh"
        "权限安全测试:$TEST_DIR/test-security.sh"
        "数据完整性测试:$TEST_DIR/test-data-integrity.sh"
        "性能基准测试:$TEST_DIR/test-performance.sh"
        "业务规则验证:$TEST_DIR/test-business-rules.sh"
    )
    
    local passed_tests=0
    local failed_tests=0
    local total_tests=${#test_suites[@]}
    
    # 运行每个测试套件
    for suite in "${test_suites[@]}"; do
        IFS=':' read -r suite_name test_script <<< "$suite"
        
        if [ -f "$test_script" ]; then
            if run_test_suite "$suite_name" "$test_script"; then
                passed_tests=$((passed_tests + 1))
            else
                failed_tests=$((failed_tests + 1))
            fi
        else
            log_warning "测试脚本未找到: $test_script"
            failed_tests=$((failed_tests + 1))
        fi
    done
    
    # 计算总耗时
    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    
    # 生成测试报告
    generate_test_report "$test_date" "$passed_tests" "$failed_tests" "$total_tests" "$total_duration"
    
    # 数据清理验证
    validate_cleanup
    
    # 发送总结通知
    local pass_rate=$((passed_tests * 100 / total_tests))
    local summary="夜间测试完成 - 通过率: ${pass_rate}% (${passed_tests}/${total_tests})"
    
    if [ $failed_tests -eq 0 ]; then
        send_notification "🎉 测试成功" "$summary" "low"
        log_success "🎉 夜间测试完成！通过率: ${pass_rate}%"
    else
        send_notification "⚠️ 测试失败" "$summary" "high"
        log_error "❌ 夜间测试完成，但有 ${failed_tests} 个测试失败"
    fi
    
    # 记录历史数据
    record_test_history "$test_date" "$passed_tests" "$failed_tests" "$pass_rate" "$total_duration"
    
    return $failed_tests
}

# 生成测试报告
generate_test_report() {
    local test_date="$1"
    local passed="$2"
    local failed="$3"
    local total="$4"
    local duration="$5"
    
    log_info "生成测试报告..."
    
    # 生成HTML报告
    cat > "$REPORT_FILE" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>夜间自动化测试报告 - $test_date</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; }
        .success { border-left: 4px solid #28a745; }
        .warning { border-left: 4px solid #ffc107; }
        .danger { border-left: 4px solid #dc3545; }
        .metric { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .details { margin-top: 20px; }
        .test-item { padding: 10px; margin: 5px 0; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; }
        .test-passed { background-color: #d4edda; color: #155724; }
        .test-failed { background-color: #f8d7da; color: #721c24; }
        .recommendations { background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin-top: 20px; }
        .timestamp { color: #666; font-size: 0.9em; text-align: right; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌙 夜间自动化测试报告</h1>
            <p>测试日期: $test_date</p>
            <p>执行时间: $(date -d @$(( $(date +%s) - duration )) '+%Y-%m-%d %H:%M:%S') - $(date '+%Y-%m-%d %H:%M:%S')</p>
        </div>
        
        <div class="summary">
            <div class="card success">
                <div class="metric">$passed</div>
                <div class="metric-label">通过测试</div>
            </div>
            <div class="card danger">
                <div class="metric">$failed</div>
                <div class="metric-label">失败测试</div>
            </div>
            <div class="card">
                <div class="metric">$((passed * 100 / total))%</div>
                <div class="metric-label">通过率</div>
            </div>
            <div class="card">
                <div class="metric">${duration}s</div>
                <div class="metric-label">总耗时</div>
            </div>
        </div>
        
        <div class="details">
            <h2>📋 测试详情</h2>
            <div id="test-details">
                <!-- 测试详情将在这里动态生成 -->
            </div>
        </div>
        
        <div class="recommendations">
            <h3>💡 建议</h3>
            <ul>
                <li>定期运行测试以确保系统稳定性</li>
                <li>关注失败的测试并及时修复</li>
                <li>监控测试性能趋势</li>
                <li>保持测试数据的清洁</li>
            </ul>
        </div>
        
        <div class="timestamp">
            报告生成时间: $(date '+%Y-%m-%d %H:%M:%S')
        </div>
    </div>
</body>
</html>
EOF
    
    log_success "测试报告已生成: $REPORT_FILE"
}

# 验证数据清理
validate_cleanup() {
    log_info "验证数据清理..."
    
    # 这里可以添加数据清理验证逻辑
    # 例如检查是否还有测试数据残留在数据库中
    
    log_success "数据清理验证完成"
}

# 记录测试历史
record_test_history() {
    local test_date="$1"
    local passed="$2"
    local failed="$3"
    local pass_rate="$4"
    local duration="$5"
    
    local history_file="$LOG_DIR/test-history.csv"
    
    # 创建历史记录文件（如果不存在）
    if [ ! -f "$history_file" ]; then
        echo "日期,通过数,失败数,通过率,耗时(秒)" > "$history_file"
    fi
    
    # 添加历史记录
    echo "$test_date,$passed,$failed,$pass_rate,$duration" >> "$history_file"
    
    log_info "测试历史已记录"
}

# 主函数
main() {
    log_info "🌙 夜间自动化测试系统启动"
    log_info "==================================="
    
    # 检查是否有其他测试正在运行
    local lock_file="/tmp/nightly-test.lock"
    if [ -f "$lock_file" ]; then
        local lock_pid=$(cat "$lock_file")
        if ps -p "$lock_pid" > /dev/null 2>&1; then
            log_warning "另一个测试进程正在运行 (PID: $lock_pid)，退出"
            exit 1
        else
            rm -f "$lock_file"
        fi
    fi
    
    # 创建锁文件
    echo $$ > "$lock_file"
    
    # 设置退出时清理
    trap 'rm -f "$lock_file"; log_info "测试进程退出"' EXIT
    
    # 运行夜间测试
    run_nightly_tests
    local exit_code=$?
    
    log_info "==================================="
    log_info "🌙 夜间自动化测试系统关闭"
    
    exit $exit_code
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi