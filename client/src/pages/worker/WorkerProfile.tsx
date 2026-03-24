import { useState } from "react";
import { workerTrpc } from "@/lib/workerTrpc";
import { countryName, formatDate } from "@/lib/format";
import WorkerLayout from "./WorkerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function WorkerProfile() {
  const { data: profile, isLoading, refetch } = workerTrpc.profile.me.useQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const updateMutation = workerTrpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  if (isLoading) {
    return (
      <WorkerLayout>
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </WorkerLayout>
    );
  }

  // Extract the nested profile data for convenience
  const p = profile?.profile;

  const handleEdit = () => {
    setFormData({
      firstName: p?.firstName || "",
      lastName: p?.lastName || "",
      phone: p?.phone || "",
      address: p?.address || "",
      city: p?.city || "",
      state: p?.state || "",
      postalCode: p?.postalCode || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <WorkerLayout>
      <div className="space-y-4 md:space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Profile</h1>
          {!isEditing ? (
            <Button onClick={handleEdit} className="w-full sm:w-auto">Edit Profile</Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none">Cancel</Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1 sm:flex-none">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{p?.firstName} {p?.lastName}</h2>
                <p className="text-sm text-muted-foreground">{p?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                    {profile?.workerType === "contractor" ? "Contractor" : "Employee"}
                  </span>
                  {p?.country && (
                    <span className="text-xs text-muted-foreground">{countryName(p.country)}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">First Name</Label>
                  <Input
                    value={isEditing ? formData.firstName : p?.firstName || ""}
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Last Name</Label>
                  <Input
                    value={isEditing ? formData.lastName : p?.lastName || ""}
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input value={p?.email || ""} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Phone</Label>
                <Input
                  value={isEditing ? formData.phone : p?.phone || ""}
                  disabled={!isEditing}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Address</CardTitle>
              <CardDescription>Your residential address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Street Address</Label>
                <Input
                  value={isEditing ? formData.address : p?.address || ""}
                  disabled={!isEditing}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">City</Label>
                  <Input
                    value={isEditing ? formData.city : p?.city || ""}
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">State/Province</Label>
                  <Input
                    value={isEditing ? formData.state : p?.state || ""}
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Postal Code</Label>
                  <Input
                    value={isEditing ? formData.postalCode : p?.postalCode || ""}
                    disabled={!isEditing}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Country/Region</Label>
                  <Input value={countryName(p?.country)} disabled className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employment Details Card — read-only, managed by Admin/Client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Employment Details
            </CardTitle>
            <CardDescription>Managed by your employer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Job Title</Label>
                <Input value={p?.jobTitle || "—"} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Department</Label>
                <Input value={p?.department || "—"} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Country/Region</Label>
                <Input value={countryName(p?.country)} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Input value={p?.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "—"} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Start Date</Label>
                <Input value={p?.startDate ? formatDate(p.startDate) : "—"} disabled className="bg-muted" />
              </div>
              {p?.endDate && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">End Date</Label>
                  <Input value={formatDate(p.endDate)} disabled className="bg-muted" />
                </div>
              )}
            </div>
            {p?.jobDescription && (
              <div className="mt-4 space-y-2">
                <Label className="text-xs text-muted-foreground">Job Description</Label>
                <div className="min-h-[60px] px-3 py-2 bg-muted rounded-md border text-sm whitespace-pre-wrap">
                  {p.jobDescription}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WorkerLayout>
  );
}
