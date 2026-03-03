import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, AlertCircle, Info, X, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prediction {
  id: string;
  type: 'deadline_risk' | 'anomaly' | 'insight' | 'trend';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: Date;
  suggestedAction?: {
    label: string;
    action: string;
    params?: Record<string, any>;
  };
  isDismissed?: boolean;
  dismissedAt?: Date;
}

interface CopilotPredictionsProps {
  predictions: Prediction[];
  onAction: (action: string, params?: Record<string, any>) => void;
  className?: string;
  maxDisplay?: number;
}

export function CopilotPredictions({ 
  predictions, 
  onAction, 
  className, 
  maxDisplay = 3 
}: CopilotPredictionsProps) {
  const [activePredictions, setActivePredictions] = useState<Prediction[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // 过滤和排序预测
  useEffect(() => {
    const now = new Date();
    const filtered = predictions
      .filter(p => !p.isDismissed && !dismissedIds.has(p.id))
      .filter(p => !p.expiresAt || p.expiresAt > now)
      .sort((a, b) => {
        // 按严重程度排序：critical > high > medium > low
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, maxDisplay);

    setActivePredictions(filtered);
  }, [predictions, dismissedIds, maxDisplay]);

  // 获取图标
  const getIcon = (type: Prediction['type'], severity: Prediction['severity']) => {
    const iconClass = "w-5 h-5";
    
    switch (type) {
      case 'deadline_risk':
        return <Clock className={cn(iconClass, getSeverityColor(severity))} />;
      case 'anomaly':
        return <AlertTriangle className={cn(iconClass, getSeverityColor(severity))} />;
      case 'insight':
        return <TrendingUp className={cn(iconClass, getSeverityColor(severity))} />;
      case 'trend':
        return <Info className={cn(iconClass, getSeverityColor(severity))} />;
      default:
        return <AlertCircle className={cn(iconClass, getSeverityColor(severity))} />;
    }
  };

  // 获取颜色
  const getSeverityColor = (severity: Prediction['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // 获取背景色
  const getBackgroundColor = (severity: Prediction['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // 获取倒计时
  const getCountdown = (expiresAt?: Date): string => {
    if (!expiresAt) return '';
    
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return '已过期';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟后过期`;
    } else {
      return `${minutes}分钟后过期`;
    }
  };

  // 处理操作
  const handleAction = (prediction: Prediction) => {
    if (prediction.suggestedAction) {
      onAction(prediction.suggestedAction.action, prediction.suggestedAction.params);
    }
  };

  // 忽略预测
  const dismissPrediction = (predictionId: string) => {
    setDismissedIds(prev => new Set([...prev, predictionId]));
  };

  // 如果没有任何活跃预测，返回null
  if (activePredictions.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2 mb-4 pointer-events-auto", className)}>
      {activePredictions.map((prediction) => (
        <div
          key={prediction.id}
          className={cn(
            "border rounded-lg p-3 shadow-sm transition-all duration-200",
            getBackgroundColor(prediction.severity),
            "hover:shadow-md"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* 图标 */}
              <div className="mt-0.5">
                {getIcon(prediction.type, prediction.severity)}
              </div>
              
              {/* 内容 */}
              <div className="flex-1 min-w-0">
                {/* 标题 */}
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {prediction.title}
                  </h4>
                  
                  {/* 置信度 */}
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    "bg-white/80 text-gray-600"
                  )}>
                    {prediction.confidence}% 置信度
                  </span>
                </div>
                
                {/* 描述 */}
                <p className="text-sm text-gray-700 mb-2">
                  {prediction.description}
                </p>
                
                {/* 过期时间 */}
                {prediction.expiresAt && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{getCountdown(prediction.expiresAt)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center gap-1 ml-3">
              {/* 建议操作 */}
              {prediction.suggestedAction && (
                <button
                  onClick={() => handleAction(prediction)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md transition-colors",
                    "bg-white/80 hover:bg-white text-gray-700 border"
                  )}
                >
                  {prediction.suggestedAction.label}
                </button>
              )}
              
              {/* 忽略按钮 */}
              <button
                onClick={() => dismissPrediction(prediction.id)}
                className="p-1 hover:bg-white/50 rounded transition-colors"
                title="忽略此预测"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 预测生成器（用于模拟和实际预测）
export class PredictionGenerator {
  // 基于运营数据生成预测
  static async generateOperationalPredictions(data: any): Promise<Prediction[]> {
    const predictions: Prediction[] = [];

    // 薪酬截止风险预测
    const payrollPrediction = this.analyzePayrollDeadline(data.payroll);
    if (payrollPrediction) {
      predictions.push(payrollPrediction);
    }

    // 休假异常预测
    const leavePredictions = this.analyzeLeaveAnomalies(data.leave);
    predictions.push(...leavePredictions);

    // 财务异常预测
    const financialPredictions = this.analyzeFinancialAnomalies(data.financial);
    predictions.push(...financialPredictions);

    // 员工状态预测
    const employeePredictions = this.analyzeEmployeeStatus(data.employees);
    predictions.push(...employeePredictions);

    return predictions;
  }

  // 分析薪酬截止风险
  private static analyzePayrollDeadline(payrollData: any): Prediction | null {
    if (!payrollData?.stats) return null;

    const { draftCount, pendingCount } = payrollData.stats;
    const currentDay = new Date().getDate();
    const daysUntilDeadline = Math.max(0, 5 - currentDay);

    if (daysUntilDeadline <= 2 && (draftCount > 0 || pendingCount > 3)) {
      return {
        id: `payroll_deadline_${Date.now()}`,
        type: 'deadline_risk',
        title: '薪酬批次截止风险',
        description: `${draftCount}个薪酬批次仍在草稿状态，${pendingCount}个批次等待审批，距离截止仅剩${daysUntilDeadline}天`,
        confidence: 85,
        severity: daysUntilDeadline === 0 ? 'critical' : 'high',
        expiresAt: new Date(new Date().setDate(5)),
        suggestedAction: {
          label: '查看薪酬批次',
          action: 'navigate_payroll',
        },
      };
    }

    return null;
  }

  // 分析休假异常
  private static analyzeLeaveAnomalies(leaveData: any): Prediction[] {
    const predictions: Prediction[] = [];
    
    if (!leaveData?.stats) return predictions;

    const { pendingCount } = leaveData.stats;

    if (pendingCount > 5) {
      predictions.push({
        id: `leave_pending_${Date.now()}`,
        type: 'anomaly',
        title: '休假审批积压',
        description: `${pendingCount}条休假申请等待审批，可能存在审批延迟`,
        confidence: 75,
        severity: 'medium',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
        suggestedAction: {
          label: '查看休假申请',
          action: 'navigate_leave',
        },
      });
    }

    return predictions;
  }

  // 分析财务异常
  private static analyzeFinancialAnomalies(financialData: any): Prediction[] {
    const predictions: Prediction[] = [];
    
    if (!financialData?.invoices) return predictions;

    const overdueInvoices = financialData.invoices.filter((inv: any) => 
      inv.status === 'overdue'
    );

    if (overdueInvoices.length > 3) {
      predictions.push({
        id: `overdue_invoices_${Date.now()}`,
        type: 'anomaly',
        title: '逾期发票过多',
        description: `${overdueInvoices.length}张发票已逾期，需要跟进催收`,
        confidence: 90,
        severity: 'high',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
        suggestedAction: {
          label: '查看逾期发票',
          action: 'navigate_invoices',
          params: { filter: 'overdue' },
        },
      });
    }

    return predictions;
  }

  // 分析员工状态
  private static analyzeEmployeeStatus(employeeData: any): Prediction[] {
    const predictions: Prediction[] = [];
    
    if (!employeeData?.stats) return predictions;

    const { probationCount } = employeeData.stats;

    if (probationCount > 10) {
      predictions.push({
        id: `probation_employees_${Date.now()}`,
        type: 'insight',
        title: '试用期员工较多',
        description: `${probationCount}名员工处于试用期，需要关注转正评估`,
        confidence: 80,
        severity: 'low',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
        suggestedAction: {
          label: '查看试用期员工',
          action: 'navigate_employees',
          params: { filter: 'probation' },
        },
      });
    }

    return predictions;
  }
}