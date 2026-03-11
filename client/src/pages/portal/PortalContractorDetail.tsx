/**
 * Portal Contractor Detail Page
 *
 * Read-only view of contractor profile, service details, and financial configuration.
 * All data scoped to the logged-in customer.
 */

import { useParams, useLocation } from "wouter";
import PortalLayout from "@/components/PortalLayout";
import { portalTrpc } from "@/lib/portalTrpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Globe,
  FileText,
  Building2,
  Hash,
  Coins,
  StickyNote,
} from "lucide-react";
import { formatStatusLabel, countryName } from "@/lib/format";
import { portalPath } from "@/lib/portalBasePath";
import { useI18n } from "@/lib/i18n";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  pending_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  terminated: "bg-red-100 text-red-800 border-red-200",
};

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: any }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "-"}</p>
      </div>
    </div>
  );
}

export default function PortalContractorDetail() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const contractorId = Number(params.id);

  const { data: contractor, isLoading } = portalTrpc.contractors.getById.useQuery(
    { id: contractorId },
    { enabled: !!contractorId }
  );

  if (isLoading) {
    return (
      <PortalLayout title={t("portal_contractor_detail.title")}>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (!contractor) {
    return (
      <PortalLayout title={t("portal_contractor_detail.title")}>
        <div className="p-6 flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FileText className="w-10 h-10 mb-3" />
          <p className="text-lg font-medium">{t("portal_contractor_detail.not_found")}</p>
          <Button variant="outline" className="mt-4" onClick={() => setLocation(portalPath("/people"))}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {t("portal_contractor_detail.back_to_people")}
          </Button>
        </div>
      </PortalLayout>
    );
  }

  const paymentLabel = contractor.paymentFrequency
    ? contractor.paymentFrequency.replace("_", "-")
    : "N/A";

  return (
    <PortalLayout title={`${contractor.firstName} ${contractor.lastName}`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation(portalPath("/people"))}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">
                  {contractor.firstName} {contractor.lastName}
                </h2>
                <Badge variant="outline" className={statusColors[contractor.status] || ""}>
                  {formatStatusLabel(contractor.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {contractor.contractorCode} · {contractor.jobTitle || t("portal_contractor_detail.default_title")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" /> {t("portal_contractor_detail.personal_info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t("portal_contractor_detail.full_name")} value={`${contractor.firstName} ${contractor.lastName}`} icon={User} />
              <InfoRow label={t("portal_contractor_detail.email")} value={contractor.email} icon={Mail} />
              <InfoRow label={t("portal_contractor_detail.phone")} value={contractor.phone} icon={Phone} />
              <InfoRow label={t("portal_contractor_detail.dob")} value={contractor.dateOfBirth ? new Date(contractor.dateOfBirth).toLocaleDateString() : null} icon={Calendar} />
              <InfoRow label={t("portal_contractor_detail.nationality")} value={contractor.nationality} icon={Globe} />
              <Separator className="my-2" />
              <InfoRow label={t("portal_contractor_detail.address")} value={contractor.address} icon={MapPin} />
              <InfoRow label={t("portal_contractor_detail.city")} value={contractor.city} icon={Building2} />
              <InfoRow label={t("portal_contractor_detail.state")} value={contractor.state} icon={MapPin} />
              <InfoRow label={t("portal_contractor_detail.postal_code")} value={contractor.postalCode} icon={Hash} />
              <InfoRow label={t("portal_contractor_detail.country")} value={countryName(contractor.country)} icon={Globe} />
            </CardContent>
          </Card>

          {/* Service & Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {t("portal_contractor_detail.service_details")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t("portal_contractor_detail.job_title")} value={contractor.jobTitle} icon={Briefcase} />
              <InfoRow label={t("portal_contractor_detail.department")} value={contractor.department} icon={Building2} />
              <InfoRow label={t("portal_contractor_detail.start_date")} value={contractor.startDate ? new Date(contractor.startDate).toLocaleDateString() : null} icon={Calendar} />
              <InfoRow label={t("portal_contractor_detail.end_date")} value={contractor.endDate ? new Date(contractor.endDate).toLocaleDateString() : null} icon={Calendar} />
              <Separator className="my-2" />
              <InfoRow label={t("portal_contractor_detail.payment_frequency")} value={paymentLabel} icon={DollarSign} />
              <InfoRow
                label={t("portal_contractor_detail.amount")}
                value={
                  contractor.rateAmount
                    ? `${contractor.currency || "USD"} ${Number(contractor.rateAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : null
                }
                icon={DollarSign}
              />
              <InfoRow label={t("portal_contractor_detail.currency")} value={contractor.currency} icon={Coins} />
              {contractor.notes && (
                <>
                  <Separator className="my-2" />
                  <div className="flex items-start gap-3 py-2">
                    <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t("portal_contractor_detail.notes")}</p>
                      <p className="text-sm whitespace-pre-wrap">{contractor.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
