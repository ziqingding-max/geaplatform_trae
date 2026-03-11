import { useState } from "react";
import { workerTrpc } from "@/lib/workerTrpc";
import { countryName } from "@/lib/format";
import WorkerLayout from "./WorkerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
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

  const handleEdit = () => {
    setFormData({
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      phone: profile?.phone,
      address: profile?.address,
      city: profile?.city,
      state: profile?.state,
      postalCode: profile?.postalCode,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <WorkerLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          {!isEditing ? (
            <Button onClick={handleEdit}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your contact details and address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={isEditing ? formData.firstName : profile?.firstName} 
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={isEditing ? formData.lastName : profile?.lastName} 
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email} disabled className="bg-muted" />
              </div>
              
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={isEditing ? formData.phone : profile?.phone} 
                  disabled={!isEditing}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Your residential address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input 
                  value={isEditing ? formData.address : profile?.address} 
                  disabled={!isEditing}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    value={isEditing ? formData.city : profile?.city} 
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input 
                    value={isEditing ? formData.state : profile?.state} 
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, state: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input 
                    value={isEditing ? formData.postalCode : profile?.postalCode} 
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, postalCode: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country/Region</Label>
                  <Input value={countryName(profile?.country)} disabled className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </WorkerLayout>
  );
}
