import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Users, DollarSign, Calendar, FileText, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  badge?: string;
  hotkey?: string;
  params?: Record<string, any>;
  usageCount?: number;
  lastUsedAt?: Date;
}

interface CopilotQuickActionsProps {
  shortcuts: QuickAction[];
  onExecute: (action: QuickAction) => void;
  className?: string;
  maxDisplay?: number;
}

export function CopilotQuickActions({ 
  shortcuts, 
  onExecute, 
  className, 
  maxDisplay = 6 
}: CopilotQuickActionsProps) {
  const [filteredShortcuts, setFilteredShortcuts] = useState<QuickAction[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 过滤和排序快捷操作
  useEffect(() => {
    const sorted = shortcuts
      .filter(shortcut => !shortcut.badge || shortcut.badge !== 'disabled')
      .sort((a, b) => {
        // 按使用频率和最近使用时间排序
        const scoreA = (a.usageCount || 0) * 10 + (a.lastUsedAt ? new Date(a.lastUsedAt).getTime() / 1000 : 0);
        const scoreB = (b.usageCount || 0) * 10 + (b.lastUsedAt ? new Date(b.lastUsedAt).getTime() / 1000 : 0);
        return scoreB - scoreA;
      })
      .slice(0, maxDisplay);

    setFilteredShortcuts(sorted);
  }, [shortcuts, maxDisplay]);

  // 获取图标组件
  const getIcon = (iconName: string) => {
    const icons = {
      'zap': Zap,
      'trending-up': TrendingUp,
      'users': Users,
      'dollar-sign': DollarSign,
      'calendar': Calendar,
      'file-text': FileText,
      'bar-chart-3': BarChart3,
      'settings': Settings,
    };

    const IconComponent = icons[iconName as keyof typeof icons] || Zap;
    return <IconComponent className="w-5 h-5" />;
  };

  // 获取徽章颜色
  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'hot':
        return 'bg-red-100 text-red-800';
      case 'beta':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 处理执行
  const handleExecute = (shortcut: QuickAction) => {
    // 更新使用统计
    updateUsageStats(shortcut.id);
    
    // 执行操作
    onExecute(shortcut);
  };

  // 更新使用统计（这里可以调用API）
  const updateUsageStats = (shortcutId: string) => {
    // 这里可以调用后端API更新使用统计
    console.log('Updating usage stats for shortcut:', shortcutId);
  };

  // 获取快捷键显示文本
  const formatHotkey = (hotkey?: string): string => {
    if (!hotkey) return '';
    
    return hotkey
      .split('+')
      .map(part => {
        switch (part.toLowerCase()) {
          case 'ctrl':
            return '⌘';
          case 'shift':
            return '⇧';
          case 'alt':
            return '⌥';
          default:
            return part.toUpperCase();
        }
      })
      .join('');
  };

  if (filteredShortcuts.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-white rounded-lg shadow-lg p-4 w-80 pointer-events-auto", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-gray-900">快捷操作</h3>
        </div>
        <span className="text-xs text-gray-500">
          {filteredShortcuts.length} 个可用
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredShortcuts.map((shortcut) => (
          <button
            key={shortcut.id}
            onClick={() => handleExecute(shortcut)}
            onMouseEnter={() => setHoveredId(shortcut.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "p-3 rounded-lg border transition-all duration-200 text-left",
              "hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              hoveredId === shortcut.id && "bg-blue-50 border-blue-200"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-shrink-0">
                {getIcon(shortcut.icon)}
              </div>
              {shortcut.badge && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  getBadgeColor(shortcut.badge)
                )}>
                  {shortcut.badge}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                {shortcut.title}
              </h4>
              
              {shortcut.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {shortcut.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              {shortcut.hotkey && (
                <span className="text-xs text-gray-500 font-mono">
                  {formatHotkey(shortcut.hotkey)}
                </span>
              )}
              
              {shortcut.usageCount && shortcut.usageCount > 0 && (
                <span className="text-xs text-gray-400">
                  使用 {shortcut.usageCount} 次
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {filteredShortcuts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">暂无快捷操作</p>
          <p className="text-xs mt-1">系统会根据您的使用习惯推荐操作</p>
        </div>
      )}
    </div>
  );
}

// 快捷操作生成器
export class QuickActionGenerator {
  // 基于角色生成推荐快捷操作
  static generateRoleBasedShortcuts(role: string): QuickAction[] {
    const baseActions = this.getBaseActions();
    const roleActions = this.getRoleSpecificActions(role);
    
    return [...baseActions, ...roleActions];
  }

  // 基础快捷操作
  private static getBaseActions(): QuickAction[] {
    return [
      {
        id: 'quick_search',
        title: '快速搜索',
        description: '搜索员工、客户、文档等',
        icon: 'zap',
        action: 'open_search',
        hotkey: 'ctrl+shift+f',
        badge: 'hot',
      },
      {
        id: 'recent_activity',
        title: '最近活动',
        description: '查看最近的操作记录',
        icon: 'trending-up',
        action: 'show_recent_activity',
        hotkey: 'ctrl+shift+r',
      },
      {
        id: 'export_data',
        title: '导出数据',
        description: '导出当前页面数据',
        icon: 'file-text',
        action: 'export_current_data',
        hotkey: 'ctrl+shift+e',
      },
    ];
  }

  // 角色特定的快捷操作
  private static getRoleSpecificActions(role: string): QuickAction[] {
    const actions: QuickAction[] = [];

    if (hasAnyRole(role, ['admin', 'operations_manager'])) {
      actions.push(
        {
          id: 'payroll_overview',
          title: '薪酬概览',
          description: '查看本月薪酬状态',
          icon: 'dollar-sign',
          action: 'navigate_payroll',
          badge: 'new',
        },
        {
          id: 'leave_summary',
          title: '休假汇总',
          description: '查看休假统计',
          icon: 'calendar',
          action: 'navigate_leave',
        },
        {
          id: 'employee_status',
          title: '员工状态',
          description: '查看员工状态分布',
          icon: 'users',
          action: 'show_employee_status',
        }
      );
    }

    if (hasAnyRole(role, ['admin', 'finance_manager'])) {
      actions.push(
        {
          id: 'financial_dashboard',
          title: '财务仪表板',
          description: '查看财务概览',
          icon: 'bar-chart-3',
          action: 'navigate_finance',
        },
        {
          id: 'invoice_status',
          title: '发票状态',
          description: '查看发票统计',
          icon: 'file-text',
          action: 'show_invoice_status',
        }
      );
    }

    if (hasAnyRole(role, ['admin', 'customer_manager'])) {
      actions.push(
        {
          id: 'customer_overview',
          title: '客户概览',
          description: '查看客户统计',
          icon: 'users',
          action: 'navigate_customers',
        },
        {
          id: 'contract_status',
          title: '合同状态',
          description: '查看合同概览',
          icon: 'file-text',
          action: 'show_contract_status',
        }
      );
    }

    return actions;
  }

  // 基于当前页面生成上下文相关的快捷操作
  static generateContextualShortcuts(currentPage: string, contextData: any): QuickAction[] {
    const actions: QuickAction[] = [];

    if (currentPage.includes('/payroll')) {
      actions.push(
        {
          id: 'create_payroll',
          title: '创建薪酬批次',
          description: '新建薪酬处理批次',
          icon: 'dollar-sign',
          action: 'create_payroll_batch',
          hotkey: 'ctrl+shift+n',
        },
        {
          id: 'export_payroll',
          title: '导出薪酬数据',
          description: '导出当前薪酬数据',
          icon: 'file-text',
          action: 'export_payroll_data',
        }
      );
    }

    if (currentPage.includes('/leave')) {
      actions.push(
        {
          id: 'approve_leave',
          title: '批量审批休假',
          description: '快速审批休假申请',
          icon: 'calendar',
          action: 'batch_approve_leave',
          hotkey: 'ctrl+shift+a',
        },
        {
          id: 'leave_balance',
          title: '休假余额查询',
          description: '查看员工休假余额',
          icon: 'users',
          action: 'show_leave_balance',
        }
      );
    }

    if (currentPage.includes('/employees')) {
      actions.push(
        {
          id: 'add_employee',
          title: '添加员工',
          description: '创建新员工记录',
          icon: 'users',
          action: 'add_employee',
          hotkey: 'ctrl+shift+n',
        },
        {
          id: 'employee_report',
          title: '员工报表',
          description: '生成员工统计报表',
          icon: 'bar-chart-3',
          action: 'generate_employee_report',
        }
      );
    }

    return actions;
  }

  // 基于用户行为生成个性化推荐
  static generatePersonalizedShortcuts(userId: number, usageHistory: any[]): QuickAction[] {
    const actions: QuickAction[] = [];

    // 分析使用历史，生成个性化推荐
    const frequentlyUsed = usageHistory
      .filter(item => item.usageCount > 5)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3);

    frequentlyUsed.forEach(item => {
      actions.push({
        id: `personalized_${item.action}`,
        title: `常用: ${item.title}`,
        description: item.description,
        icon: item.icon,
        action: item.action,
        badge: 'hot',
      });
    });

    return actions;
  }
}