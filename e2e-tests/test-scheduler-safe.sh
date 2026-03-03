#!/bin/bash

# 🕐 夜间测试调度管理器（无权限版本）
# 用于管理定时任务和测试调度 - 适用于没有crontab权限的环境

set -e

SCRIPT_DIR="/Users/simonprivate/Documents/Trae/geaplatform_trae/e2e-tests"
NIGHTLY_RUNNER="$SCRIPT_DIR/nightly-test-runner.sh"
SCHEDULE_FILE="$SCRIPT_DIR/.test-schedule"
PID_FILE="$SCRIPT_DIR/.test-scheduler.pid"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 帮助信息
show_help() {
    echo "🕐 夜间测试调度管理器（无权限版本）"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  schedule [时间]     - 设置夜间测试时间 (默认: 23:30)"
    echo "  run-now             - 立即运行测试"
    echo "  start-daemon        - 启动调度守护进程"
    echo "  stop-daemon       - 停止调度守护进程"
    echo "  status              - 查看调度状态"
    echo "  list                - 列出所有测试任务"
    echo "  logs [日期]         - 查看测试日志"
    echo "  report [日期]       - 生成测试报告"
    echo "  cleanup             - 清理旧日志和报告"
    echo "  help                - 显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 schedule 23:30   # 设置每晚23:30运行测试"
    echo "  $0 start-daemon   # 启动调度守护进程"
    echo "  $0 run-now          # 立即运行测试"
    echo ""
}

# 验证时间格式
validate_time() {
    local time_str="$1"
    if [[ "$time_str" =~ ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$ ]]; then
        return 0
    else
        return 1
    fi
}

# 设置定时任务
schedule_tests() {
    local time_str="${1:-23:30}"
    
    if ! validate_time "$time_str"; then
        echo -e "${RED}错误: 无效的时间格式。请使用 HH:MM 格式 (例如: 23:30)${NC}"
        exit 1
    fi
    
    # 检查脚本是否存在
    if [ ! -f "$NIGHTLY_RUNNER" ]; then
        echo -e "${RED}错误: 夜间测试运行器未找到: $NIGHTLY_RUNNER${NC}"
        exit 1
    fi
    
    # 使脚本可执行
    chmod +x "$NIGHTLY_RUNNER"
    
    # 保存调度时间
    echo "$time_str" > "$SCHEDULE_FILE"
    
    echo -e "${GREEN}✅ 定时测试已设置: 每天 $time_str${NC}"
    echo -e "${BLUE}📋 调度时间已保存到: $SCHEDULE_FILE${NC}"
    echo -e "${YELLOW}⚠️  需要启动守护进程才能生效: $0 start-daemon${NC}"
}

# 启动调度守护进程
start_daemon() {
    echo -e "${BLUE}🚀 启动调度守护进程...${NC}"
    
    # 检查是否已在运行
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  守护进程已在运行 (PID: $pid)${NC}"
            return 0
        else
            rm -f "$PID_FILE"
        fi
    fi
    
    # 检查调度时间是否设置
    if [ ! -f "$SCHEDULE_FILE" ]; then
        echo -e "${RED}错误: 请先设置调度时间: $0 schedule 23:30${NC}"
        exit 1
    fi
    
    # 启动守护进程
    nohup bash -c "
        while true; do
            current_time=\$(date '+%H:%M')
            scheduled_time=\$(cat '$SCHEDULE_FILE')
            
            if [ \"\$current_time\" = \"\$scheduled_time\" ]; then
                echo \"[\$(date)] 开始执行夜间测试\" >> '$SCRIPT_DIR/logs/daemon.log'
                '$NIGHTLY_RUNNER' >> '$SCRIPT_DIR/logs/daemon.log' 2>&1
                echo \"[\$(date)] 夜间测试完成\" >> '$SCRIPT_DIR/logs/daemon.log'
                # 等待一分钟，避免重复执行
                sleep 60
            fi
            
            # 每分钟检查一次
            sleep 60
        done
    " > /dev/null 2>&1 &
    
    local pid=$!
    echo "$pid" > "$PID_FILE"
    
    echo -e "${GREEN}✅ 调度守护进程已启动 (PID: $pid)${NC}"
    echo -e "${BLUE}📋 PID文件: $PID_FILE${NC}"
    echo -e "${BLUE}📋 日志文件: $SCRIPT_DIR/logs/daemon.log${NC}"
}

# 停止调度守护进程
stop_daemon() {
    echo -e "${BLUE}🛑 停止调度守护进程...${NC}"
    
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "$PID_FILE"
            echo -e "${GREEN}✅ 调度守护进程已停止 (PID: $pid)${NC}"
        else
            echo -e "${YELLOW}⚠️  守护进程未运行${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️  没有找到PID文件${NC}"
    fi
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

# 查看状态
show_status() {
    echo -e "${BLUE}📊 测试调度状态${NC}"
    echo "=========================="
    
    # 检查调度时间
    if [ -f "$SCHEDULE_FILE" ]; then
        local scheduled_time=$(cat "$SCHEDULE_FILE")
        echo -e "${GREEN}✅ 调度时间已设置: $scheduled_time${NC}"
    else
        echo -e "${YELLOW}⚠️  调度时间未设置${NC}"
    fi
    
    # 检查守护进程状态
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}🔄 调度守护进程正在运行 (PID: $pid)${NC}"
            echo -e "${BLUE}📋 守护进程启动时间: $(ps -o lstart= -p "$pid" 2>/dev/null || echo "未知")${NC}"
        else
            echo -e "${RED}❌ 守护进程PID文件存在但进程未运行${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}⏸️  调度守护进程未运行${NC}"
    fi
    
    # 显示最近的日志
    echo -e "${BLUE}📋 最近日志:${NC}"
    if [ -d "$SCRIPT_DIR/logs" ]; then
        local latest_log=$(ls -t "$SCRIPT_DIR/logs"/*.log 2>/dev/null | head -1)
        if [ -n "$latest_log" ]; then
            echo -e "${BLUE}最新日志: $(basename "$latest_log")${NC}"
            echo -e "${BLUE}日志时间: $(stat -c %y "$latest_log" 2>/dev/null || echo "未知")${NC}"
        fi
        
        # 显示守护进程日志
        if [ -f "$SCRIPT_DIR/logs/daemon.log" ]; then
            echo -e "${BLUE}守护进程日志: $SCRIPT_DIR/logs/daemon.log${NC}"
            echo -e "${BLUE}最后更新时间: $(stat -c %y "$SCRIPT_DIR/logs/daemon.log" 2>/dev/null || echo "未知")${NC}"
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
        
        # 显示守护进程日志
        if [ -f "$SCRIPT_DIR/logs/daemon.log" ]; then
            echo -e "${BLUE}📄 守护进程日志: $SCRIPT_DIR/logs/daemon.log${NC}"
            echo "---"
            tail -20 "$SCRIPT_DIR/logs/daemon.log" 2>/dev/null || echo "无法读取守护进程日志"
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
    
    case "$command" in
        schedule)
            schedule_tests "$@"
            ;;
        start-daemon)
            start_daemon
            ;;
        stop-daemon)
            stop_daemon
            ;;
        run-now)
            run_tests_now
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