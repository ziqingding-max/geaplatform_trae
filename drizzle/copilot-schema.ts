// ============================================================================
// 16. COPILOT ASSISTANT EXTENSIONS
// ============================================================================

// Copilot用户配置表
export const copilotUserConfigs = sqliteTable(
  "copilot_user_configs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull(),
    preferences: text("preferences", { mode: "json" }), // JSON存储个性化配置
    hotkeys: text("hotkeys", { mode: "json" }), // 自定义快捷键配置
    enabledFeatures: text("enabledFeatures", { mode: "json" }), // 启用的功能列表
    disabledPredictions: text("disabledPredictions", { mode: "json" }), // 用户关闭的预测类型
    theme: text("theme", { length: 20 }).default("auto").notNull(), // auto/light/dark
    language: text("language", { length: 10 }).default("zh").notNull(),
    position: text("position", { length: 20 }).default("bottom-right").notNull(), // 悬浮球位置
    isEnabled: integer("isEnabled", { mode: "boolean" }).default(true).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    cucUserIdIdx: uniqueIndex("cuc_user_id_idx").on(table.userId),
    cucEnabledIdx: index("cuc_enabled_idx").on(table.isEnabled),
  })
);

export type CopilotUserConfig = typeof copilotUserConfigs.$inferSelect;
export type InsertCopilotUserConfig = typeof copilotUserConfigs.$inferInsert;

// Copilot对话历史表
export const copilotConversations = sqliteTable(
  "copilot_conversations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull(),
    sessionId: text("sessionId", { length: 64 }).notNull(), // 会话ID
    title: text("title", { length: 200 }), // 对话标题（AI生成）
    context: text("context", { mode: "json" }), // 对话上下文信息
    messageCount: integer("messageCount").default(0).notNull(),
    isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
    lastMessageAt: integer("lastMessageAt", { mode: "timestamp" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    ccUserIdIdx: index("cc_user_id_idx").on(table.userId),
    ccSessionIdIdx: uniqueIndex("cc_session_id_idx").on(table.sessionId),
    ccActiveIdx: index("cc_active_idx").on(table.isActive),
    ccLastMessageIdx: index("cc_last_message_idx").on(table.lastMessageAt),
  })
);

export type CopilotConversation = typeof copilotConversations.$inferSelect;
export type InsertCopilotConversation = typeof copilotConversations.$inferInsert;

// Copilot消息表
export const copilotMessages = sqliteTable(
  "copilot_messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    conversationId: integer("conversationId").notNull(),
    role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
    content: text("content").notNull(),
    attachments: text("attachments", { mode: "json" }), // 附件信息
    metadata: text("metadata", { mode: "json" }), // 消息元数据（token用量、成本等）
    taskType: text("taskType", { length: 50 }), // AI任务类型
    providerUsed: text("providerUsed", { length: 50 }), // 使用的AI provider
    modelUsed: text("modelUsed", { length: 100 }), // 使用的模型
    costEstimate: text("costEstimate", { length: 20 }), // 成本估算
    processingTime: integer("processingTime"), // 处理时间（毫秒）
    error: text("error", { mode: "json" }), // 错误信息
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  },
  (table) => ({
    cmConversationIdx: index("cm_conversation_idx").on(table.conversationId),
    cmRoleIdx: index("cm_role_idx").on(table.role),
    cmCreatedIdx: index("cm_created_idx").on(table.createdAt),
  })
);

export type CopilotMessage = typeof copilotMessages.$inferSelect;
export type InsertCopilotMessage = typeof copilotMessages.$inferInsert;

// Copilot文件分析表
export const copilotFileAnalyses = sqliteTable(
  "copilot_file_analyses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull(),
    messageId: integer("messageId"), // 关联的消息ID
    fileName: text("fileName", { length: 255 }).notNull(),
    fileUrl: text("fileUrl").notNull(),
    fileKey: text("fileKey", { length: 500 }).notNull(),
    fileSize: integer("fileSize").notNull(),
    mimeType: text("mimeType", { length: 100 }).notNull(),
    analysisType: text("analysisType", { length: 50 }).notNull(), // invoice/contract/document/receipt/general
    analysisResult: text("analysisResult", { mode: "json" }), // 分析结果
    extractedText: text("extractedText"), // 提取的文本内容
    confidence: real("confidence"), // 分析置信度
    processingTime: integer("processingTime"), // 处理时间
    providerUsed: text("providerUsed", { length: 50 }), // 使用的AI provider
    modelUsed: text("modelUsed", { length: 100 }), // 使用的模型
    costEstimate: text("costEstimate", { length: 20 }), // 成本估算
    status: text("status", { enum: ["pending", "processing", "completed", "failed"] }).default("pending").notNull(),
    error: text("error", { mode: "json" }), // 错误信息
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    cfaUserIdx: index("cfa_user_idx").on(table.userId),
    cfaMessageIdx: index("cfa_message_idx").on(table.messageId),
    cfaTypeIdx: index("cfa_type_idx").on(table.analysisType),
    cfaStatusIdx: index("cfa_status_idx").on(table.status),
    cfaCreatedIdx: index("cfa_created_idx").on(table.createdAt),
  })
);

export type CopilotFileAnalysis = typeof copilotFileAnalyses.$inferSelect;
export type InsertCopilotFileAnalysis = typeof copilotFileAnalyses.$inferInsert;

// Copilot预测和预警表
export const copilotPredictions = sqliteTable(
  "copilot_predictions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull(),
    predictionType: text("predictionType", { length: 50 }).notNull(), // deadline_risk/anomaly/insight/trend
    title: text("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    data: text("data", { mode: "json" }), // 预测相关的数据
    confidence: real("confidence").notNull(), // 置信度 (0-100)
    severity: text("severity", { enum: ["low", "medium", "high", "critical"] }).default("medium").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }), // 预测过期时间
    isDismissed: integer("isDismissed", { mode: "boolean" }).default(false).notNull(),
    dismissedAt: integer("dismissedAt", { mode: "timestamp" }),
    suggestedActions: text("suggestedActions", { mode: "json" }), // 建议的操作
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  },
  (table) => ({
    cpUserIdx: index("cp_user_idx").on(table.userId),
    cpTypeIdx: index("cp_type_idx").on(table.predictionType),
    cpSeverityIdx: index("cp_severity_idx").on(table.severity),
    cpActiveIdx: index("cp_active_idx").on(table.isDismissed),
    cpExpiresIdx: index("cp_expires_idx").on(table.expiresAt),
    cpCreatedIdx: index("cp_created_idx").on(table.createdAt),
  })
);

export type CopilotPrediction = typeof copilotPredictions.$inferSelect;
export type InsertCopilotPrediction = typeof copilotPredictions.$inferInsert;

// Copilot快捷操作表
export const copilotShortcuts = sqliteTable(
  "copilot_shortcuts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull(),
    title: text("title", { length: 100 }).notNull(),
    description: text("description", { length: 500 }),
    action: text("action", { length: 100 }).notNull(), // 操作类型
    params: text("params", { mode: "json" }), // 操作参数
    icon: text("icon", { length: 50 }), // 图标名称
    hotkey: text("hotkey", { length: 50 }), // 快捷键
    usageCount: integer("usageCount").default(0).notNull(), // 使用次数
    lastUsedAt: integer("lastUsedAt", { mode: "timestamp" }),
    isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    csUserIdx: index("cs_user_idx").on(table.userId),
    csActionIdx: index("cs_action_idx").on(table.action),
    csActiveIdx: index("cs_active_idx").on(table.isActive),
    csUsageIdx: index("cs_usage_idx").on(table.usageCount),
    csLastUsedIdx: index("cs_last_used_idx").on(table.lastUsedAt),
  })
);

export type CopilotShortcut = typeof copilotShortcuts.$inferSelect;
export type InsertCopilotShortcut = typeof copilotShortcuts.$inferInsert;

// Copilot使用统计表
export const copilotMetrics = sqliteTable(
  "copilot_metrics",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD 格式
    messageCount: integer("messageCount").default(0).notNull(),
    fileAnalysisCount: integer("fileAnalysisCount").default(0).notNull(),
    predictionCount: integer("predictionCount").default(0).notNull(),
    shortcutUsageCount: integer("shortcutUsageCount").default(0).notNull(),
    totalCost: text("totalCost", { length: 20 }).default("0.0000").notNull(),
    averageResponseTime: integer("averageResponseTime").default(0).notNull(), // 平均响应时间（毫秒）
    satisfactionScore: real("satisfactionScore"), // 满意度评分 (1-5)
    createdAt: integer("createdAt", { mode: "timestamp" }).defaultNow().notNull(),
  },
  (table) => ({
    cmUserDateIdx: uniqueIndex("cm_user_date_idx").on(table.userId, table.date),
    cmDateIdx: index("cm_date_idx").on(table.date),
    cmCreatedIdx: index("cm_created_idx").on(table.createdAt),
  })
);

export type CopilotMetric = typeof copilotMetrics.$inferSelect;
export type InsertCopilotMetric = typeof copilotMetrics.$inferInsert;