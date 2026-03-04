/**
 * Portal Self-Service Onboarding Page
 *
 * Public page (no portal auth required) where employees fill in their own
 * personal information via a unique invite token.
 */
import { useState } from "react";
import { useSearch } from "wouter";
import { portalTrpc } from "@/lib/portalTrpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { ALL_COUNTRIES } from "@/components/CountrySelect";
import { toast } from "sonner";
import {
  User,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  FileText,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface StepItem {
  id: number;
  titleKey: string;
  icon: typeof User;
}

const STEPS: StepItem[] = [
  { id: 1, titleKey: "portal_self_onboarding.steps.personal_info", icon: User },
  { id: 2, titleKey: "portal_self_onboarding.steps.employment", icon: Briefcase },
  { id: 3, titleKey: "portal_self_onboarding.steps.documents", icon: FileCheck },
];

interface SelfOnboardingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  idType: string;
  idNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  jobTitle: string;
  department: string;
}

interface DocFile {
  type: string;
  name: string;
  file: File | null;
  base64: string;
  mimeType: string;
}

export default function PortalSelfOnboarding() {
  const { t } = useI18n();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<SelfOnboardingForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    idType: "",
    idNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    jobTitle: "",
    department: "",
  });
  const [documents, setDocuments] = useState<DocFile[]>([]);

  const { data: invite, isLoading: loadingInvite, error: inviteError } =
    portalTrpc.employees.validateOnboardingToken.useQuery(
      { token },
      { enabled: !!token, retry: false }
    );

  const { data: countries } = portalTrpc.employees.availableCountries.useQuery();

  const uploadDocMutation = portalTrpc.employees.uploadSelfServiceDocument.useMutation();

  const submitMutation = portalTrpc.employees.submitSelfServiceOnboarding.useMutation({
    onSuccess: async (data) => {
      if (documents.length > 0 && data.employeeId) {
        for (const doc of documents) {
          try {
            await uploadDocMutation.mutateAsync({
              token,
              employeeId: data.employeeId,
              documentType: doc.type as any,
              documentName: doc.name,
              fileBase64: doc.base64,
              fileName: doc.file?.name || `${doc.type}.pdf`,
              mimeType: doc.mimeType,
              fileSize: doc.file?.size,
            });
          } catch (err: any) {
            console.error(`Failed to upload document ${doc.name}:`, err);
            toast.error(`${t("portal_self_onboarding.toasts.upload_failed")}: ${doc.name}`);
          }
        }
      }
      setSubmitted(true);
    },
    onError: (err: any) => toast.error(err.message),
  });

  function updateField(field: keyof SelfOnboardingForm, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(docType: string, docName: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("portal_self_onboarding.toasts.file_size_error"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setDocuments((prev) => {
        const existing = prev.findIndex((d) => d.type === docType);
        const newDoc: DocFile = { type: docType, name: docName, file, base64, mimeType: file.type };
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newDoc;
          return updated;
        }
        return [...prev, newDoc];
      });
    };
    reader.readAsDataURL(file);
  }

  function removeDocument(docType: string) {
    setDocuments((prev) => prev.filter((d) => d.type !== docType));
  }

  async function handleSubmit() {
    await submitMutation.mutateAsync({
      token,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: (formData.gender || undefined) as any,
      nationality: formData.nationality || undefined,
      idType: formData.idType || undefined,
      idNumber: formData.idNumber || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      postalCode: formData.postalCode || undefined,
      country: formData.country || "SG",
      jobTitle: formData.jobTitle || "TBD",
      department: formData.department || undefined,
      startDate: new Date().toISOString().split("T")[0],
    });
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h2 className="text-xl font-bold">{t("portal_self_onboarding.invalid_link.title")}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {t("portal_self_onboarding.invalid_link.description")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingInvite) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">{t("portal_self_onboarding.loading.title")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteError || !invite?.valid) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h2 className="text-xl font-bold">{t("portal_self_onboarding.expired_link.title")}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {t("portal_self_onboarding.expired_link.description")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold">{t("portal_self_onboarding.submitted.title")}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {t("portal_self_onboarding.submitted.description")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const docTypes = [
    { type: "national_id", label: t("portal_self_onboarding.form.documents.national_id"), required: true },
    { type: "passport", label: t("portal_self_onboarding.form.documents.passport"), required: false },
    { type: "visa", label: t("portal_self_onboarding.form.documents.visa"), required: false },
    { type: "resume", label: t("portal_self_onboarding.form.documents.resume"), required: false },
    { type: "education", label: t("portal_self_onboarding.form.documents.education_cert"), required: false },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-28 sm:pb-8 pt-8 sm:pt-10">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{t("portal_self_onboarding.title")}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {(t("portal_self_onboarding.welcome") || "").replace("{employeeName}", invite.employeeName ?? "")}
          </p>
        </div>

        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <div className="inline-flex min-w-full items-center justify-start sm:justify-center gap-2 pr-2">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center shrink-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step.id
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span
                    className={cn(
                      "ml-2 text-xs sm:text-sm whitespace-nowrap",
                      currentStep === step.id ? "font-medium" : "text-muted-foreground"
                    )}
                  >
                    {t(step.titleKey)}
                  </span>
                  {idx < STEPS.length - 1 && <div className="w-6 sm:w-8 h-px bg-border mx-2 sm:mx-3" />}
                </div>
              );
            })}
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.personal_info.first_name")} <span className="text-destructive">*</span></Label>
                    <Input value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder={t("portal_self_onboarding.form.personal_info.first_name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.personal_info.last_name")} <span className="text-destructive">*</span></Label>
                    <Input value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder={t("portal_self_onboarding.form.personal_info.last_name")} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.personal_info.email")} <span className="text-destructive">*</span></Label>
                    <Input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.personal_info.phone")}</Label>
                    <Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+65 9123 4567" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.personal_info.dob")}</Label>
                    <DatePicker
                      value={formData.dateOfBirth}
                      onChange={(v: string) => updateField("dateOfBirth", v)}
                      placeholder={t("portal_self_onboarding.placeholders.select_date")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.personal_info.gender")}</Label>
                    <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                      <SelectTrigger><SelectValue placeholder={t("portal_self_onboarding.placeholders.select_gender")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t("portal_self_onboarding.gender.male")}</SelectItem>
                        <SelectItem value="female">{t("portal_self_onboarding.gender.female")}</SelectItem>
                        <SelectItem value="other">{t("portal_self_onboarding.gender.other")}</SelectItem>
                        <SelectItem value="prefer_not_to_say">{t("portal_self_onboarding.gender.prefer_not_to_say")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.personal_info.nationality")}</Label>
                    <Select value={formData.nationality} onValueChange={(v) => updateField("nationality", v)}>
                      <SelectTrigger><SelectValue placeholder={t("portal_self_onboarding.placeholders.select_nationality")} /></SelectTrigger>
                      <SelectContent>
                        {ALL_COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.personal_info.id_type")}</Label>
                    <Select value={formData.idType} onValueChange={(v) => updateField("idType", v)}>
                      <SelectTrigger><SelectValue placeholder={t("portal_self_onboarding.placeholders.select_id_type")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national_id">{t("portal_self_onboarding.id_type.national_id")}</SelectItem>
                        <SelectItem value="passport">{t("portal_self_onboarding.form.documents.passport")}</SelectItem>
                        <SelectItem value="driver_license">{t("portal_self_onboarding.id_type.driver_license")}</SelectItem>
                        <SelectItem value="other">{t("portal_self_onboarding.id_type.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.idType && (
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.personal_info.id_number")}</Label>
                    <Input value={formData.idNumber} onChange={(e) => updateField("idNumber", e.target.value)} placeholder={t("portal_self_onboarding.placeholders.id_number")} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{t("portal_self_onboarding.form.address.street")}</Label>
                  <Textarea value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder={t("portal_self_onboarding.placeholders.address")} rows={2} />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.address.country")}</Label>
                    <Select value={formData.country} onValueChange={(v) => updateField("country", v)}>
                      <SelectTrigger><SelectValue placeholder={t("portal_self_onboarding.placeholders.select_country")} /></SelectTrigger>
                      <SelectContent>
                        {(countries || []).map((c) => (
                          <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.address.city")}</Label>
                    <Input value={formData.city} onChange={(e) => updateField("city", e.target.value)} placeholder={t("portal_self_onboarding.form.address.city")} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.employment.job_title")}</Label>
                    <Input value={formData.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} placeholder={t("portal_self_onboarding.placeholders.job_title")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.employment.department")}</Label>
                    <Input value={formData.department} onChange={(e) => updateField("department", e.target.value)} placeholder={t("portal_self_onboarding.placeholders.department")} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.address.state")}</Label>
                    <Input value={formData.state} onChange={(e) => updateField("state", e.target.value)} placeholder={t("portal_self_onboarding.placeholders.state")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("portal_self_onboarding.form.address.postal_code")}</Label>
                    <Input value={formData.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} placeholder={t("portal_self_onboarding.placeholders.postal_code")} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("portal_self_onboarding.form.documents.description")}</p>
                {docTypes.map((doc) => {
                  const uploaded = documents.find((d) => d.type === doc.type);
                  return (
                    <div key={doc.type} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                            uploaded ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {uploaded ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {doc.label}
                            {doc.required && <span className="text-destructive ml-1">*</span>}
                          </p>
                          {uploaded && <p className="text-xs text-muted-foreground truncate">{uploaded.file?.name}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {uploaded && (
                          <Button variant="ghost" size="sm" onClick={() => removeDocument(doc.type)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <label className="cursor-pointer">
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(doc.type, doc.label, e)} />
                          <Button variant={uploaded ? "outline" : "default"} size="sm" asChild>
                            <span><Upload className="w-4 h-4 mr-1" />{uploaded ? t("portal_self_onboarding.form.documents.change_file") : t("portal_self_onboarding.form.documents.upload")}</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur sm:static sm:border-0 sm:bg-transparent mt-6">
          <div className="max-w-3xl mx-auto p-4 sm:p-0 flex items-center justify-between gap-3">
            <Button
              className="min-w-[120px]"
              variant="outline"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("portal_self_onboarding.buttons.previous")}
            </Button>
            {currentStep < 3 ? (
              <Button
                className="min-w-[120px]"
                onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
                disabled={currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email)}
              >
                {t("portal_self_onboarding.buttons.next")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button className="min-w-[120px]" onClick={handleSubmit} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("portal_self_onboarding.buttons.submitting")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t("portal_self_onboarding.buttons.submit")}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
