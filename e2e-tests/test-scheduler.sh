#!/bin/bash

# 🕐 夜间测试调度管理器
# 用于管理cron定时任务和测试调度

set -e

SCRIPT_DIR="/Users/simonprivate/Documents/Trae/geaplatform_trae/e2e-tests"
NIGHTLY_RUNNER="$SCRIPT_DIR/nightly-test-runner.sh"
CRON_FILE="/tmp/nightly-test-cron"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 帮助信息
show_help() {
    echo "🕐 夜间测试调度管理器"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  schedule [时间]     - 设置夜间测试时间 (默认: 23:30)"
    echo "  run-now             - 立即运行测试"
    echo "  cancel              - 取消定时测试"
    echo "  status              - 查看调度状态"
    echo "  list                - 列出所有测试任务"
    echo "  logs [日期]         - 查看测试日志"
    echo "  report [日期]       - 生成测试报告"
    echo "  cleanup             - 清理旧日志和报告"
    echo "  help                - 显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 schedule 23:30   # 设置每晚23:30运行测试"
    echo "  $0 run-now          # 立即运行测试"
    echo "  $0 logs 2024-03-03  # 查看指定日期日志"
    echo ""
}

# 检查权限
check_permissions() {
    if ! command -v crontab >/dev/null 2>&1; then
        echo -e "${RED}错误: 未找到crontab命令${NC}"
        exit 1
    fi
}

# 设置定时任务
schedule_tests() {
    local time_str="${1:-23:30}"
    
    # 验证时间格式
    if ! [[ "$time_str" =~ ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$ ]]; then
        echo -e "${RED}错误: 无效的时间格式。请使用 HH:MM 格式 (例如: 23:30)${NC}"
        exit 1
    fi
    
    # 解析时间
    local hour=$(echo "$time_str" | cut -d':' -f1)
    local minute=$(echo "$time_str" | cut -d':' -f2)
    
    # 检查脚本是否存在
    if [ ! -f "$NIGHTLY_RUNNER" ]; then
        echo -e "${RED}错误: 夜间测试运行器未找到: $NIGHTLY_RUNNER${NC}"
        exit 1
    fi
    
    # 使脚本可执行
    chmod +x "$NIGHTLY_RUNNER"
    
    # 创建cron任务
    local cron_job="$minute $hour * * * $NIGHTLY_RUNNER >> /tmp/nightly-test-cron.log 2>&1"
    
    # 备份当前crontab
    crontab -l > "$CRON_FILE.bak" 2>/dev/null || true
    
    # 添加新任务
    (crontab -l 2>/dev/null || echo "") | grep -v "$NIGHTLY_RUNNER" || true > "$CRON_FILE"
    echo "$cron_job" >> "$CRON_FILE"
    
    # 安装新的crontab
    crontab "$CRON_FILE"
    
    echo -e "${GREEN}✅ 定时测试已设置: 每天 $time_str${NC}"
    echo -e "${BLUE}📋 Cron任务: $cron_job${NC}"
}

# 立即运行测试
run_tests_now() {
    echo -e "${BLUE}🚀 立即运行夜间测试...${NC}"
    
    if [ ! -f "$NIGHTLY_RUNNER" ]; then
        echo -e "${RED}错误: 夜间测试运行器未找到${NC}"
        exit 1
    fi
    
    # 在后台运行测试
    nohup "$NIGHTLY_RUNNER" > /tmp/nightly-test-manual.log 2>&1 &
    local pid=$!
    
    echo -e "${GREEN}✅ 测试已启动 (PID: $pid)${NC}"
    echo -e "${BLUE}📋 日志文件: /tmp/nightly-test-manual.log${NC}"
    echo -e "${YELLOW}⏳ 测试正在后台运行，请稍后查看结果${NC}"
}

# 取消定时任务
cancel_tests() {
    echo -e "${BLUE}🗑️  取消定时测试...${NC}"
    
    # 备份当前crontab
    crontab -l > "$CRON_FILE.bak" 2>/dev/null || true
    
    # 移除测试任务
    (crontab -l 2>/dev/null || echo "") | grep -v "$NIGHTLY_RUNNER" || true > "$CRON_FILE"
    
    # 安装新的crontab
    crontab "$CRON_FILE"
    
    echo -e "${GREEN}✅ 定时测试已取消${NC}"
}

# 查看状态
show_status() {
    echo -e "${BLUE}📊 测试调度状态${NC}"
    echo "=========================="
    
    # 检查crontab中是否有测试任务
    if crontab -l 2>/dev/null | grep -q "$NIGHTLY_RUNNER"; then
        local cron_line=$(crontab -l 2>/dev/null | grep "$NIGHTLY_RUNNER")
        echo -e "${GREEN}✅ 定时测试已启用${NC}"
        echo -e "${BLUE}📋 任务详情: $cron_line${NC}"
        
        # 解析时间
        local minute=$(echo "$cron_line" | awk '{print $1}')
        local hour=$(echo "$cron_line" | awk '{print $2}')
        echo -e "${BLUE}⏰ 运行时间: 每天 $hour:$minute${NC}"
    else
        echo -e "${YELLOW}⚠️  定时测试未启用${NC}"
    fi
    
    # 检查是否有正在运行的测试
    if pgrep -f "nightly-test-runner.sh" > /dev/null; then
        local pids=$(pgrep -f "nightly-test-runner.sh" | tr '\n' ' ')
        echo -e "${GREEN}🔄 正在运行的测试进程: $pids${NC}"
    else
        echo -e "${YELLOW}⏸️  当前没有运行的测试${NC}"
    fi
    
    # 显示最近的日志
    echo -e "${BLUE}📋 最近日志:${NC}"
    if [ -d "$SCRIPT_DIR/logs" ]; then
        local latest_log=$(ls -t "$SCRIPT_DIR/logs"/*.log 2>/dev/null | head -1)
        if [ -n "$latest_log" ]; then
            echo -e "${BLUE}最新日志: $(basename "$latest_log")${NC}"
            echo -e "${BLUE}日志时间: $(stat -c %y "$latest_log" 2>/dev/null || echo "未知")${NC}"
        fi
    fi
}

# 列出测试任务
list_tasks() {
    echo -e "${BLUE}📋 可用测试任务${NC}"
    echo "=========================="
    
    local tasks=(
        "销售流程测试:test-sales-flow.sh"
        "客户入职测试:test-customer-onboarding.sh"
        "员工生命周期测试:test-employee-lifecycle.sh"
        "工资处理测试:test-payroll-process.sh"
        "发票周期测试:test-invoice-cycle.sh"
        "权限安全测试:test-security.sh"
        "数据完整性测试:test-data-integrity.sh"
        "性能基准测试:test-performance.sh"
        "业务规则验证:test-business-rules.sh"
    )
    
    for task in "${tasks[@]}"; do
        IFS=':' read -r name script <<< "$task"
        local status="❌"
        if [ -f "$SCRIPT_DIR/$script" ]; then
            status="✅"
        fi
        echo -e "$status $name"
    done
}

# 查看日志
view_logs() {
    local date_str="${1:-$(date +%Y-%m-%d)}"
    
    echo -e "${BLUE}📋 查看测试日志: $date_str${NC}"
    echo "=========================="
    
    if [ -d "$SCRIPT_DIR/logs" ]; then
        # 查找指定日期的日志文件
        local log_files=$(find "$SCRIPT_DIR/logs" -name "*${date_str}*.log" 2>/dev/null | sort)
        
        if [ -n "$log_files" ]; then
            for log_file in $log_files; do
                echo -e "${GREEN}📄 $(basename "$log_file")${NC}"
                echo "---"
                tail -50 "$log_file" 2>/dev/null || echo "无法读取日志文件"
                echo ""
            done
        else
            echo -e "${YELLOW}⚠️  未找到 $date_str 的日志文件${NC}"
        fi
    else
        echo -e "${RED}❌ 日志目录不存在: $SCRIPT_DIR/logs${NC}"
    fi
}

# 生成报告
generate_report() {
    local date_str="${1:-$(date +%Y-%m-%d)}"
    
    echo -e "${BLUE}📊 生成测试报告: $date_str${NC}"
    echo "=========================="
    
    if [ -d "$SCRIPT_DIR/reports" ]; then
        local report_files=$(find "$SCRIPT_DIR/reports" -name "*${date_str}*.html" 2>/dev/null)
        
        if [ -n "$report_files" ]; then
            for report_file in $report_files; do
                echo -e "${GREEN}📄 报告文件: $(basename "$report_file")${NC}"
                echo -e "${BLUE}文件路径: $report_file${NC}"
                echo -e "${BLUE}文件大小: $(du -h "$report_file" | cut -f1)${NC}"
                echo -e "${BLUE}生成时间: $(stat -c %y "$report_file" 2>/dev/null || echo "未知")${NC}"
                echo ""
            done
        else
            echo -e "${YELLOW}⚠️  未找到 $date_str 的报告文件${NC}"
        fi
    else
        echo -e "${RED}❌ 报告目录不存在: $SCRIPT_DIR/reports${NC}"
    fi
}

# 清理旧文件
cleanup_files() {
    echo -e "${BLUE}🧹 清理旧日志和报告...${NC}"
    echo "=========================="
    
    local days_to_keep=30
    local current_date=$(date +%s)
    local deleted_count=0
    
    # 清理日志文件
    if [ -d "$SCRIPT_DIR/logs" ]; then
        while IFS= read -r -d '' file; do
            local file_date=$(stat -c %Y "$file" 2>/dev/null || echo "0")
            local age_days=$(( (current_date - file_date) / 86400 ))
            
            if [ $age_days -gt $days_to_keep ]; then
                rm -f "$file"
                deleted_count=$((deleted_count + 1))
                echo -e "${YELLOW}已删除日志: $(basename "$file") (年龄: ${age_days}天)${NC}"
            fi
        done < <(find "$SCRIPT_DIR/logs" -name "*.log" -print0 2>/dev/null)
    fi
    
    # 清理报告文件
    if [ -d "$SCRIPT_DIR/reports" ]; then
        while IFS= read -r -d '' file; do
            local file_date=$(stat -c %Y "$file" 2>/dev/null || echo "0")
            local age_days=$(( (current_date - file_date) / 86400 ))
            
            if [ $age_days -gt $days_to_keep ]; then
                rm -f "$file"
                deleted_count=$((deleted_count + 1))
                echo -e "${YELLOW}已删除报告: $(basename "$file") (年龄: ${age_days}天)${NC}"
            fi
        done < <(find "$SCRIPT_DIR/reports" -name "*.html" -print0 2>/dev/null)
    fi
    
    echo -e "${GREEN}✅ 清理完成，共删除 $deleted_count 个文件${NC}"
}

# 主函数
main() {
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    shift
    
    check_permissions
    
    case "$command" in
        schedule)
            schedule_tests "$@"
            ;;
        run-now)
            run_tests_now
            ;;
        cancel)
            cancel_tests
            ;;
        status)
            show_status
            ;;
        list)
            list_tasks
            ;;
        logs)
            view_logs "$@"
            ;;
        report)
            generate_report "$@"
            ;;
        cleanup)
            cleanup_files
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}错误: 未知命令 '$command'${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"