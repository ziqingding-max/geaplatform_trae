import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import CountrySelect from "@/components/CountrySelect";
import CurrencySelect from "@/components/CurrencySelect";
import { formatCurrencyAmount } from "@/components/CurrencyAmount";
import { BankDetailsForm, type BankDetails } from "@/components/forms/BankDetailsForm";
import { DatePicker } from "@/components/DatePicker";

const initialFormData = {
  customerId: 0,
  firstName: "",
  lastName: "",
  email: "",
  jobTitle: "",
  country: "",
  currency: "USD",
  rateAmount: "",
  payFrequency: "monthly" as "monthly" | "semi_monthly" | "milestone",
  startDate: "",
  defaultApproverId: 0,
  bankDetails: {} as Partial<BankDetails>,
};

export default function ContractorCreateDialog({ onSuccess }: { onSuccess?: () => void }) {
  const { t } = useI18n();
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ ...initialFormData });

  const utils = trpc.useUtils();
  const { data: customers } = trpc.customers.list.useQuery({ limit: 200 });
  const { data: approvers } = trpc.contractors.getApprovers.useQuery();

  const createMutation = trpc.contractors.create.useMutation({
    onSuccess: () => {
      toast.success("Contractor created successfully");
      setCreateOpen(false);
      utils.contractors.list.invalidate(); // Invalidate list query
      if (onSuccess) onSuccess();
      setFormData({ ...initialFormData });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("contractors.actions.addContractor")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("contractors.actions.addContractor")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>First Name</Label>
               <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
             </div>
             <div className="space-y-2">
               <Label>Last Name</Label>
               <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Email</Label>
               <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             </div>
             <div className="space-y-2">
               <Label>Job Title <span className="text-red-500">*</span></Label>
               <Input value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} placeholder="e.g. Software Engineer" />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Start Date</Label>
               <DatePicker value={formData.startDate} onChange={(d) => setFormData({...formData, startDate: d})} />
             </div>
             <div className="space-y-2">
               <Label>Customer</Label>
               <Select value={String(formData.customerId)} onValueChange={v => setFormData({...formData, customerId: parseInt(v)})}>
                 <SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger>
                 <SelectContent>
                   {customers?.data?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>)}
                 </SelectContent>
               </Select>
             </div>
           </div>
           
           <div className="space-y-2">
             <Label>Country/Region</Label>
             <CountrySelect value={formData.country} onValueChange={v => setFormData({...formData, country: v})} showCode={false} scope="all" />
           </div>

           <div className="space-y-2">
             <Label>Default Approver</Label>
             <Select value={formData.defaultApproverId ? String(formData.defaultApproverId) : ""} onValueChange={v => setFormData({...formData, defaultApproverId: parseInt(v)})}>
               <SelectTrigger><SelectValue placeholder="Select Approver" /></SelectTrigger>
               <SelectContent>
                 {approvers?.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name} ({u.email})</SelectItem>)}
               </SelectContent>
             </Select>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Currency</Label>
               <CurrencySelect value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})} />
             </div>
             <div className="space-y-2">
                <Label>Payment Frequency</Label>
                <Select value={formData.payFrequency} onValueChange={v => setFormData({...formData, payFrequency: v as any})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="semi_monthly">Semi-Monthly</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
             </div>
           </div>

           {formData.payFrequency !== "milestone" && (
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>{formData.payFrequency === 'semi_monthly' ? 'Semi-Monthly Amount' : 'Monthly Amount'}</Label>
                 <Input type="number" value={formData.rateAmount} onChange={e => setFormData({...formData, rateAmount: e.target.value})} />
                 {formData.payFrequency === 'semi_monthly' && (
                   <p className="text-xs text-muted-foreground mt-1">Paid {formatCurrencyAmount(formData.rateAmount, formData.currency)} on 15th and EOM</p>
                 )}
               </div>
             </div>
           )}

           <div className="space-y-2">
             <BankDetailsForm 
               value={formData.bankDetails} 
               onChange={(details) => setFormData({...formData, bankDetails: details})}
               countryCode={formData.country}
               currency={formData.currency}
             />
           </div>
           
           <div className="flex justify-end gap-3 pt-2">
             <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
             <Button onClick={() => {
               const submitData: any = {
                 ...formData,
                 paymentFrequency: formData.payFrequency, // Map local state to backend field
                 bankDetails: Object.keys(formData.bankDetails).length > 0
                   ? JSON.stringify(formData.bankDetails)
                   : undefined, // Serialize bank details to JSON string for backend
               };
               if (!submitData.customerId) { toast.error("Customer is required"); return; }
               if (!submitData.jobTitle) { toast.error("Job Title is required"); return; }
               if (submitData.defaultApproverId === 0) delete submitData.defaultApproverId;
               // rateAmount is already string, handled by backend
               createMutation.mutate(submitData);
             }} disabled={createMutation.isPending}>
               {createMutation.isPending ? "Creating..." : "Create Contractor"}
             </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
