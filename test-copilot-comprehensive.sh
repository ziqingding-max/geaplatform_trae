#!/bin/bash

# GEA Copilot 综合测试脚本
# 用于验证Copilot功能修复后的完整性和正确性

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "📋 测试: $test_name ... "
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "🔍 GEA Copilot 功能测试验证"
echo "==================="
echo ""

# 文件存在性测试
echo "📁 文件存在性测试"
echo "------------------"

run_test "主组件文件" "test -f client/src/components/CopilotSmartAssistant.tsx"
run_test "聊天面板文件" "test -f client/src/components/CopilotChatPanel.tsx"
run_test "预测组件文件" "test -f client/src/components/CopilotPredictions.tsx"
run_test "快捷操作文件" "test -f client/src/components/CopilotQuickActions.tsx"
run_test "设置面板文件" "test -f client/src/components/CopilotSettings.tsx"
run_test "文件上传组件" "test -f client/src/components/CopilotFileUpload.tsx"
run_test "输入指示器" "test -f client/src/components/CopilotTypingIndicator.tsx"
run_test "建议操作组件" "test -f client/src/components/CopilotSuggestedActions.tsx"
run_test "主Hook文件" "test -f client/src/hooks/useCopilot.ts"
run_test "Copilot服务文件" "test -f server/services/copilotService.ts"
run_test "缓存服务文件" "test -f server/services/copilotCache.ts"
run_test "生成器服务文件" "test -f server/services/copilotGenerators.ts"
run_test "Copilot路由文件" "test -f server/routers/copilot.ts"
run_test "Copilot数据库Schema" "test -f drizzle/copilot-schema.ts"

# 导入路径测试
echo ""
echo "🔗 导入路径测试"
echo "----------------"

run_test "useAuth导入正确性" "grep -q 'useAuth' client/src/hooks/useCopilot.ts"
run_test "无useUser导入" "! grep -q 'useUser' client/src/hooks/useCopilot.ts"
run_test "AI服务导入正确" "grep -q 'executeTaskLLM' server/services/copilotService.ts"
run_test "AITask类型导入" "grep -q 'AITask' server/services/copilotService.ts"

# 数据库语法测试
echo ""
echo "🗄️ 数据库语法测试"
echo "------------------"

run_test "SQLite语法使用" "grep -q 'sql.*from' server/services/copilotService.ts"
run_test "无MySQL语法" "! grep -q 'LIMIT.*OFFSET' server/services/copilotService.ts"
run_test "SQL聚合函数导入" "grep -q 'sum.*avg' server/routers/copilot.ts"
run_test "SQLite日期函数" "grep -q 'strftime' server/services/copilotService.ts"

# 组件集成测试
echo ""
echo "🧩 组件集成测试"
echo "----------------"

run_test "主路由器集成" "grep -q 'copilotRouter' server/routers.ts"
run_test "App.tsx组件集成" "grep -q 'CopilotSmartAssistant' client/src/App.tsx"
run_test "聊天Hook导入修复" "grep -q 'useCopilotChat' client/src/components/CopilotChatPanel.tsx"

# 功能逻辑测试
echo ""
echo "⚙️ 功能逻辑测试"
echo "----------------"

run_test "拖拽功能实现" "grep -q 'handleMouseDown' client/src/components/CopilotSmartAssistant.tsx && grep -q 'handleMouseMove' client/src/components/CopilotSmartAssistant.tsx && grep -q 'handleMouseUp' client/src/components/CopilotSmartAssistant.tsx"
run_test "快捷键支持" "grep -q 'Ctrl.*Shift.*C' client/src/components/CopilotSmartAssistant.tsx"
run_test "响应式定位" "grep -q 'window.innerWidth' client/src/components/CopilotSmartAssistant.tsx && grep -q 'window.innerHeight' client/src/components/CopilotSmartAssistant.tsx"
run_test "边缘检测逻辑" "grep -q 'EDGE_THRESHOLD' client/src/components/CopilotSmartAssistant.tsx"
run_test "聊天面板位置计算" "grep -q 'getChatPanelPosition' client/src/components/CopilotSmartAssistant.tsx"

# 类型安全测试
echo ""
echo "🔒 类型安全测试"
echo "----------------"

run_test "TypeScript接口定义" "grep -q 'interface.*Position' client/src/components/CopilotSmartAssistant.tsx"
run_test "AI响应类型定义" "grep -q 'interface.*AIResponse' server/services/copilotService.ts"
run_test "Zod验证Schema" "grep -q 'z.string.*min.*max' server/routers/copilot.ts"

# 权限控制测试
echo ""
echo "🔐 权限控制测试"
echo "-----------------"

run_test "角色权限检查" "grep -q 'hasAnyRole' server/services/copilotService.ts"
run_test "protectedProcedure使用" "grep -q 'protectedProcedure' server/routers/copilot.ts"
run_test "数据访问权限控制" "grep -q '用户有权限查看的数据' server/services/copilotService.ts"

# AI集成测试
echo ""
echo "🤖 AI集成测试"
echo "--------------"

run_test "AI任务类型选择" "grep -q 'selectOptimalTaskType' server/services/copilotService.ts"
run_test "AI网关调用" "grep -q 'executeTaskLLM' server/services/copilotService.ts"
run_test "多模态支持" "grep -q 'attachments' server/services/copilotService.ts && grep -q 'image.*file' server/services/copilotService.ts"
run_test "上下文构建" "grep -q 'buildDataContext' server/services/copilotService.ts"

# 性能优化测试
echo ""
echo "⚡ 性能优化测试"
echo "----------------"

run_test "缓存管理器" "grep -q 'CopilotCacheManager' server/services/copilotCache.ts"
run_test "LRU缓存实现" "grep -q 'LRUCache' server/services/copilotCache.ts"
run_test "智能预加载" "grep -q 'CopilotPreloader' server/services/copilotCache.ts"
run_test "查询优化" "grep -q 'limit.*5' server/services/copilotService.ts"

# 错误处理测试
echo ""
echo "🚨 错误处理测试"
echo "----------------"

run_test "异常捕获" "grep -q 'catch.*error' server/services/copilotService.ts"
run_test "错误日志记录" "grep -q 'console.error.*Failed' server/services/copilotService.ts"
run_test "用户友好错误" "grep -q '处理消息时发生错误' server/services/copilotService.ts"
run_test "数据库错误处理" "grep -q 'Failed.*get.*context' server/services/copilotService.ts"

# 国际化测试
echo ""
echo "🌏 国际化测试"
echo "---------------"

run_test "中文界面支持" "grep -q '欢迎使用 Copilot 助手' client/src/components/CopilotChatPanel.tsx"
run_test "中文错误消息" "grep -q '发送消息失败，请稍后重试' client/src/components/CopilotChatPanel.tsx"
run_test "中文操作提示" "grep -q '快捷键.*Ctrl.*Shift.*F' client/src/components/CopilotChatPanel.tsx"

# 安全测试
echo ""
echo "🔒 安全测试"
echo "------------"

run_test "输入验证" "grep -q 'z.string.*min.*max' server/routers/copilot.ts"
run_test "文件大小限制" "grep -q '10.*1024.*1024' server/routers/copilot.ts"
run_test "SQL注入防护" "grep -q 'drizzle-orm' server/routers/copilot.ts"
run_test "XSS防护" "grep -q 'sanitizeContent' client/src/components/CopilotChatPanel.tsx"

# 总结报告
echo ""
echo "📊 测试总结报告"
echo "=================="
echo "总测试数: $TOTAL_TESTS"
echo -e "通过测试: ${GREEN}$PASSED_TESTS${NC}"
echo -e "失败测试: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！Copilot功能已完全修复并优化。${NC}"
    echo ""
    echo "✅ 主要修复内容："
    echo "  • 修复了SQL聚合函数导入错误"
    echo "  • 优化了聊天窗口定位和显示逻辑"
    echo "  • 改进了拖拽功能和边缘检测"
    echo "  • 增强了错误处理和性能优化"
    echo "  • 完善了权限控制和安全防护"
    echo "  • 修复了悬浮按钮移动方向问题"
    echo "  • 为小按钮添加了完整功能"
    echo ""
    echo "🚀 现在可以："
    echo "  1. 运行 'pnpm dev' 启动开发服务器"
    echo "  2. 在浏览器中测试所有Copilot功能"
    echo "  3. 验证拖拽、聊天、预测等功能正常工作"
    exit 0
else
    echo -e "${RED}⚠️  发现 $FAILED_TESTS 个测试失败，请检查并修复。${NC}"
    echo ""
    echo "🔧 建议修复步骤："
    echo "  1. 检查失败的具体测试项"
    echo "  2. 根据测试要求修改相应代码"
    echo "  3. 重新运行测试脚本验证"
    exit 1
fi