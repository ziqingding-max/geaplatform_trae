import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

const EVENT_LABELS: Record<string, string> = {
  invoice_sent: "Invoice Sent",
  invoice_overdue: "Invoice Overdue",
  payroll_draft_created: "Payroll Draft Ready",
  new_employee_request: "New Employee Request"
};

const EVENT_DESCRIPTIONS: Record<string, string> = {
  invoice_sent: "Triggered when an invoice is sent to a customer.",
  invoice_overdue: "Triggered daily for invoices past their due date.",
  payroll_draft_created: "Triggered when monthly payroll draft is auto-generated.",
  new_employee_request: "Triggered when a customer submits a new employee onboarding request."
};

const AVAILABLE_RECIPIENTS = [
  { value: "client:finance", label: "Client: Finance" },
  { value: "client:admin", label: "Client: Admin" },
  { value: "client:hr_manager", label: "Client: HR Manager" },
  { value: "admin:customer_manager", label: "GEA: Customer Manager" },
  { value: "admin:operations_manager", label: "GEA: Ops Manager" },
  { value: "admin:finance_manager", label: "GEA: Finance Manager" },
  { value: "admin:admin", label: "GEA: Admin" },
];

function NotificationSettingsContent() {
  const [settings, setSettings] = useState<NotificationSettings>({});
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NotificationRule | null>(null);
  
  const { data: serverSettings, isLoading, refetch } = trpc.notifications.getSettings.useQuery();
  
  const updateMutation = trpc.notifications.updateRule.useMutation({
    onSuccess: () => {
      toast.success("Notification settings updated");
      refetch();
      setEditingType(null);
    },
    onError: (err) => {
      toast.error(`Failed to update settings: ${err.message}`);
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

  // Group events by category
  const groups = {
    Finance: ["invoice_sent", "invoice_overdue"],
    Payroll: ["payroll_draft_created"],
    Onboarding: ["new_employee_request"]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Notification Rules</h2>
          <p className="text-sm text-muted-foreground">
            Configure automated email and in-app notifications for system events.
          </p>
        </div>
      </div>

      {Object.entries(groups).map(([category, types]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{category} Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="p-4 font-medium w-[250px]">Event</th>
                    <th className="p-4 font-medium w-[150px]">Channels</th>
                    <th className="p-4 font-medium">Recipients</th>
                    <th className="p-4 font-medium w-[100px] text-center">Status</th>
                    <th className="p-4 font-medium w-[100px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map(type => {
                    const rule = settings[type];
                    if (!rule) return null;
                    
                    return (
                      <tr key={type} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4">
                          <div className="font-medium">{EVENT_LABELS[type] || type}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {EVENT_DESCRIPTIONS[type]}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Badge variant={rule.channels?.includes("email") ? "default" : "outline"} className="gap-1">
                              <Mail className="w-3 h-3" /> Email
                            </Badge>
                            <Badge variant={rule.channels?.includes("in_app") ? "default" : "outline"} className="gap-1">
                              <Bell className="w-3 h-3" /> In-App
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {(rule.recipients || []).map(r => (
                              <Badge key={r} variant="secondary" className="text-xs font-mono">
                                {r}
                              </Badge>
                            ))}
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
            <DialogTitle>Edit Notification: {editingType ? EVENT_LABELS[editingType] : ""}</DialogTitle>
            <DialogDescription>
              Configure channels, recipients, and message templates.
            </DialogDescription>
          </DialogHeader>

          {editForm && (
            <div className="space-y-6 py-4">
              {/* General Config */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Channels</Label>
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
                      <span>Email Notification</span>
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
                      <span>In-App Notification</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Recipients</Label>
                  <MultiSelect
                    options={AVAILABLE_RECIPIENTS}
                    selected={editForm.recipients || []}
                    onChange={(selected) => setEditForm({ ...editForm, recipients: selected })}
                    placeholder="Select recipients..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Notifications will be sent to all users matching these roles.
                  </p>
                </div>
              </div>

              {/* Templates */}
              <div className="space-y-3">
                <Label>Message Templates</Label>
                <Tabs defaultValue="en" className="w-full border rounded-md p-4">
                  <TabsList className="mb-4">
                    <TabsTrigger value="en">English (Default)</TabsTrigger>
                    <TabsTrigger value="zh">Chinese (中文)</TabsTrigger>
                  </TabsList>
                  
                  {(["en", "zh"] as const).map(lang => {
                    const template = editForm.templates?.[lang] || { emailSubject: "", emailBody: "", inAppMessage: "" };
                    return (
                    <TabsContent key={lang} value={lang} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email Subject</Label>
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
                        <Label>Email Body (HTML supported)</Label>
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
                        <Label>In-App Message (Plain text)</Label>
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
                  <div className="font-semibold">Available Variables:</div>
                  <div className="font-mono text-muted-foreground">
                    {"{{invoiceNumber}}, {{amount}}, {{currency}}, {{dueDate}}, {{customerName}}, {{employeeName}}, {{period}}"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingType(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
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
