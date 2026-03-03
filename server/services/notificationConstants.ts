
export type TemplateConfig = {
  emailSubject: string;
  emailBody: string;
  inAppMessage: string;
};

export type NotificationConfig = {
  enabled: boolean;
  channels: ("email" | "in_app")[];
  recipients: string[]; // e.g. "client:finance", "admin:operations_manager"
  templates: {
    en: TemplateConfig;
    zh: TemplateConfig;
  };
};

export const DEFAULT_RULES: Record<string, NotificationConfig> = {
  invoice_sent: {
    enabled: true,
    channels: ["email", "in_app"],
    recipients: ["client:finance", "client:admin", "admin:finance_manager"],
    templates: {
      en: {
        emailSubject: "Invoice #{{invoiceNumber}} from GEA",
        emailBody: "<p>Dear {{contactName}},</p><p>Please find attached invoice #{{invoiceNumber}} for {{currency}} {{amount}}.</p><p>Due Date: {{dueDate}}</p><p>Best regards,<br>GEA Team</p>",
        inAppMessage: "Invoice #{{invoiceNumber}} has been sent."
      },
      zh: {
        emailSubject: "发票 #{{invoiceNumber}} - GEA",
        emailBody: "<p>尊敬的 {{contactName}}，</p><p>附件是您的发票 #{{invoiceNumber}}，金额 {{currency}} {{amount}}。</p><p>到期日：{{dueDate}}</p><p>祝好，<br>GEA 团队</p>",
        inAppMessage: "发票 #{{invoiceNumber}} 已发送。"
      }
    }
  },
  invoice_overdue: {
    enabled: true,
    channels: ["email", "in_app"],
    recipients: ["client:finance", "client:admin", "admin:customer_manager"],
    templates: {
      en: {
        emailSubject: "OVERDUE: Invoice #{{invoiceNumber}}",
        emailBody: "<p>Dear {{contactName}},</p><p>This is a reminder that invoice #{{invoiceNumber}} was due on {{dueDate}}.</p><p>Please arrange payment immediately.</p>",
        inAppMessage: "Invoice #{{invoiceNumber}} is overdue."
      },
      zh: {
        emailSubject: "逾期提醒：发票 #{{invoiceNumber}}",
        emailBody: "<p>尊敬的 {{contactName}}，</p><p>温馨提醒：您的发票 #{{invoiceNumber}} 已于 {{dueDate}} 到期。</p><p>请尽快安排付款。</p>",
        inAppMessage: "发票 #{{invoiceNumber}} 已逾期。"
      }
    }
  },
  payroll_draft_created: {
    enabled: true,
    channels: ["in_app"],
    recipients: ["admin:operations_manager"],
    templates: {
      en: {
        emailSubject: "Payroll Draft Ready",
        emailBody: "Payroll draft for {{period}} has been created.",
        inAppMessage: "Payroll draft for {{period}} is ready for review."
      },
      zh: {
        emailSubject: "工资单草稿已生成",
        emailBody: "{{period}} 的工资单草稿已生成。",
        inAppMessage: "{{period}} 的工资单草稿已生成，请审核。"
      }
    }
  },
  new_employee_request: {
    enabled: true,
    channels: ["email", "in_app"],
    recipients: ["admin:operations_manager"],
    templates: {
      en: {
        emailSubject: "New Employee Onboarding Request",
        emailBody: "Customer {{customerName}} has requested onboarding for {{employeeName}}.",
        inAppMessage: "New onboarding request: {{employeeName}} from {{customerName}}."
      },
      zh: {
        emailSubject: "新员工入职申请",
        emailBody: "客户 {{customerName}} 为 {{employeeName}} 提交了入职申请。",
        inAppMessage: "收到 {{customerName}} 提交的 {{employeeName}} 入职申请。"
      }
    }
  },
  worker_invite: {
    enabled: true,
    channels: ["email"],
    recipients: ["worker:user"], // Special role for worker
    templates: {
      en: {
        emailSubject: "Invitation to GEA Worker Portal",
        emailBody: "<p>Dear {{workerName}},</p><p>You have been invited to the GEA Worker Portal.</p><p>Please click the link below to set up your account:</p><p><a href=\"{{inviteLink}}\">Accept Invitation</a></p>",
        inAppMessage: "Welcome to GEA Worker Portal!"
      },
      zh: {
        emailSubject: "GEA 员工门户邀请",
        emailBody: "<p>尊敬的 {{workerName}}，</p><p>您已被邀请加入 GEA 员工门户。</p><p>请点击下方链接设置您的账户：</p><p><a href=\"{{inviteLink}}\">接受邀请</a></p>",
        inAppMessage: "欢迎来到 GEA 员工门户！"
      }
    }
  },
  worker_invoice_ready: {
    enabled: true,
    channels: ["email", "in_app"],
    recipients: ["worker:user"],
    templates: {
      en: {
        emailSubject: "Invoice #{{invoiceNumber}} Ready",
        emailBody: "<p>Dear {{workerName}},</p><p>Your invoice #{{invoiceNumber}} for {{period}} is now ready.</p>",
        inAppMessage: "Invoice #{{invoiceNumber}} is ready for review."
      },
      zh: {
        emailSubject: "发票 #{{invoiceNumber}} 已生成",
        emailBody: "<p>尊敬的 {{workerName}}，</p><p>您的 {{period}} 发票 #{{invoiceNumber}} 已生成。</p>",
        inAppMessage: "发票 #{{invoiceNumber}} 已生成，请查看。"
      }
    }
  },
  worker_payment_sent: {
    enabled: true,
    channels: ["email", "in_app"],
    recipients: ["worker:user"],
    templates: {
      en: {
        emailSubject: "Payment Sent: {{currency}} {{amount}}",
        emailBody: "<p>Dear {{workerName}},</p><p>We have processed a payment of {{currency}} {{amount}} for invoice #{{invoiceNumber}}.</p>",
        inAppMessage: "Payment of {{currency}} {{amount}} has been sent."
      },
      zh: {
        emailSubject: "付款已发送：{{currency}} {{amount}}",
        emailBody: "<p>尊敬的 {{workerName}}，</p><p>我们已处理发票 #{{invoiceNumber}} 的付款，金额为 {{currency}} {{amount}}。</p>",
        inAppMessage: "款项 {{currency}} {{amount}} 已汇出。"
      }
    }
  }
};
