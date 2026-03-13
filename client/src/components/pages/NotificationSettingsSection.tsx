import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, Mail, Edit, Loader2, CheckCircle2, 
  AlertTriangle, Save, X 
} from "lucide-react";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import ErrorBoundary from "@/components/ErrorBoundary";

// Type definitions
type NotificationChannel = "email" | "in_app";

type TemplateConfig = {
  emailSubject: string;
  emailBody: string;
  inAppMessage: string;
};

type NotificationRule = {
  enabled: boolean;
  channels: NotificationChannel[];
  recipients: string[];
  templates: {
    en: TemplateConfig;
    zh: TemplateConfig;
  };
};

type NotificationSettings = Record<string, NotificationRule>;

const EVENT_LABELS: Record<string, Record<"en" | "zh", string>> = {
  invoice_sent: { en: "Invoice Sent", zh: "发票已发送" },
  invoice_overdue: { en: "Invoice Overdue", zh: "发票已逾期" },
  payroll_draft_created: { en: "Payroll Draft Ready", zh: "工资单草稿已就绪" },
  new_employee_request: { en: "New Employee Request", zh: "新员工入职申请" },
  worker_invite: { en: "Worker Invite", zh: "员工邀请" },
  worker_invoice_ready: { en: "Worker Invoice Ready", zh: "员工发票已生成" },
  worker_payment_sent: { en: "Worker Payment Sent", zh: "员工付款已发送" },
  leave_policy_country_activated: { en: "Leave Policy Country Activated", zh: "国家假期政策已激活" },
  employee_termination_request: { en: "Employee Termination Request", zh: "员工终止申请" },
  contractor_termination_request: { en: "Contractor Termination Request", zh: "承包商终止申请" }
};

const EVENT_DESCRIPTIONS: Record<string, Record<"en" | "zh", string>> = {
  invoice_sent: { 
    en: "Triggered when an invoice is sent to a customer.", 
    zh: "当发票发送给客户时触发。" 
  },
  invoice_overdue: { 
    en: "Triggered daily for invoices past their due date.", 
    zh: "每天为超过到期日的发票触发。" 
  },
  payroll_draft_created: { 
    en: "Triggered when monthly payroll draft is auto-generated.", 
    zh: "当月工资单草稿自动生成时触发。" 
  },
  new_employee_request: { 
    en: "Triggered when a customer submits a new employee onboarding request.", 
    zh: "当客户提交新员工入职申请时触发。" 
  },
  worker_invite: {
    en: "Triggered when a new worker is invited to the portal.",
    zh: "当邀请新员工加入门户时触发。"
  },
  worker_invoice_ready: {
    en: "Triggered when a worker invoice is generated.",
    zh: "当员工发票生成时触发。"
  },
  worker_payment_sent: {
    en: "Triggered when a payment is sent to a worker.",
    zh: "当向员工发送付款时触发。"
  },
  leave_policy_country_activated: {
    en: "Triggered when a new country's leave policy is auto-initialized.",
    zh: "当新国家的假期政策自动初始化时触发。"
  },
  employee_termination_request: {
    en: "Triggered when a portal client requests employee termination.",
    zh: "当客户门户提交员工终止申请时触发。"
  },
  contractor_termination_request: {
    en: "Triggered when a portal client requests contractor termination.",
    zh: "当客户门户提交承包商终止申请时触发。"
  }
};

const AVAILABLE_RECIPIENTS = [
  { value: "client:finance", label: { en: "Client: Finance", zh: "客户：财务" } },
  { value: "client:admin", label: { en: "Client: Admin", zh: "客户：管理员" } },
  { value: "client:hr_manager", label: { en: "Client: HR Manager", zh: "客户：人事经理" } },
  { value: "admin:customer_manager", label: { en: "GEA: Customer Manager", zh: "GEA：客户经理" } },
  { value: "admin:operations_manager", label: { en: "GEA: Ops Manager", zh: "GEA：运营经理" } },
  { value: "admin:finance_manager", label: { en: "GEA: Finance Manager", zh: "GEA：财务经理" } },
  { value: "admin:admin", label: { en: "GEA: Admin", zh: "GEA：管理员" } },
  { value: "worker:user", label: { en: "Worker: User", zh: "员工：用户" } },
];

function NotificationSettingsContent() {
  const { t, locale } = useI18n();
  const [settings, setSettings] = useState<NotificationSettings>({});
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NotificationRule | null>(null);
  
  const { data: serverSettings, isLoading, refetch } = trpc.notifications.getSettings.useQuery();
  
  const updateMutation = trpc.notifications.updateRule.useMutation({
    onSuccess: () => {
      toast.success(locale === "zh" ? "通知设置已更新" : "Notification settings updated");
      refetch();
      setEditingType(null);
    },
    onError: (err) => {
      toast.error(`${locale === "zh" ? "更新设置失败" : "Failed to update settings"}: ${err.message}`);
    }
  });

  useEffect(() => {
    if (serverSettings) {
      console.log("[NotificationSettings] Loaded config:", serverSettings);
      setSettings(serverSettings as NotificationSettings);
    }
  }, [serverSettings]);

  const handleToggleEnabled = (type: string, enabled: boolean) => {
    const rule = settings[type];
    if (!rule) return;
    
    updateMutation.mutate({
      type,
      config: { ...rule, enabled }
    });
  };

  const handleEditClick = (type: string) => {
    const rule = settings[type];
    if (!rule) return;
    setEditingType(type);
    setEditForm(JSON.parse(JSON.stringify(rule)));
  };

  const handleSaveEdit = () => {
    if (!editingType || !editForm) return;
    updateMutation.mutate({
      type: editingType,
      config: editForm
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const groups = {
    [locale === "zh" ? "财务" : "Finance"]: ["invoice_sent", "invoice_overdue"],
    [locale === "zh" ? "薪资" : "Payroll"]: ["payroll_draft_created"],
    [locale === "zh" ? "入职" : "Onboarding"]: ["new_employee_request"],
    [locale === "zh" ? "员工门户" : "Worker Portal"]: ["worker_invite", "worker_invoice_ready", "worker_payment_sent"],
    [locale === "zh" ? "离职" : "Offboarding"]: ["employee_termination_request", "contractor_termination_request"],
    [locale === "zh" ? "假期" : "Leave"]: ["leave_policy_country_activated"]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{locale === "zh" ? "通知规则" : "Notification Rules"}</h2>
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? "配置系统事件的自动电子邮件和应用内通知。" : "Configure automated email and in-app notifications for system events."}
          </p>
        </div>
      </div>

      {Object.entries(groups).map(([category, types]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{category} {locale === "zh" ? "通知" : "Notifications"}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="p-4 font-medium w-[250px]">{locale === "zh" ? "事件" : "Event"}</th>
                    <th className="p-4 font-medium w-[150px]">{locale === "zh" ? "渠道" : "Channels"}</th>
                    <th className="p-4 font-medium">{locale === "zh" ? "接收者" : "Recipients"}</th>
                    <th className="p-4 font-medium w-[100px] text-center">{locale === "zh" ? "状态" : "Status"}</th>
                    <th className="p-4 font-medium w-[100px] text-right">{locale === "zh" ? "操作" : "Action"}</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map(type => {
                    const rule = settings[type];
                    if (!rule) return null;
                    
                    return (
                      <tr key={type} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="font-medium">{EVENT_LABELS[type][locale]}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {EVENT_DESCRIPTIONS[type][locale]}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Badge variant={rule.channels?.includes("email") ? "default" : "outline"} className="gap-1">
                              <Mail className="w-3 h-3" /> {locale === "zh" ? "邮件" : "Email"}
                            </Badge>
                            <Badge variant={rule.channels?.includes("in_app") ? "default" : "outline"} className="gap-1">
                              <Bell className="w-3 h-3" /> {locale === "zh" ? "应用内" : "In-App"}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {(rule.recipients || []).map(r => {
                              const recipient = AVAILABLE_RECIPIENTS.find(rec => rec.value === r);
                              return (
                                <Badge key={r} variant="secondary" className="text-xs font-mono">
                                  {recipient ? recipient.label[locale] : r}
                                </Badge>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Switch 
                            checked={rule.enabled}
                            onCheckedChange={(checked) => handleToggleEnabled(type, checked)}
                          />
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(type)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{locale === "zh" ? "编辑通知" : "Edit Notification"}: {editingType ? EVENT_LABELS[editingType][locale] : ""}</DialogTitle>
            <DialogDescription>
              {locale === "zh" ? "配置渠道、接收者和消息模板。" : "Configure channels, recipients, and message templates."}
            </DialogDescription>
          </DialogHeader>

          {editForm && (
            <div className="space-y-6 py-4">
              {/* General Config */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>{locale === "zh" ? "渠道" : "Channels"}</Label>
                  <div className="flex flex-col gap-2 border p-3 rounded-md">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch 
                        checked={(editForm.channels || []).includes("email")}
                        onCheckedChange={(c) => {
                          const currentChannels = editForm.channels || [];
                          const newChannels = c 
                            ? [...currentChannels, "email" as const]
                            : currentChannels.filter(ch => ch !== "email");
                          setEditForm({ ...editForm, channels: newChannels });
                        }}
                      />
                      <span>{locale === "zh" ? "邮件通知" : "Email Notification"}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch 
                        checked={(editForm.channels || []).includes("in_app")}
                        onCheckedChange={(c) => {
                          const currentChannels = editForm.channels || [];
                          const newChannels = c 
                            ? [...currentChannels, "in_app" as const]
                            : currentChannels.filter(ch => ch !== "in_app");
                          setEditForm({ ...editForm, channels: newChannels });
                        }}
                      />
                      <span>{locale === "zh" ? "应用内通知" : "In-App Notification"}</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>{locale === "zh" ? "接收者" : "Recipients"}</Label>
                  <MultiSelect
                    options={AVAILABLE_RECIPIENTS.map(r => ({ value: r.value, label: r.label[locale] }))}
                    selected={editForm.recipients || []}
                    onChange={(selected: string[]) => setEditForm({ ...editForm, recipients: selected })}
                    placeholder={locale === "zh" ? "选择接收者..." : "Select recipients..."}
                  />
                  <p className="text-xs text-muted-foreground">
                    {locale === "zh" ? "通知将发送给所有匹配这些角色的用户。" : "Notifications will be sent to all users matching these roles."}
                  </p>
                </div>
              </div>

              {/* Templates */}
              <div className="space-y-3">
                <Label>{locale === "zh" ? "消息模板" : "Message Templates"}</Label>
                <Tabs defaultValue="en" className="w-full border rounded-md p-4">
                  <TabsList className="mb-4">
                    <TabsTrigger value="en">{locale === "zh" ? "英文（默认）" : "English (Default)"}</TabsTrigger>
                    <TabsTrigger value="zh">{locale === "zh" ? "中文" : "Chinese (中文)"}</TabsTrigger>
                  </TabsList>
                  
                  {(["en", "zh"] as const).map(lang => {
                    const template = editForm.templates?.[lang] || { emailSubject: "", emailBody: "", inAppMessage: "" };
                    return (
                    <TabsContent key={lang} value={lang} className="space-y-4">
                      <div className="space-y-2">
                        <Label>{locale === "zh" ? "邮件标题" : "Email Subject"}</Label>
                        <Input 
                          value={template.emailSubject}
                          onChange={e => setEditForm({
                            ...editForm,
                            templates: {
                              ...editForm.templates,
                              [lang]: { ...template, emailSubject: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{locale === "zh" ? "邮件正文（支持HTML）" : "Email Body (HTML supported)"}</Label>
                        <Textarea 
                          className="font-mono text-sm h-32"
                          value={template.emailBody}
                          onChange={e => setEditForm({
                            ...editForm,
                            templates: {
                              ...editForm.templates,
                              [lang]: { ...template, emailBody: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{locale === "zh" ? "应用内消息（纯文本）" : "In-App Message (Plain text)"}</Label>
                        <Input 
                          value={template.inAppMessage}
                          onChange={e => setEditForm({
                            ...editForm,
                            templates: {
                              ...editForm.templates,
                              [lang]: { ...template, inAppMessage: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </TabsContent>
                  )})}
                </Tabs>
                
                <div className="bg-muted/50 p-3 rounded text-xs space-y-1">
                  <div className="font-semibold">{locale === "zh" ? "可用变量" : "Available Variables"}:</div>
                  <div className="font-mono text-muted-foreground">
                    {"{{invoiceNumber}}, {{amount}}, {{currency}}, {{dueDate}}, {{customerName}}, {{employeeName}}, {{period}}"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingType(null)}>{locale === "zh" ? "取消" : "Cancel"}</Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (locale === "zh" ? "保存中..." : "Saving...") : (locale === "zh" ? "保存更改" : "Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function NotificationSettingsSection() {
  return (
    <ErrorBoundary>
      <NotificationSettingsContent />
    </ErrorBoundary>
  );
}
