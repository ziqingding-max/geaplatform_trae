/**
 * Portal Employee Detail Page
 *
 * Shows full employee profile, documents, contracts, and leave balances.
 * Unified design language with consistent field display patterns.
 */
import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { portalPath } from "@/lib/portalBasePath";
import { portalTrpc } from "@/lib/portalTrpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Briefcase,
  FileText,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Download,
  Upload,
  Shield,
  CreditCard,
  Home,
  Hash,
  Clock,
  AlertCircle,
  AlertTriangle,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDate, countryName } from "@/lib/format";

import { useI18n } from "@/lib/i18n";
const statusConfig: Record<string, { label: string; color: string }> = {
  pending_review: { label: "Pending Review", color: "bg-amber-50 text-amber-700 border-amber-200" },
  documents_incomplete: { label: "Documents Incomplete", color: "bg-rose-50 text-rose-700 border-rose-200" },
  onboarding: { label: "Onboarding", color: "bg-blue-50 text-blue-700 border-blue-200" },
  contract_signed: { label: "Contract Signed", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  active: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  on_leave: { label: "On Leave", color: "bg-purple-50 text-purple-700 border-purple-200" },
  offboarding: { label: "Offboarding", color: "bg-orange-50 text-orange-700 border-orange-200" },
  terminated: { label: "Terminated", color: "bg-red-50 text-red-700 border-red-200" },
};

const docTypeLabels: Record<string, string> = {
  resume: "Resume / CV",
  passport: "Passport",
  national_id: "National ID",
  work_permit: "Work Permit",
  visa: "Visa",
  contract: "Contract",
  education: "Education Certificate",
  other: "Other",
};

export default function PortalEmployeeDetail() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const employeeId = parseInt(params.id || "0", 10);

  const { data: employee, isLoading, refetch } = portalTrpc.employees.detail.useQuery(
    { id: employeeId },
    { enabled: !!employeeId }
  );

  // Document upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("passport");
  const [uploadDocName, setUploadDocName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = portalTrpc.employees.uploadDocument.useMutation({
    onSuccess: () => {
      toast.success(t("portal_employees.toast.uploadSuccess"));
      setUploadOpen(false);
      setUploadDocName("");
      setUploadDocType("passport");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("portal_employees.toast.fileTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        employeeId,
        documentType: uploadDocType as any,
        documentName: uploadDocName || file.name,
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  }

  // Can upload documents when status is documents_incomplete or pending_review
  const canUploadDocuments = employee?.status === "documents_incomplete" || employee?.status === "pending_review";

  if (isLoading) {
    return (
      <PortalLayout title="Employee Detail">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 col-span-1" />
            <Skeleton className="h-64 col-span-2" />
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (!employee) {
    return (
      <PortalLayout title="Employee Detail">
        <div className="p-6 max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">{t("portal_employees.detail.notFound")}</p>
            <Button variant="outline" className="mt-4" onClick={() => setLocation(portalPath("/people?tab=employees"))}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Employees
            </Button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const status = statusConfig[employee.status] || statusConfig.active;

  return (
    <PortalLayout title="Employee Detail">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation(portalPath("/people?tab=employees"))}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">
                  {employee.firstName} {employee.lastName}
                </h2>
                <Badge variant="outline" className={status.color}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {employee.employeeCode && <span className="mr-3">{employee.employeeCode}</span>}
                {employee.jobTitle} · {countryName(employee.country)}
              </p>
            </div>
          </div>
        </div>

        {/* Profile + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{employee.firstName} {employee.lastName}</h3>
                <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
                {employee.department && (
                  <p className="text-xs text-muted-foreground mt-1">{employee.department}</p>
                )}
              </div>
              <div className="mt-6 space-y-3">
                <ContactRow icon={Mail} label="Email" value={employee.email} />
                <ContactRow icon={Phone} label="Phone" value={employee.phone} />
                <ContactRow icon={MapPin} label="Location" value={
                  [employee.city, employee.state, countryName(employee.country)].filter(Boolean).join(", ") || undefined
                } />
                <ContactRow icon={Globe} label={t("portal_employees.personal.nationality")} value={countryName(employee.nationality)} />
                <ContactRow icon={Calendar} label="Date of Birth" value={
                  employee.dateOfBirth ? formatDate(employee.dateOfBirth) : undefined
                } />
              </div>
            </CardContent>
          </Card>

          {/* Right: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal">
              <TabsList>
                <TabsTrigger value="personal">{t("portal_employees.tabs.personal")}</TabsTrigger>
                <TabsTrigger value="employment">{t("portal_employees.tabs.employment")}</TabsTrigger>
                <TabsTrigger value="documents">Documents ({employee.documents?.length || 0})</TabsTrigger>
                <TabsTrigger value="contracts">Contracts ({employee.contracts?.length || 0})</TabsTrigger>
                {(employee.status === "active" || employee.status === "on_leave") && (
                  <TabsTrigger value="leave">{t("portal_employees.tabs.leave")}</TabsTrigger>
                )}
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <SectionTitle>{t("portal_employees.personal.basicInfo")}</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                      <InfoField icon={User} label="Full Name" value={`${employee.firstName} ${employee.lastName}`} hint="Legal name as per ID" />
                      <InfoField icon={Mail} label="Email Address" value={employee.email} hint="Primary contact email" />
                      <InfoField icon={Phone} label="Phone Number" value={employee.phone} hint="Contact number" />
                      <InfoField icon={Calendar} label="Date of Birth" value={employee.dateOfBirth ? formatDate(employee.dateOfBirth) : undefined} hint="DD MMM YYYY" />
                      <InfoField icon={User} label={t("portal_employees.personal.gender")} value={
                        employee.gender === "male" ? "Male" :
                        employee.gender === "female" ? "Female" :
                        employee.gender === "other" ? "Other" : undefined
                      } hint="As per official records" />
                      <InfoField icon={Globe} label="Nationality" value={countryName(employee.nationality)} hint="Country of citizenship" />
                    </div>

                    <SectionTitle className="mt-8">{t("portal_employees.personal.identification")}</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                      <InfoField icon={CreditCard} label="ID Type" value={
                        employee.idType === "passport" ? "Passport" :
                        employee.idType === "national_id" ? "National ID" :
                        employee.idType === "drivers_license" ? "Driver's License" :
                        employee.idType
                      } hint="Type of identification document" />
                      <InfoField icon={Hash} label="ID Number" value={employee.idNumber} hint="Document number" />
                    </div>

                    <SectionTitle className="mt-8">{t("portal_employees.personal.address")}</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                      <InfoField icon={Home} label="Street Address" value={employee.address} hint="Residential address" />
                      <InfoField icon={MapPin} label={t("portal_employees.personal.city")} value={employee.city} hint="City / Town" />
                      <InfoField icon={MapPin} label="State / Province" value={employee.state} hint="State or province" />
                      <InfoField icon={Hash} label="Postal Code" value={employee.postalCode} hint="ZIP / Postal code" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Employment Tab */}
              <TabsContent value="employment" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <SectionTitle>Employment Details</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                      <InfoField icon={Briefcase} label="Service Type" value={
                        employee.serviceType === "eor" ? "EOR" :
                        employee.serviceType === "visa_eor" ? "Visa EOR" :
                        employee.serviceType === "aor" ? "AOR" :
                        employee.serviceType
                      } hint="Type of service arrangement" />
                      <InfoField icon={Briefcase} label="Employment Type" value={
                        employee.employmentType === "long_term" ? "Permanent" :
                        employee.employmentType === "fixed_term" ? "Fixed Term" :
                        employee.employmentType
                      } hint="Contract duration type" />
                      <InfoField icon={Calendar} label="Start Date" value={employee.startDate ? formatDate(employee.startDate) : undefined} hint="Employment start date" />
                      <InfoField icon={Calendar} label="End Date" value={employee.endDate ? formatDate(employee.endDate) : undefined} hint="Contract end date (if fixed term)" />
                      <InfoField icon={MapPin} label="Employment Country" value={countryName(employee.country)} hint="Country of employment" />
                      <InfoField icon={Briefcase} label={t("portal_employees.employment.department")} value={employee.department} hint="Organizational department" />
                      <InfoField icon={Briefcase} label="Job Title" value={employee.jobTitle} hint="Current position" />
                      <InfoField icon={Hash} label="Employee Code" value={employee.employeeCode} hint="System-generated ID" />
                    </div>

                    <SectionTitle className="mt-8">{t("portal_employees.employment.compensation")}</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                      <InfoField icon={CreditCard} label="Base Salary" value={
                        employee.baseSalary != null
                          ? `${Number(employee.baseSalary).toLocaleString()} ${employee.salaryCurrency || "USD"}/month`
                          : undefined
                      } hint="Gross monthly base salary" />
                      <InfoField icon={CreditCard} label="Salary Currency" value={employee.salaryCurrency} hint="Payment currency" />
                    </div>

                    {/* Bank Details Section */}
                    {(() => {
                      const bd = employee.bankDetails as Record<string, string> | null;
                      if (!bd || typeof bd !== "object" || Object.keys(bd).length === 0) return null;
                      return (
                        <>
                          <SectionTitle className="mt-8">{t("portal_employees.employment.bankDetails") || "Bank Details"}</SectionTitle>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                            {Object.entries(bd).map(([key, value]) => (
                              value ? (
                                <InfoField
                                  key={key}
                                  icon={CreditCard}
                                  label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s: string) => s.toUpperCase()).trim()}
                                  value={String(value)}
                                  hint={`Bank ${key}`}
                                />
                              ) : null
                            ))}
                          </div>
                        </>
                      );
                    })()}

                    {employee.requiresVisa && (
                      <>
                        <SectionTitle className="mt-8">Visa Information</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                          <InfoField icon={Shield} label="Visa Status" value={
                            employee.visaStatus
                              ? employee.visaStatus.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                              : "Pending"
                          } hint="Current visa processing status" />
                          <InfoField icon={Calendar} label="Visa Expiry" value={employee.visaExpiryDate ? formatDate(employee.visaExpiryDate) : undefined} hint="Visa expiration date" />
                          <InfoField icon={FileText} label="Visa Notes" value={employee.visaNotes} hint="Additional visa information" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="mt-4 space-y-4">
                {/* Documents Incomplete Banner */}
                {employee.status === "documents_incomplete" && (
                  <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-rose-800">{t("portal_employees.status.documents_incomplete")}</p>
                          <p className="text-xs text-rose-600 mt-1">
                            Some required documents are missing. Please upload the necessary files below to proceed with onboarding.
                            Required documents typically include: Passport/National ID, Resume/CV, and any work permits if applicable.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upload Button */}
                {canUploadDocuments && (
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => setUploadOpen(true)}>
                      <Upload className="w-4 h-4 mr-2" /> Upload Document
                    </Button>
                  </div>
                )}

                {(employee.documents?.length || 0) === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <FileText className="w-10 h-10 mb-3" />
                        <p className="font-medium">No documents uploaded</p>
                        <p className="text-sm mt-1">
                          {canUploadDocuments
                            ? "Click \"Upload Document\" above to add required files."
                            : "Documents will appear here once uploaded."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {employee.documents!.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{doc.documentName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {docTypeLabels[doc.documentType] || doc.documentType}
                                  {doc.uploadedAt && ` · ${formatDate(doc.uploadedAt)}`}
                                </p>
                              </div>
                            </div>
                            {doc.fileUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4 mr-1" /> View
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Contracts Tab */}
              <TabsContent value="contracts" className="mt-4">
                {(employee.contracts?.length || 0) === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Shield className="w-10 h-10 mb-3" />
                        <p className="font-medium">No contracts</p>
                        <p className="text-sm mt-1">Contracts will appear here once created by the admin team.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {employee.contracts!.map((contract) => (
                      <Card key={contract.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{contract.contractType || "Employment Contract"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {contract.effectiveDate && `Effective: ${formatDate(contract.effectiveDate)}`}
                                  {contract.expiryDate && ` — Expires: ${formatDate(contract.expiryDate)}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={
                                contract.status === "signed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                contract.status === "draft" ? "bg-gray-50 text-gray-600 border-gray-200" :
                                "bg-amber-50 text-amber-700 border-amber-200"
                              }>
                                {contract.status || "draft"}
                              </Badge>
                              {contract.fileUrl && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={contract.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Leave Balances Tab */}
              <TabsContent value="leave" className="mt-4">
                {(employee.leaveBalances?.length || 0) === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Calendar className="w-10 h-10 mb-3" />
                        <p className="font-medium">No leave balances</p>
                        <p className="text-sm mt-1">Leave balances will appear once configured by the admin team.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.leaveBalances!.map((balance) => (
                      <Card key={balance.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium">{balance.leaveTypeName || `Leave Type #${balance.leaveTypeId}`}</p>
                            <span className="text-xs text-muted-foreground">{balance.year}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Used: {balance.used}</span>
                                <span>Total: {balance.totalEntitlement}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${Number(balance.totalEntitlement) > 0 ? Math.min(100, (Number(balance.used) / Number(balance.totalEntitlement)) * 100) : 0}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">{balance.remaining}</p>
                              <p className="text-xs text-muted-foreground">remaining</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>


            </Tabs>
          </div>
        </div>
        {/* Upload Document Dialog */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("portal_employees.documents.upload")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>{t("portal_employees.upload.docType")}</Label>
                <Select value={uploadDocType} onValueChange={setUploadDocType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">{t("portal_employees.docType.passport")}</SelectItem>
                    <SelectItem value="national_id">{t("portal_employees.docType.national_id")}</SelectItem>
                    <SelectItem value="resume">{t("portal_employees.docType.resume")}</SelectItem>
                    <SelectItem value="work_permit">{t("portal_employees.docType.work_permit")}</SelectItem>
                    <SelectItem value="visa">{t("portal_employees.docType.visa")}</SelectItem>
                    <SelectItem value="education">{t("portal_employees.docType.education")}</SelectItem>
                    <SelectItem value="other">{t("portal_employees.docType.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("portal_employees.upload.docName")}</Label>
                <Input
                  value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  placeholder="e.g. Passport - John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("portal_employees.upload.file")}</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploadMutation.isPending}
                />
              </div>
              {uploadMutation.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
}

/* ── Shared UI Components ── */

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={cn("text-sm font-semibold text-foreground/80 uppercase tracking-wider mb-4", className)}>
      {children}
    </h4>
  );
}

function InfoField({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value?: string | null; hint?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-medium mt-0.5 truncate">{value || "—"}</p>
        {hint && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="truncate">{value}</p>
      </div>
    </div>
  );
}
