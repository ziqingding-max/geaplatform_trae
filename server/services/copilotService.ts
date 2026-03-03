import { eq, and, desc, sql, count, sum, avg } from "drizzle-orm";
import { 
  copilotUserConfigs, 
  copilotConversations, 
  copilotMessages, 
  copilotFileAnalyses, 
  copilotPredictions, 
  copilotShortcuts, 
  copilotMetrics,
  users,
  customers,
  employees,
  payrollRuns,
  leaveRecords,
  adjustments,
  reimbursements,
  invoices,
  countriesConfig,
  exchangeRates
} from "../../drizzle/schema";
import { getDb } from "../db";
import { invokeAIGateway, type AITask, type AIProvider } from "./aiGatewayService";
import { hasAnyRole } from "../../shared/roles";
import { storagePut } from "../storage";
import { ENV } from "../_core/env";
import { getCopilotCacheManager } from "./copilotCache";

// 扩展AI任务类型
export const COPILOT_TASKS = [
  "copilot_chat",
  "copilot_data_analysis", 
  "copilot_file_analysis",
  "copilot_report_generation",
  "copilot_insights_extraction",
  "copilot_payroll_analysis",
  "copilot_leave_analysis",
  "copilot_financial_analysis"
] as const;

export type CopilotTask = typeof COPILOT_TASKS[number];

// 核心接口定义
export interface AIContext {
  userMessage: string;
  dataContext?: DataContext;
  attachments?: Attachment[];
  options?: AIOptions;
  userRole: string;
  currentPage?: string;
}

export interface DataContext {
  accessibleScopes: DataScope;
  relevantData: any;
  summary: string;
  sources: string[];
}

export interface DataScope {
  customers: boolean;
  employees: boolean;
  payroll: boolean;
  invoices: boolean;
  vendors: boolean;
  reports: boolean;
  sales: boolean;
}

export interface Attachment {
  type: "image" | "file";
  url: string;
  name: string;
  mimeType?: string;
}

export interface AIOptions {
  preferredProvider?: AIProvider;
  creativityLevel?: "conservative" | "balanced" | "creative";
  responseFormat?: "text" | "json" | "markdown";
}

export interface AIResponse {
  text: string;
  suggestedActions?: SuggestedAction[];
  confidence?: number;
  providerUsed?: string;
  modelUsed?: string;
  costEstimate?: number;
}

export interface SuggestedAction {
  type: "navigate" | "export" | "create" | "analyze";
  label: string;
  target?: string;
  params?: Record<string, any>;
}

export interface Prediction {
  id: string;
  type: "deadline_risk" | "anomaly" | "insight" | "trend";
  title: string;
  description: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  expiresAt?: Date;
  suggestedAction?: SuggestedAction;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  badge?: string;
  hotkey?: string;
  params?: Record<string, any>;
}

export interface OperationalContext {
  currentPage?: string;
  selectedCustomerId?: string;
  selectedEmployeeId?: string;
  selectedPayrollId?: string;
  payrollBatches?: any[];
  leaveRecords?: any[];
  userRole: string;
}

// 主服务类
export class CopilotService {
  private db: any;
  private userId: number;
  private userRole: string;
  private cacheManager: any;

  constructor(userId: number, userRole: string) {
    this.userId = userId;
    this.userRole = userRole;
    this.cacheManager = getCopilotCacheManager();
  }

  private async ensureDb() {
    if (!this.db) {
      this.db = await getDb();
    }
    return this.db;
  }

  // 获取用户配置
  async getUserConfig(): Promise<CopilotUserConfig | null> {
    const db = await this.ensureDb();
    const configs = await db
      .select()
      .from(copilotUserConfigs)
      .where(eq(copilotUserConfigs.userId, this.userId))
      .limit(1);
    
    return configs[0] || null;
  }

  // 更新用户配置
  async updateUserConfig(config: Partial<CopilotUserConfig>): Promise<boolean> {
    const db = await this.ensureDb();
    const existing = await this.getUserConfig();
    
    if (existing) {
      await db
        .update(copilotUserConfigs)
        .set({
          ...config,
          updatedAt: new Date(),
        })
        .where(eq(copilotUserConfigs.id, existing.id));
    } else {
      await db
        .insert(copilotUserConfigs)
        .values({
          userId: this.userId,
          preferences: config.preferences || {},
          hotkeys: config.hotkeys || {},
          enabledFeatures: config.enabledFeatures || ["chat", "predictions", "shortcuts"],
          theme: config.theme || "auto",
          language: config.language || "zh",
          position: config.position || "bottom-right",
          isEnabled: config.isEnabled !== false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }
    
    return true;
  }

  // 处理聊天消息
  async processChatMessage(
    message: string,
    context?: OperationalContext,
    attachments?: Attachment[],
    options?: AIOptions
  ): Promise<AIResponse> {
    const db = await this.ensureDb();
    
    try {
      // 1. 获取或创建会话
      let conversation = await this.getActiveConversation();
      if (!conversation) {
        conversation = await this.createConversation(context);
      }

      // 2. 保存用户消息
      await this.saveMessage(conversation.id, "user", message, attachments);

      // 3. 构建数据上下文
      const dataContext = await this.buildDataContext(message, context);

      // 4. 选择最优任务类型
      const taskType = this.selectOptimalTaskType(message, attachments, dataContext);

      // 5. 生成AI响应
      const aiResponse = await this.generateAIResponse({
        userMessage: message,
        dataContext,
        attachments,
        options,
        userRole: this.userRole,
        currentPage: context?.currentPage,
      });

      // 6. 保存AI响应
      await this.saveMessage(conversation.id, "assistant", aiResponse.text, undefined, {
        taskType,
        providerUsed: aiResponse.providerUsed,
        modelUsed: aiResponse.modelUsed,
        costEstimate: aiResponse.costEstimate,
        processingTime: Date.now(),
      });

      // 7. 更新会话统计
      await this.updateConversationStats(conversation.id);

      return aiResponse;

    } catch (error) {
      console.error("[CopilotService] Chat processing error:", error);
      throw new Error("处理消息时发生错误，请稍后重试");
    }
  }

  // 获取活跃的会话
  private async getActiveConversation(): Promise<CopilotConversation | null> {
    const db = await this.ensureDb();
    const conversations = await db
      .select()
      .from(copilotConversations)
      .where(and(
        eq(copilotConversations.userId, this.userId),
        eq(copilotConversations.isActive, true)
      ))
      .orderBy(desc(copilotConversations.lastMessageAt))
      .limit(1);
    
    return conversations[0] || null;
  }

  // 创建新会话
  private async createConversation(context?: OperationalContext): Promise<CopilotConversation> {
    const db = await this.ensureDb();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [conversation] = await db
      .insert(copilotConversations)
      .values({
        userId: this.userId,
        sessionId,
        title: "新对话",
        context: context || {},
        messageCount: 0,
        isActive: true,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return conversation;
  }

  // 保存消息
  private async saveMessage(
    conversationId: number,
    role: "user" | "assistant" | "system",
    content: string,
    attachments?: Attachment[],
    metadata?: any
  ): Promise<void> {
    const db = await this.ensureDb();
    
    await db
      .insert(copilotMessages)
      .values({
        conversationId,
        role,
        content,
        attachments: attachments || null,
        metadata: metadata || null,
        createdAt: new Date(),
      });
  }

  // 更新会话统计
  private async updateConversationStats(conversationId: number): Promise<void> {
    const db = await this.ensureDb();
    
    const messageCount = await db
      .select({ count: count() })
      .from(copilotMessages)
      .where(eq(copilotMessages.conversationId, conversationId));
    
    await db
      .update(copilotConversations)
      .set({
        messageCount: messageCount[0].count,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(copilotConversations.id, conversationId));
  }

  // 构建数据上下文
  private async buildDataContext(message: string, context?: OperationalContext): Promise<DataContext> {
    const accessibleScopes = this.getAccessibleScopes();
    const relevantData: any = {};
    const sources: string[] = [];

    try {
      // 分析消息意图，提取相关数据
      if (this.containsPayrollKeywords(message) && accessibleScopes.payroll) {
        const payrollData = await this.getPayrollData(context);
        relevantData.payroll = payrollData;
        sources.push("payroll_runs");
      }

      if (this.containsLeaveKeywords(message) && accessibleScopes.employees) {
        const leaveData = await this.getLeaveData(context);
        relevantData.leave = leaveData;
        sources.push("leave_records");
      }

      if (this.containsFinancialKeywords(message) && accessibleScopes.invoices) {
        const financialData = await this.getFinancialData(context);
        relevantData.financial = financialData;
        sources.push("invoices", "exchange_rates");
      }

      if (this.containsEmployeeKeywords(message) && accessibleScopes.employees) {
        const employeeData = await this.getEmployeeData(context);
        relevantData.employees = employeeData;
        sources.push("employees");
      }

      // 生成数据摘要
      const summary = this.generateDataSummary(relevantData);

      return {
        accessibleScopes,
        relevantData,
        summary,
        sources,
      };

    } catch (error) {
      console.error("[CopilotService] Error building data context:", error);
      return {
        accessibleScopes,
        relevantData: {},
        summary: "数据获取失败",
        sources: [],
      };
    }
  }

  // 获取权限范围
  private getAccessibleScopes(): DataScope {
    return {
      customers: hasAnyRole(this.userRole, ["admin", "customer_manager"]),
      employees: hasAnyRole(this.userRole, ["admin", "customer_manager", "operations_manager"]),
      payroll: hasAnyRole(this.userRole, ["admin", "operations_manager"]),
      invoices: hasAnyRole(this.userRole, ["admin", "finance_manager"]),
      vendors: hasAnyRole(this.userRole, ["admin", "finance_manager"]),
      reports: hasAnyRole(this.userRole, ["admin", "finance_manager", "operations_manager"]),
      sales: hasAnyRole(this.userRole, ["admin", "customer_manager"]),
    };
  }

  // 选择最优任务类型
  private selectOptimalTaskType(message: string, attachments?: Attachment[], dataContext?: DataContext): AITask {
    // 基于附件类型选择
    if (attachments && attachments.length > 0) {
      const hasImages = attachments.some(a => a.type === 'image');
      const hasFiles = attachments.some(a => a.type === 'file');
      
      if (hasImages) return "copilot_file_analysis";
      if (hasFiles) {
        const fileTypes = attachments.map(a => this.getFileExtension(a.name));
        if (fileTypes.some(ext => ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext))) {
          return "copilot_file_analysis";
        }
      }
    }

    // 基于消息内容和数据上下文选择
    const lowerMessage = message.toLowerCase();
    
    if (this.containsPayrollKeywords(lowerMessage)) {
      return "copilot_payroll_analysis";
    }
    
    if (this.containsLeaveKeywords(lowerMessage)) {
      return "copilot_leave_analysis";
    }
    
    if (this.containsFinancialKeywords(lowerMessage)) {
      return "copilot_financial_analysis";
    }
    
    if (this.containsReportKeywords(lowerMessage)) {
      return "copilot_report_generation";
    }
    
    if (this.containsInsightKeywords(lowerMessage)) {
      return "copilot_insights_extraction";
    }
    
    return "copilot_chat";
  }

  // 生成AI响应
  private async generateAIResponse(context: AIContext): Promise<AIResponse> {
    const { userMessage, dataContext, attachments, options, userRole, currentPage } = context;
    
    // 构建系统提示词
    const systemPrompt = this.buildSystemPrompt(userRole, dataContext);
    
    // 构建用户提示词
    const userPrompt = this.buildUserPrompt(userMessage, dataContext, attachments, currentPage);

    // 通过AI Gateway调用
    const result = await invokeAIGateway({
      task: this.selectOptimalTaskType(userMessage, attachments, dataContext),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      maxTokens: this.calculateOptimalMaxTokens(dataContext),
      temperature: this.calculateOptimalTemperature(userMessage),
      ...(options?.preferredProvider && { preferredProvider: options.preferredProvider }),
    });

    // 提取建议操作
    const suggestedActions = this.extractSuggestedActions(result.content, userMessage, dataContext);

    return {
      text: result.content,
      suggestedActions,
      confidence: result.confidence,
      providerUsed: result.provider,
      modelUsed: result.model,
      costEstimate: parseFloat(result.costEstimate || "0"),
    };
  }

  // 构建系统提示词
  private buildSystemPrompt(userRole: string, dataContext?: DataContext): string {
    const basePrompt = `你是一个专业的企业运营助手，帮助用户分析数据、解答问题和提供建议。`;
    
    const roleContext = this.getRoleSpecificContext(userRole);
    
    const dataContextPrompt = dataContext ? `
可访问的数据范围：
${Object.entries(dataContext.accessibleScopes)
  .filter(([_, accessible]) => accessible)
  .map(([scope, _]) => `- ${scope}: 可访问`)
  .join('\n')}

当前数据摘要：${dataContext.summary}
` : '';

    const safetyGuidelines = `
重要原则：
1. 只基于用户权限范围内的数据进行分析
2. 不提供具体的个人敏感信息（如薪资、银行账号等）
3. 使用专业的商业语言
4. 提供可操作的建议
5. 如不确定，建议用户咨询相关专业人士
`;

    return `${basePrompt}\n\n${roleContext}\n\n${dataContextPrompt}\n\n${safetyGuidelines}`;
  }

  // 获取角色特定上下文
  private getRoleSpecificContext(userRole: string): string {
    const contexts = {
      "admin": "作为系统管理员，你可以访问所有数据和功能，请提供全面的分析和建议。",
      "customer_manager": "作为客户经理，你专注于客户管理、合同和销售相关数据，请重点关注客户关系和业务拓展。",
      "operations_manager": "作为运营经理，你专注于员工管理、薪资、休假等运营数据，请重点关注运营效率和合规性。",
      "finance_manager": "作为财务经理，你专注于发票、财务报表、成本分析等财务数据，请重点关注财务健康和成本控制。",
      "user": "作为普通用户，你具有基础的查看权限，请基于可用数据提供帮助。"
    };
    
    return contexts[userRole as keyof typeof contexts] || "请基于你的角色权限范围提供帮助。";
  }

  // 构建用户提示词
  private buildUserPrompt(
    userMessage: string, 
    dataContext?: DataContext, 
    attachments?: Attachment[],
    currentPage?: string
  ): string {
    let prompt = `用户问题：${userMessage}\n\n`;
    
    if (currentPage) {
      prompt += `当前页面：${currentPage}\n\n`;
    }
    
    if (dataContext?.relevantData && Object.keys(dataContext.relevantData).length > 0) {
      prompt += `相关数据：\n${JSON.stringify(dataContext.relevantData, null, 2)}\n\n`;
    }

    if (attachments && attachments.length > 0) {
      prompt += `附件信息：${attachments.length} 个文件已上传\n`;
      prompt += `文件类型：${attachments.map(a => a.type).join(", ")}\n\n`;
    }

    prompt += `请基于以上信息提供专业的分析和建议，使用中文回答。`;
    return prompt;
  }

  // 计算最优maxTokens
  private calculateOptimalMaxTokens(dataContext?: DataContext): number {
    let maxTokens = 2000; // 默认值
    
    if (dataContext?.relevantData) {
      const dataSize = JSON.stringify(dataContext.relevantData).length;
      if (dataSize > 10000) maxTokens += 1000;
      if (dataSize > 50000) maxTokens += 2000;
    }
    
    return Math.min(maxTokens, 8000); // 上限8000
  }

  // 计算最优temperature
  private calculateOptimalTemperature(message: string): number {
    const lowerMessage = message.toLowerCase();
    
    // 分析类任务需要较低temperature
    if (this.containsAnalysisKeywords(lowerMessage)) {
      return 0.3;
    }
    
    // 创意类任务需要较高temperature
    if (this.containsCreativeKeywords(lowerMessage)) {
      return 0.8;
    }
    
    // 默认平衡值
    return 0.5;
  }

  // 提取建议操作
  private extractSuggestedActions(content: string, userMessage: string, dataContext?: DataContext): SuggestedAction[] {
    const actions: SuggestedAction[] = [];
    
    // 基于内容分析建议操作
    if (content.includes("查看详细") || content.includes("详细信息")) {
      actions.push({
        type: "navigate",
        label: "查看详细数据",
        target: "dashboard",
      });
    }
    
    if (content.includes("导出") || content.includes("下载")) {
      actions.push({
        type: "export",
        label: "导出数据",
        format: "excel",
      });
    }
    
    if (content.includes("创建") || content.includes("新建")) {
      actions.push({
        type: "create",
        label: "创建新记录",
      });
    }
    
    if (this.containsAnalysisKeywords(userMessage)) {
      actions.push({
        type: "analyze",
        label: "深度分析",
      });
    }

    return actions;
  }

  // 数据获取方法
  private async getPayrollData(context?: OperationalContext): Promise<any> {
    const db = await this.ensureDb();
    
    // 获取当前月份薪酬数据
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    let query = db
      .select({
        id: payrollRuns.id,
        country: payrollRuns.country,
        month: payrollRuns.month,
        status: payrollRuns.status,
        totalAmount: payrollRuns.totalAmount,
        currency: payrollRuns.currency,
        employeeCount: payrollRuns.employeeCount,
        createdAt: payrollRuns.createdAt,
      })
      .from(payrollRuns)
      .where(eq(payrollRuns.month, currentMonth))
      .orderBy(desc(payrollRuns.createdAt))
      .limit(20);

    if (context?.selectedCustomerId) {
      query = query.where(eq(payrollRuns.customerId, parseInt(context.selectedCustomerId))) as any;
    }

    const payrolls = await query;
    
    // 获取统计信息
    const stats = await db
      .select({
        totalBatches: count(),
        draftCount: sum(sql`CASE WHEN status = 'draft' THEN 1 ELSE 0 END`),
        pendingCount: sum(sql`CASE WHEN status = 'pending_review' THEN 1 ELSE 0 END`),
        approvedCount: sum(sql`CASE WHEN status = 'approved' THEN 1 ELSE 0 END`),
        totalAmount: sum(payrollRuns.totalAmount),
      })
      .from(payrollRuns)
      .where(eq(payrollRuns.month, currentMonth));

    return {
      payrolls,
      stats: stats[0],
      currentMonth,
    };
  }

  private async getLeaveData(context?: OperationalContext): Promise<any> {
    const db = await this.ensureDb();
    
    // 获取最近30天的休假数据
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const leaveData = await db
      .select({
        id: leaveRecords.id,
        employeeId: leaveRecords.employeeId,
        leaveType: leaveRecords.leaveType,
        startDate: leaveRecords.startDate,
        endDate: leaveRecords.endDate,
        days: leaveRecords.days,
        status: leaveRecords.status,
        reason: leaveRecords.reason,
        createdAt: leaveRecords.createdAt,
      })
      .from(leaveRecords)
      .where(sql`${leaveRecords.startDate} >= ${thirtyDaysAgo}`)
      .orderBy(desc(leaveRecords.createdAt))
      .limit(50);

    // 获取休假统计
    const stats = await db
      .select({
        totalRequests: count(),
        approvedCount: sum(sql`CASE WHEN status = 'approved' THEN 1 ELSE 0 END`),
        pendingCount: sum(sql`CASE WHEN status = 'pending' THEN 1 ELSE 0 END`),
        rejectedCount: sum(sql`CASE WHEN status = 'rejected' THEN 1 ELSE 0 END`),
        totalDays: sum(leaveRecords.days),
      })
      .from(leaveRecords)
      .where(sql`${leaveRecords.startDate} >= ${thirtyDaysAgo}`);

    return {
      leaveRequests: leaveData,
      stats: stats[0],
      period: "最近30天",
    };
  }

  private async getFinancialData(context?: OperationalContext): Promise<any> {
    const db = await this.ensureDb();
    
    // 获取当前月份财务数据
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const invoiceData = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerId: invoices.customerId,
        amount: invoices.amount,
        currency: invoices.currency,
        status: invoices.status,
        dueDate: invoices.dueDate,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .where(sql`strftime('%Y-%m', ${invoices.createdAt}) = ${currentMonth}`)
      .orderBy(desc(invoices.createdAt))
      .limit(50);

    // 获取最新汇率
    const latestRates = await db
      .select({
        fromCurrency: exchangeRates.fromCurrency,
        toCurrency: exchangeRates.toCurrency,
        rate: exchangeRates.rate,
        effectiveDate: exchangeRates.effectiveDate,
      })
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.effectiveDate))
      .limit(10);

    return {
      invoices: invoiceData,
      exchangeRates: latestRates,
      currentMonth,
    };
  }

  private async getEmployeeData(context?: OperationalContext): Promise<any> {
    const db = await this.ensureDb();
    
    // 获取活跃员工数据
    const employeeData = await db
      .select({
        id: employees.id,
        fullName: employees.fullName,
        employeeId: employees.employeeId,
        status: employees.status,
        country: employees.country,
        department: employees.department,
        jobTitle: employees.jobTitle,
        startDate: employees.startDate,
        createdAt: employees.createdAt,
      })
      .from(employees)
      .where(eq(employees.status, "active"))
      .orderBy(desc(employees.createdAt))
      .limit(50);

    // 获取员工统计
    const stats = await db
      .select({
        totalEmployees: count(),
        activeCount: sum(sql`CASE WHEN status = 'active' THEN 1 ELSE 0 END`),
        probationCount: sum(sql`CASE WHEN status = 'probation' THEN 1 ELSE 0 END`),
        inactiveCount: sum(sql`CASE WHEN status = 'inactive' THEN 1 ELSE 0 END`),
      })
      .from(employees);

    return {
      employees: employeeData,
      stats: stats[0],
    };
  }

  // 辅助方法
  private containsPayrollKeywords(message: string): boolean {
    const keywords = ['薪酬', '工资', 'payroll', '批次', 'salary', 'pay'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private containsLeaveKeywords(message: string): boolean {
    const keywords = ['休假', '请假', 'leave', '年假', '病假', 'vacation'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private containsFinancialKeywords(message: string): boolean {
    const keywords = ['财务', '发票', 'invoice', '费用', 'cost', 'financial', 'billing'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private containsEmployeeKeywords(message: string): boolean {
    const keywords = ['员工', 'employee', '人员', '人事', 'staff', 'worker'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private containsReportKeywords(message: string): boolean {
    const keywords = ['报告', '报表', 'report', '统计', '分析', 'summary'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private containsInsightKeywords(message: string): boolean {
    const keywords = ['洞察', 'insight', '趋势', 'trend', '模式', 'pattern', '建议', 'recommendation'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private containsAnalysisKeywords(message: string): boolean {
    const keywords = ['分析', 'analyze', '统计', 'statistics', '对比', 'compare', '评估', 'evaluate'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private containsCreativeKeywords(message: string): boolean {
    const keywords = ['创意', 'creative', '想法', 'idea', '创新', 'innovation', '设计', 'design'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private generateDataSummary(data: any): string {
    const parts: string[] = [];
    
    if (data.payroll) {
      parts.push(`薪酬数据：${data.payroll.payrolls?.length || 0}个批次`);
    }
    
    if (data.leave) {
      parts.push(`休假数据：${data.leave.leaveRequests?.length || 0}条记录`);
    }
    
    if (data.financial) {
      parts.push(`财务数据：${data.financial.invoices?.length || 0}张发票`);
    }
    
    if (data.employees) {
      parts.push(`员工数据：${data.employees.employees?.length || 0}名员工`);
    }
    
    return parts.length > 0 ? parts.join('，') : '暂无相关数据';
  }
}

// 导出类型定义
export type {
  CopilotUserConfig,
  InsertCopilotUserConfig,
  CopilotConversation,
  InsertCopilotConversation,
  CopilotMessage,
  InsertCopilotMessage,
  CopilotFileAnalysis,
  InsertCopilotFileAnalysis,
  CopilotPrediction,
  InsertCopilotPrediction,
  CopilotShortcut,
  InsertCopilotShortcut,
  CopilotMetric,
  InsertCopilotMetric,
} from "../../drizzle/schema";