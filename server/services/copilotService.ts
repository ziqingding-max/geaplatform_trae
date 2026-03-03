import { getDb } from "../db";
import { 
  copilotUserConfigs, 
  copilotConversations, 
  copilotMessages, 
  copilotFileAnalyses, 
  copilotPredictions, 
  copilotShortcuts, 
  copilotMetrics,
  type CopilotUserConfig,
  type CopilotConversation,
  type CopilotMessage,
  type CopilotFileAnalysis,
  type CopilotPrediction,
  type CopilotShortcut,
  type CopilotMetric
} from "../../drizzle/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { hasAnyRole } from "../../shared/roles";
import { storagePut } from "../storage";
import { ENV } from "../_core/env";
import { getCopilotCacheManager } from "./copilotCache";
import { executeTaskLLM } from "./aiGatewayService";
import type { InvokeParams, AITask } from "../_core/llm";

// 类型定义
interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  mimeType?: string;
}

interface DataContext {
  currentPage?: string;
  selectedCustomerId?: string;
  selectedEmployeeId?: string;
  selectedPayrollId?: string;
  payrollBatches?: any[];
  leaveRecords?: any[];
  userRole: string;
}

interface AIResponse {
  text: string;
  suggestedActions?: Array<{
    label: string;
    action: string;
    params?: Record<string, any>;
  }>;
  confidence: number;
  providerUsed: string;
  modelUsed: string;
  costEstimate: number;
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

  // 获取数据库连接
  private async getDb() {
    if (!this.db) {
      this.db = await getDb();
    }
    return this.db;
  }

  // 获取用户配置
  async getUserConfig(): Promise<CopilotUserConfig | null> {
    // 检查缓存
    const cached = await this.cacheManager.getUserConfig(this.userId);
    if (cached) return cached;

    const db = await this.getDb();
    const configs = await db
      .select()
      .from(copilotUserConfigs)
      .where(eq(copilotUserConfigs.userId, this.userId))
      .limit(1);

    if (configs.length === 0) {
      return null;
    }

    // 缓存结果
    this.cacheManager.setUserConfig(this.userId, configs[0]);
    return configs[0];
  }

  // 更新用户配置
  async updateUserConfig(config: Partial<CopilotUserConfig>): Promise<boolean> {
    const db = await this.getDb();
    
    try {
      const existing = await db
        .select()
        .from(copilotUserConfigs)
        .where(eq(copilotUserConfigs.userId, this.userId))
        .limit(1);

      if (existing.length === 0) {
        // 创建新配置
        await db.insert(copilotUserConfigs).values({
          userId: this.userId,
          preferences: config.preferences || {},
          hotkeys: config.hotkeys || {},
          enabledFeatures: config.enabledFeatures || ["chat", "predictions", "shortcuts"],
          disabledPredictions: config.disabledPredictions || [],
          theme: config.theme || "auto",
          language: config.language || "zh",
          position: config.position || "bottom-right",
          isEnabled: config.isEnabled !== false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // 更新现有配置
        await db
          .update(copilotUserConfigs)
          .set({
            ...config,
            updatedAt: new Date(),
          })
          .where(eq(copilotUserConfigs.id, existing[0].id));
      }

      // 清除缓存
      await this.cacheManager.invalidateUserCache(this.userId);
      return true;
    } catch (error) {
      console.error("[CopilotService] Failed to update user config:", error);
      return false;
    }
  }

  // 处理聊天消息
  async processChatMessage(
    userMessage: string,
    context?: DataContext,
    attachments?: Attachment[]
  ): Promise<AIResponse> {
    try {
      // 构建数据上下文
      const dataContext = await this.buildDataContext(userMessage, context);
      
      // 生成系统提示词
      const systemPrompt = this.generateSystemPrompt(dataContext);
      
      // 生成用户提示词
      const userPrompt = this.generateUserPrompt(userMessage, dataContext, attachments);
      
      // 通过 executeTaskLLM 调用
      const taskType = this.selectOptimalTaskType(userMessage, attachments, dataContext);
      
      const invokeParams: InvokeParams = {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        maxTokens: this.calculateOptimalMaxTokens(dataContext),
        temperature: this.calculateOptimalTemperature(userMessage),
      };

      const result = await executeTaskLLM(taskType, invokeParams);

      // 提取建议操作
      const suggestedActions = this.extractSuggestedActions(result.content, userMessage, dataContext);

      return {
        text: result.content,
        suggestedActions,
        confidence: 85, // 默认置信度
        providerUsed: "ai_gateway", // 简化provider信息
        modelUsed: "default", // 简化model信息
        costEstimate: 0.01, // 简化成本估算
      };
    } catch (error) {
      console.error("[CopilotService] Failed to process chat message:", error);
      throw new Error("处理消息时发生错误，请稍后重试");
    }
  }

  // 选择最优任务类型
  private selectOptimalTaskType(message: string, attachments?: Attachment[], dataContext?: DataContext): AITask {
    // 基于附件类型选择
    if (attachments && attachments.length > 0) {
      const hasImages = attachments.some(a => a.type === 'image');
      const hasFiles = attachments.some(a => a.type === 'file');
      
      if (hasImages) return "knowledge_summarize"; // 图片分析使用知识总结
      if (hasFiles) {
        const fileTypes = attachments.map(a => this.getFileExtension(a.name));
        if (fileTypes.some(ext => ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext))) {
          return "vendor_bill_parse"; // 文档分析使用供应商账单解析
        }
      }
    }

    // 基于消息内容和数据上下文选择
    const lowerMessage = message.toLowerCase();
    
    if (this.containsPayrollKeywords(lowerMessage)) {
      return "knowledge_summarize"; // 薪酬分析使用知识总结
    }
    
    if (this.containsLeaveKeywords(lowerMessage)) {
      return "knowledge_summarize"; // 休假分析使用知识总结
    }
    
    if (this.containsFinancialKeywords(lowerMessage)) {
      return "invoice_audit"; // 财务分析使用发票审计
    }
    
    if (this.containsReportKeywords(lowerMessage)) {
      return "knowledge_summarize"; // 报告生成使用知识总结
    }
    
    if (this.containsInsightKeywords(lowerMessage)) {
      return "source_authority_review"; // 洞察提取使用源权威审查
    }
    
    return "knowledge_summarize"; // 默认使用知识总结
  }

  // 构建数据上下文
  private async buildDataContext(message: string, context?: DataContext): Promise<any> {
    const dataContext: any = {
      userRole: this.userRole,
      timestamp: new Date().toISOString(),
      messageType: this.classifyMessageType(message),
    };

    // 添加页面上下文
    if (context?.currentPage) {
      dataContext.currentPage = context.currentPage;
    }

    // 根据消息类型和权限获取相关数据
    if (this.containsPayrollKeywords(message.toLowerCase()) && hasAnyRole(this.userRole, ['admin', 'operations_manager'])) {
      dataContext.payroll = await this.getPayrollContext(context);
    }

    if (this.containsLeaveKeywords(message.toLowerCase()) && hasAnyRole(this.userRole, ['admin', 'operations_manager'])) {
      dataContext.leave = await this.getLeaveContext(context);
    }

    if (this.containsFinancialKeywords(message.toLowerCase()) && hasAnyRole(this.userRole, ['admin', 'finance_manager'])) {
      dataContext.financial = await this.getFinancialContext(context);
    }

    if (this.containsEmployeeKeywords(message.toLowerCase()) && hasAnyRole(this.userRole, ['admin', 'operations_manager'])) {
      dataContext.employees = await this.getEmployeeContext(context);
    }

    if (this.containsCustomerKeywords(message.toLowerCase()) && hasAnyRole(this.userRole, ['admin', 'customer_manager'])) {
      dataContext.customers = await this.getCustomerContext(context);
    }

    return dataContext;
  }

  // 获取薪酬上下文
  private async getPayrollContext(context?: DataContext): Promise<any> {
    const db = await this.getDb();
    
    // 获取最近薪酬批次
    const recentBatches = await db
      .select({
        id: sql`pr.id`,
        country: sql`pr.country`,
        month: sql`pr.month`,
        year: sql`pr.year`,
        status: sql`pr.status`,
        totalAmount: sql`pr.totalAmount`,
        createdAt: sql`pr.createdAt`,
      })
      .from(sql`payrollRuns pr`)
      .where(sql`pr.status IN ('draft', 'pending_review', 'submitted')`)
      .orderBy(sql`pr.createdAt DESC`)
      .limit(5);

    // 获取薪酬统计
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const stats = await db
      .select({
        draftCount: sql`COUNT(CASE WHEN status = 'draft' THEN 1 END)`,
        pendingCount: sql`COUNT(CASE WHEN status = 'pending_review' THEN 1 END)`,
        submittedCount: sql`COUNT(CASE WHEN status = 'submitted' THEN 1 END)`,
      })
      .from(sql`payrollRuns`)
      .where(sql`strftime('%Y-%m', createdAt) = ${currentMonth}`);

    return {
      recentBatches,
      stats: stats[0] || { draftCount: 0, pendingCount: 0, submittedCount: 0 },
    };
  }

  // 获取休假上下文
  private async getLeaveContext(context?: DataContext): Promise<any> {
    const db = await this.getDb();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 获取待审批休假
    const pendingLeave = await db
      .select({
        id: sql`lr.id`,
        employeeName: sql`e.name`,
        startDate: sql`lr.startDate`,
        endDate: sql`lr.endDate`,
        days: sql`lr.days`,
        type: sql`lr.type`,
        status: sql`lr.status`,
      })
      .from(sql`leaveRecords lr`)
      .leftJoin(sql`employees e`, sql`lr.employeeId = e.id`)
      .where(sql`lr.status = 'pending' AND lr.startDate >= ${thirtyDaysAgo}`)
      .orderBy(sql`lr.createdAt DESC`)
      .limit(10);

    // 获取休假统计
    const stats = await db
      .select({
        pendingCount: sql`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        approvedCount: sql`COUNT(CASE WHEN status = 'approved' THEN 1 END)`,
        rejectedCount: sql`COUNT(CASE WHEN status = 'rejected' THEN 1 END)`,
      })
      .from(sql`leaveRecords`)
      .where(sql`createdAt >= ${thirtyDaysAgo}`);

    return {
      pendingLeave,
      stats: stats[0] || { pendingCount: 0, approvedCount: 0, rejectedCount: 0 },
    };
  }

  // 获取财务上下文
  private async getFinancialContext(context?: DataContext): Promise<any> {
    const db = await this.getDb();
    
    // 获取逾期发票
    const overdueInvoices = await db
      .select({
        id: sql`i.id`,
        invoiceNumber: sql`i.invoiceNumber`,
        customerName: sql`c.name`,
        amount: sql`i.amount`,
        dueDate: sql`i.dueDate`,
        status: sql`i.status`,
        daysOverdue: sql`julianday('now') - julianday(i.dueDate)`,
      })
      .from(sql`invoices i`)
      .leftJoin(sql`customers c`, sql`i.customerId = c.id`)
      .where(sql`i.status = 'overdue'`)
      .orderBy(sql`i.dueDate ASC`)
      .limit(10);

    // 获取发票统计
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const stats = await db
      .select({
        draftCount: sql`COUNT(CASE WHEN status = 'draft' THEN 1 END)`,
        pendingCount: sql`COUNT(CASE WHEN status = 'pending_review' THEN 1 END)`,
        sentCount: sql`COUNT(CASE WHEN status = 'sent' THEN 1 END)`,
        paidCount: sql`COUNT(CASE WHEN status = 'paid' THEN 1 END)`,
        overdueCount: sql`COUNT(CASE WHEN status = 'overdue' THEN 1 END)`,
      })
      .from(sql`invoices`)
      .where(sql`strftime('%Y-%m', createdAt) = ${currentMonth}`);

    return {
      overdueInvoices,
      stats: stats[0] || { draftCount: 0, pendingCount: 0, sentCount: 0, paidCount: 0, overdueCount: 0 },
    };
  }

  // 获取员工上下文
  private async getEmployeeContext(context?: DataContext): Promise<any> {
    const db = await this.getDb();
    
    // 获取试用期员工
    const probationEmployees = await db
      .select({
        id: sql`e.id`,
        name: sql`e.name`,
        employeeId: sql`e.employeeId`,
        department: sql`e.department`,
        status: sql`e.status`,
        startDate: sql`e.startDate`,
        probationEndDate: sql`e.probationEndDate`,
      })
      .from(sql`employees e`)
      .where(sql`e.status = 'probation' AND e.probationEndDate > date('now')`)
      .orderBy(sql`e.probationEndDate ASC`)
      .limit(10);

    // 获取员工统计
    const stats = await db
      .select({
        activeCount: sql`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
        probationCount: sql`COUNT(CASE WHEN status = 'probation' THEN 1 END)`,
        inactiveCount: sql`COUNT(CASE WHEN status = 'inactive' THEN 1 END)`,
      })
      .from(sql`employees`);

    return {
      probationEmployees,
      stats: stats[0] || { activeCount: 0, probationCount: 0, inactiveCount: 0 },
    };
  }

  // 获取客户上下文
  private async getCustomerContext(context?: DataContext): Promise<any> {
    const db = await this.getDb();
    
    // 获取活跃客户
    const activeCustomers = await db
      .select({
        id: sql`c.id`,
        name: sql`c.name`,
        country: sql`c.country`,
        status: sql`c.status`,
        contractStatus: sql`cc.status`,
        lastActivity: sql`c.updatedAt`,
      })
      .from(sql`customers c`)
      .leftJoin(sql`customerContracts cc`, sql`c.id = cc.customerId`)
      .where(sql`c.status = 'active'`)
      .orderBy(sql`c.updatedAt DESC`)
      .limit(10);

    // 获取客户统计
    const stats = await db
      .select({
        activeCount: sql`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
        inactiveCount: sql`COUNT(CASE WHEN status = 'inactive' THEN 1 END)`,
        prospectCount: sql`COUNT(CASE WHEN status = 'prospect' THEN 1 END)`,
      })
      .from(sql`customers`);

    return {
      activeCustomers,
      stats: stats[0] || { activeCount: 0, inactiveCount: 0, prospectCount: 0 },
    };
  }

  // 生成系统提示词
  private generateSystemPrompt(dataContext: any): string {
    const role = this.userRole;
    const permissions = this.getRolePermissions(role);
    
    return `你是一个专业的企业运营助手，专门为GEA EOR SaaS平台提供智能分析服务。

角色权限：${permissions}
当前数据上下文：${JSON.stringify(dataContext, null, 2)}

请基于用户的角色权限和数据上下文，提供准确、有用的分析和建议。注意保护敏感信息，只提供用户有权限查看的数据。

回答要求：
1. 使用中文回答
2. 提供具体的数据和见解
3. 如有风险或问题，明确提醒
4. 可以建议具体的操作步骤
5. 保持专业和友好的语气`;
  }

  // 生成用户提示词
  private generateUserPrompt(message: string, dataContext: any, attachments?: Attachment[]): string {
    let prompt = `用户问题：${message}\n\n`;
    
    if (attachments && attachments.length > 0) {
      prompt += `用户上传了 ${attachments.length} 个文件：\n`;
      attachments.forEach((att, index) => {
        prompt += `${index + 1}. ${att.name} (${att.type})\n`;
      });
      prompt += '\n';
    }

    prompt += `请基于以下数据上下文回答问题：\n${JSON.stringify(dataContext, null, 2)}\n\n`;
    prompt += "请提供详细、准确的回答，并给出可操作的建议。";
    
    return prompt;
  }

  // 提取建议操作
  private extractSuggestedActions(aiResponse: string, originalMessage: string, dataContext: any): Array<{label: string, action: string, params?: Record<string, any>}> {
    const actions: Array<{label: string, action: string, params?: Record<string, any>}> = [];
    
    const lowerResponse = aiResponse.toLowerCase();
    const lowerMessage = originalMessage.toLowerCase();
    
    // 基于响应内容提取建议操作
    if (lowerResponse.includes("查看") && lowerResponse.includes("薪酬")) {
      actions.push({
        label: "查看薪酬详情",
        action: "navigate_payroll",
        params: { filter: "recent" }
      });
    }
    
    if (lowerResponse.includes("审批") && lowerResponse.includes("休假")) {
      actions.push({
        label: "处理休假申请",
        action: "navigate_leave",
        params: { filter: "pending" }
      });
    }
    
    if (lowerResponse.includes("逾期") && lowerResponse.includes("发票")) {
      actions.push({
        label: "查看逾期发票",
        action: "navigate_invoices",
        params: { filter: "overdue" }
      });
    }
    
    if (lowerResponse.includes("导出") || lowerResponse.includes("报表")) {
      actions.push({
        label: "导出数据",
        action: "export_current_data",
        params: { format: "excel" }
      });
    }
    
    return actions;
  }

  // 辅助方法
  private getRolePermissions(role: string): string {
    const permissions: Record<string, string> = {
      'admin': '全部权限 - 可访问所有数据和功能',
      'operations_manager': '运营管理权限 - 可访问薪酬、休假、员工数据',
      'finance_manager': '财务管理权限 - 可访问发票、财务数据',
      'customer_manager': '客户管理权限 - 可访问客户、合同数据',
      'user': '基础权限 - 只读访问个人相关数据'
    };
    return permissions[role] || '基础权限';
  }

  private classifyMessageType(message: string): string {
    const lower = message.toLowerCase();
    if (this.containsPayrollKeywords(lower)) return 'payroll';
    if (this.containsLeaveKeywords(lower)) return 'leave';
    if (this.containsFinancialKeywords(lower)) return 'financial';
    if (this.containsEmployeeKeywords(lower)) return 'employee';
    if (this.containsCustomerKeywords(lower)) return 'customer';
    return 'general';
  }

  private containsPayrollKeywords(text: string): boolean {
    return /薪酬|工资|payroll|salary|wage/.test(text);
  }

  private containsLeaveKeywords(text: string): boolean {
    return /休假|请假|leave|vacation|holiday/.test(text);
  }

  private containsFinancialKeywords(text: string): boolean {
    return /财务|发票|invoice|finance|payment|billing/.test(text);
  }

  private containsEmployeeKeywords(text: string): boolean {
    return /员工|employee|staff|人事|hr/.test(text);
  }

  private containsCustomerKeywords(text: string): boolean {
    return /客户|customer|client|用户|user/.test(text);
  }

  private containsReportKeywords(text: string): boolean {
    return /报表|报告|report|统计|statistics/.test(text);
  }

  private containsInsightKeywords(text: string): boolean {
    return /洞察|insight|分析|analysis|趋势|trend/.test(text);
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private calculateOptimalMaxTokens(dataContext: any): number {
    // 根据数据复杂度调整最大token数
    const baseTokens = 1000;
    const complexity = Object.keys(dataContext).length;
    return Math.min(baseTokens + (complexity * 200), 4000);
  }

  private calculateOptimalTemperature(message: string): number {
    // 根据消息类型调整温度
    if (this.containsFinancialKeywords(message) || this.containsPayrollKeywords(message)) {
      return 0.1; // 财务和薪酬需要更准确的回答
    }
    return 0.3; // 默认温度
  }
}