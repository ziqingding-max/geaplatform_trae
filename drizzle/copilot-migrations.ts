// Copilot助手相关数据库表结构
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// 扩展AI任务类型，添加Copilot专用任务
export const COPILOT_TASK_TYPES = [
  "copilot_chat",                    // 通用对话
  "copilot_data_analysis",          // 数据分析
  "copilot_file_analysis",          // 文件分析
  "copilot_report_generation",        // 报告生成
  "copilot_insights_extraction",     // 洞察提取
  "copilot_invoice_analysis",        // 发票分析
  "copilot_contract_analysis",       // 合同分析
  "copilot_document_analysis",       // 文档分析
  "copilot_receipt_analysis",        // 收据分析
] as const;

export type CopilotTaskType = typeof COPILOT_TASK_TYPES[number];

// Copilot用户配置表
export const copilotUserConfigs = sqliteTable("copilot_user_configs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(), // 关联到users表的ID
  preferences: text("preferences", { mode: "json" }).$type<{
    theme?: "light" | "dark" | "auto";
    language?: "zh" | "en";
    fontSize?: "small" | "medium" | "large";
    autoSuggest?: boolean;
    soundEnabled?: boolean;
  }>().default({}),
  shortcuts: text("shortcuts", { mode: "json" }).$type<Record<string, string>>().default({}),
  usageStats: text("usage_stats", { mode: "json" }).$type<{
    totalQueries?: number;
    totalCost?: number;
    lastUsedAt?: string;
    favoriteTasks?: string[];
  }>().default({}),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Copilot对话历史表
export const copilotConversations = sqliteTable("copilot_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  sessionId: text("session_id").notNull(), // 会话ID，用于关联多轮对话
  message: text("message").notNull(), // 用户输入
  response: text("response").notNull(), // AI回复
  context: text("context", { mode: "json" }).$type<{
    currentPage?: string;
    selectedCustomerId?: string;
    selectedEmployeeId?: string;
    taskType?: CopilotTaskType;
    dataSources?: string[];
  }>().default({}),
  metadata: text("metadata", { mode: "json" }).$type<{
    provider?: string;
    model?: string;
    cost?: number;
    latency?: number;
    tokenUsage?: { input: number; output: number };
  }>().default({}),
  attachments: text("attachments", { mode: "json" }).$type<Array<{
    type: "image" | "file";
    url: string;
    name: string;
    mimeType?: string;
  }>>().default([]),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Copilot文件分析记录表
export const copilotFileAnalyses = sqliteTable("copilot_file_analyses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  conversationId: integer("conversation_id"), // 关联到对话历史
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // mime type
  analysisType: text("analysis_type").$type<"invoice" | "contract" | "document" | "receipt" | "general">().notNull(),
  result: text("result", { mode: "json" }).$type<{
    summary?: string;
    keyPoints?: string[];
    data?: Record<string, any>;
    insights?: string[];
    confidence?: number;
  }>().default({}),
  status: text("status").$type<"pending" | "processing" | "completed" | "failed">().default("pending"),
  error: text("error"), // 失败时的错误信息
  metadata: text("metadata", { mode: "json" }).$type<{
    provider?: string;
    model?: string;
    cost?: number;
    processingTime?: number;
    fileSize?: number;
  }>().default({}),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Copilot预测和预警记录表
export const copilotPredictions = sqliteTable("copilot_predictions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  type: text("type").$type<"deadline_risk" | "approval_bottleneck" | "leave_balance" | "reimbursement_anomaly" | "system_alert">().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  data: text("data", { mode: "json" }).$type<Record<string, any>>().default({}),
  suggestedAction: text("suggested_action", { mode: "json" }).$type<{
    label: string;
    action: string;
    params?: Record<string, any>;
  }>(),
  status: text("status").$type<"active" | "dismissed" | "acted" | "expired">().default("active"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  dismissedAt: integer("dismissed_at", { mode: "timestamp" }),
  actedAt: integer("acted_at", { mode: "timestamp" }),
});

// Copilot快捷操作定义表
export const copilotShortcuts = sqliteTable("copilot_shortcuts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon").notNull(), // 图标名称
  action: text("action").notNull(), // 动作类型
  params: text("params", { mode: "json" }).$type<Record<string, any>>().default({}),
  hotkey: text("hotkey"), // 快捷键，如 "Ctrl+Shift+N"
  context: text("context").$type<{
    page?: string;
    roles?: string[];
    conditions?: Record<string, any>;
  }>().default({}),
  badge: text("badge"), // 角标显示，可以是数字或状态
  priority: integer("priority").default(100), // 排序优先级
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Copilot性能监控表
export const copilotMetrics = sqliteTable("copilot_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  metricType: text("metric_type").$type<"query_latency" | "response_time" | "cache_hit" | "api_call" | "error_rate">().notNull(),
  value: real("value").notNull(), // 指标值
  unit: text("unit").notNull(), // 单位，如 "ms", "%", "count"
  metadata: text("metadata", { mode: "json" }).$type<{
    taskType?: string;
    provider?: string;
    model?: string;
    endpoint?: string;
    statusCode?: number;
    errorType?: string;
  }>().default({}),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// 导出Zod schema用于验证
export const insertCopilotUserConfigSchema = createInsertSchema(copilotUserConfigs);
export const selectCopilotUserConfigSchema = createSelectSchema(copilotUserConfigs);
export const insertCopilotConversationSchema = createInsertSchema(copilotConversations);
export const selectCopilotConversationSchema = createSelectSchema(copilotConversations);
export const insertCopilotFileAnalysisSchema = createInsertSchema(copilotFileAnalyses);
export const selectCopilotFileAnalysisSchema = createSelectSchema(copilotFileAnalyses);
export const insertCopilotPredictionSchema = createInsertSchema(copilotPredictions);
export const selectCopilotPredictionSchema = createSelectSchema(copilotPredictions);
export const insertCopilotShortcutSchema = createInsertSchema(copilotShortcuts);
export const selectCopilotShortcutSchema = createSelectSchema(copilotShortcuts);
export const insertCopilotMetricSchema = createInsertSchema(copilotMetrics);
export const selectCopilotMetricSchema = createSelectSchema(copilotMetrics);

// 类型定义
export type CopilotUserConfig = z.infer<typeof selectCopilotUserConfigSchema>;
export type CopilotConversation = z.infer<typeof selectCopilotConversationSchema>;
export type CopilotFileAnalysis = z.infer<typeof selectCopilotFileAnalysisSchema>;
export type CopilotPrediction = z.infer<typeof selectCopilotPredictionSchema>;
export type CopilotShortcut = z.infer<typeof selectCopilotShortcutSchema>;
export type CopilotMetric = z.infer<typeof selectCopilotMetricSchema>;

// 扩展AI任务策略表，添加Copilot任务类型
export const updateAiTaskPoliciesForCopilot = sql`
-- 首先检查是否已存在Copilot任务类型
SELECT COUNT(*) as count FROM aiTaskPolicies WHERE task LIKE 'copilot_%';
`;

// 插入默认的Copilot任务策略
export const insertDefaultCopilotTaskPolicies = sql`
-- Copilot通用对话
INSERT OR IGNORE INTO aiTaskPolicies (
  task, primaryProvider, fallbackProvider, modelOverride, 
  temperature, maxTokens, isActive, createdAt, updatedAt
) VALUES (
  'copilot_chat', 'openai', 'google', 'gpt-3.5-turbo',
  '0.7', '1000', 1, unixepoch(), unixepoch()
);

-- Copilot数据分析
INSERT OR IGNORE INTO aiTaskPolicies (
  task, primaryProvider, fallbackProvider, modelOverride, 
  temperature, maxTokens, isActive, createdAt, updatedAt
) VALUES (
  'copilot_data_analysis', 'openai', 'google', 'gpt-4-turbo',
  '0.3', '2000', 1, unixepoch(), unixepoch()
);

-- Copilot文件分析
INSERT OR IGNORE INTO aiTaskPolicies (
  task, primaryProvider, fallbackProvider, modelOverride, 
  temperature, maxTokens, isActive, createdAt, updatedAt
) VALUES (
  'copilot_file_analysis', 'google', 'openai', 'gemini-pro-vision',
  '0.2', '3000', 1, unixepoch(), unixepoch()
);

-- Copilot报告生成
INSERT OR IGNORE INTO aiTaskPolicies (
  task, primaryProvider, fallbackProvider, modelOverride, 
  temperature, maxTokens, isActive, createdAt, updatedAt
) VALUES (
  'copilot_report_generation', 'openai', 'google', 'gpt-4',
  '0.5', '4000', 1, unixepoch(), unixepoch()
);

-- Copilot洞察提取
INSERT OR IGNORE INTO aiTaskPolicies (
  task, primaryProvider, fallbackProvider, modelOverride, 
  temperature, maxTokens, isActive, createdAt, updatedAt
) VALUES (
  'copilot_insights_extraction', 'openai', 'google', 'gpt-4-turbo',
  '0.4', '2500', 1, unixepoch(), unixepoch()
);
`;