import { mysqlTable, int, text, datetime, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================================================
// 16. COPILOT ASSISTANT EXTENSIONS
// ============================================================================

// Copilot用户配置表
export const copilotUserConfigs = mysqlTable(
  "copilot_user_configs",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: int("userId").notNull(),
    preferences: text("preferences"), // JSON存储个性化配置
    hotkeys: text("hotkeys"), // 自定义快捷键配置
    enabledFeatures: text("enabledFeatures"), // 启用的功能列表
    disabledPredictions: text("disabledPredictions"), // 用户关闭的预测类型
    theme: text("theme", { length: 20 }).default("auto").notNull(), // auto/light/dark
    language: text("language", { length: 10 }).default("zh").notNull(),
    position: text("position", { length: 20 }).default("bottom-right").notNull(), // 悬浮球位置
    isEnabled: int("isEnabled").default(1).notNull(), // MySQL boolean as tinyint
    createdAt: datetime("createdAt").defaultNow().notNull(),
    updatedAt: datetime("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    cucUserIdIdx: uniqueIndex("cuc_user_id_idx").on(table.userId),
    cucEnabledIdx: index("cuc_enabled_idx").on(table.isEnabled),
  })
);

export type CopilotUserConfig = typeof copilotUserConfigs.$inferSelect;
export type InsertCopilotUserConfig = typeof copilotUserConfigs.$inferInsert;

// Copilot对话表
export const copilotConversations = mysqlTable(
  "copilot_conversations",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: int("userId").notNull(),
    title: text("title", { length: 255 }),
    isActive: int("isActive").default(1).notNull(), // MySQL boolean as tinyint
    lastMessageAt: datetime("lastMessageAt").defaultNow().notNull(),
    createdAt: datetime("createdAt").defaultNow().notNull(),
    updatedAt: datetime("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    ccUserIdIdx: index("cc_user_id_idx").on(table.userId),
    ccActiveIdx: index("cc_active_idx").on(table.isActive),
    ccLastMessageIdx: index("cc_last_message_idx").on(table.lastMessageAt),
  })
);

export type CopilotConversation = typeof copilotConversations.$inferSelect;
export type InsertCopilotConversation = typeof copilotConversations.$inferInsert;

// Copilot消息表
export const copilotMessages = mysqlTable(
  "copilot_messages",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    conversationId: int("conversationId").notNull(),
    role: text("role", { length: 20 }).notNull(), // user, assistant, system
    content: text("content").notNull(),
    attachments: text("attachments"), // JSON存储附件信息
    metadata: text("metadata"), // JSON存储元数据
    cost: text("cost"), // AI调用成本
    processingTime: int("processingTime"), // 处理时间（毫秒）
    createdAt: datetime("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    cmConversationIdIdx: index("cm_conversation_id_idx").on(table.conversationId),
    cmRoleIdx: index("cm_role_idx").on(table.role),
    cmCreatedIdx: index("cm_created_idx").on(table.createdAt),
  })
);

export type CopilotMessage = typeof copilotMessages.$inferSelect;
export type InsertCopilotMessage = typeof copilotMessages.$inferInsert;

// Copilot文件分析表
export const copilotFileAnalyses = mysqlTable(
  "copilot_file_analyses",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: int("userId").notNull(),
    fileName: text("fileName", { length: 255 }).notNull(),
    fileUrl: text("fileUrl").notNull(),
    fileKey: text("fileKey", { length: 500 }).notNull(), // S3 key
    fileSize: int("fileSize").notNull(), // 文件大小（字节）
    mimeType: text("mimeType", { length: 100 }).notNull(),
    analysisType: text("analysisType", { length: 50 }).notNull(), // invoice, contract, document, receipt, general
    status: text("status", { length: 20 }).default("pending").notNull(), // pending, processing, completed, failed
    analysisResult: text("analysisResult"), // JSON存储分析结果
    error: text("error"), // 错误信息
    cost: text("cost"), // AI分析成本
    processingTime: int("processingTime"), // 处理时间（毫秒）
    createdAt: datetime("createdAt").defaultNow().notNull(),
    updatedAt: datetime("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    cfaUserIdIdx: index("cfa_user_id_idx").on(table.userId),
    cfaStatusIdx: index("cfa_status_idx").on(table.status),
    cfaAnalysisTypeIdx: index("cfa_analysis_type_idx").on(table.analysisType),
    cfaCreatedIdx: index("cfa_created_idx").on(table.createdAt),
  })
);

export type CopilotFileAnalysis = typeof copilotFileAnalyses.$inferSelect;
export type InsertCopilotFileAnalysis = typeof copilotFileAnalyses.$inferInsert;

// Copilot预测表
export const copilotPredictions = mysqlTable(
  "copilot_predictions",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: int("userId").notNull(),
    predictionType: text("predictionType", { length: 50 }).notNull(), // deadline_risk, anomaly, insight, trend
    title: text("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    confidence: int("confidence").notNull(), // 0-100
    severity: text("severity", { length: 20 }).notNull(), // low, medium, high, critical
    predictionData: text("predictionData"), // JSON存储预测数据
    expiresAt: datetime("expiresAt"), // 预测过期时间
    isDismissed: int("isDismissed").default(0).notNull(), // MySQL boolean as tinyint
    dismissedAt: datetime("dismissedAt"),
    suggestedAction: text("suggestedAction"), // JSON存储建议操作
    createdAt: datetime("createdAt").defaultNow().notNull(),
    updatedAt: datetime("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    cpUserIdIdx: index("cp_user_id_idx").on(table.userId),
    cpTypeIdx: index("cp_type_idx").on(table.predictionType),
    cpSeverityIdx: index("cp_severity_idx").on(table.severity),
    cpDismissedIdx: index("cp_dismissed_idx").on(table.isDismissed),
    cpExpiresIdx: index("cp_expires_idx").on(table.expiresAt),
    cpCreatedIdx: index("cp_created_idx").on(table.createdAt),
  })
);

export type CopilotPrediction = typeof copilotPredictions.$inferSelect;
export type InsertCopilotPrediction = typeof copilotPredictions.$inferInsert;

// Copilot快捷操作表
export const copilotShortcuts = mysqlTable(
  "copilot_shortcuts",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: int("userId").notNull(),
    title: text("title", { length: 100 }).notNull(),
    description: text("description", { length: 500 }),
    action: text("action", { length: 100 }).notNull(), // 执行的操作标识
    params: text("params"), // JSON存储操作参数
    icon: text("icon", { length: 50 }), // 图标标识
    badge: text("badge", { length: 20 }), // new, hot, beta等徽章
    hotkey: text("hotkey", { length: 50 }), // 快捷键，如 ctrl+shift+f
    usageCount: int("usageCount").default(0).notNull(), // 使用次数
    lastUsedAt: datetime("lastUsedAt"),
    isActive: int("isActive").default(1).notNull(), // MySQL boolean as tinyint
    createdAt: datetime("createdAt").defaultNow().notNull(),
    updatedAt: datetime("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    csUserIdIdx: index("cs_user_id_idx").on(table.userId),
    csActionIdx: index("cs_action_idx").on(table.action),
    csActiveIdx: index("cs_active_idx").on(table.isActive),
    csUsageIdx: index("cs_usage_idx").on(table.usageCount),
    csLastUsedIdx: index("cs_last_used_idx").on(table.lastUsedAt),
  })
);

export type CopilotShortcut = typeof copilotShortcuts.$inferSelect;
export type InsertCopilotShortcut = typeof copilotShortcuts.$inferInsert;

// Copilot使用统计表
export const copilotMetrics = mysqlTable(
  "copilot_metrics",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: int("userId").notNull(),
    date: datetime("date").notNull(), // 统计日期
    messageCount: int("messageCount").default(0).notNull(), // 消息数量
    fileAnalysisCount: int("fileAnalysisCount").default(0).notNull(), // 文件分析数量
    predictionCount: int("predictionCount").default(0).notNull(), // 预测数量
    shortcutUsageCount: int("shortcutUsageCount").default(0).notNull(), // 快捷操作使用次数
    totalCost: text("totalCost").default("0").notNull(), // 总成本（字符串存储金额）
    averageResponseTime: int("averageResponseTime"), // 平均响应时间（毫秒）
    createdAt: datetime("createdAt").defaultNow().notNull(),
    updatedAt: datetime("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => ({
    cmUserIdIdx: index("cm_user_id_idx").on(table.userId),
    cmDateIdx: uniqueIndex("cm_date_idx").on(table.userId, table.date), // 每个用户每天一条记录
    cmCreatedIdx: index("cm_created_idx").on(table.createdAt),
  })
);

export type CopilotMetric = typeof copilotMetrics.$inferSelect;
export type InsertCopilotMetric = typeof copilotMetrics.$inferInsert;

// ============================================================================
// 表关系定义
// ============================================================================

export const copilotRelations = relations(copilotUserConfigs, ({ one }) => ({
  user: one(users, {
    fields: [copilotUserConfigs.userId],
    references: [users.id],
  }),
}));

export const copilotConversationRelations = relations(copilotConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [copilotConversations.userId],
    references: [users.id],
  }),
  messages: many(copilotMessages),
}));

export const copilotMessageRelations = relations(copilotMessages, ({ one }) => ({
  conversation: one(copilotConversations, {
    fields: [copilotMessages.conversationId],
    references: [copilotConversations.id],
  }),
}));

export const copilotFileAnalysisRelations = relations(copilotFileAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [copilotFileAnalyses.userId],
    references: [users.id],
  }),
}));

export const copilotPredictionRelations = relations(copilotPredictions, ({ one }) => ({
  user: one(users, {
    fields: [copilotPredictions.userId],
    references: [users.id],
  }),
}));

export const copilotShortcutRelations = relations(copilotShortcuts, ({ one }) => ({
  user: one(users, {
    fields: [copilotShortcuts.userId],
    references: [users.id],
  }),
}));

export const copilotMetricRelations = relations(copilotMetrics, ({ one }) => ({
  user: one(users, {
    fields: [copilotMetrics.userId],
    references: [users.id],
  }),
}));