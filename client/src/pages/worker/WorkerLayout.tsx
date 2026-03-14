import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { workerTrpc } from "@/lib/workerTrpc";
import { 
  LayoutDashboard, 
  FileText, 
  Flag, 
  User, 
  LogOut,
  Bell,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  
  // Check auth
  const { data: user, isLoading, error } = workerTrpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  const logoutMutation = workerTrpc.auth.logout.useMutation({
    onSuccess: () => setLocation("/worker/login"),
  });

  // Change Password state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const changePasswordMutation = workerTrpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully");
      setChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to change password");
    },
  });
  const handleChangePassword = () => {
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmNewPassword) { toast.error("Passwords do not match"); return; }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/worker/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col fixed h-full">
        <div className="p-6 border-b h-16 flex items-center">
          <h1 className="font-bold text-xl">GEA Worker</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/worker/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
          <NavLink href="/worker/invoices" icon={FileText}>Invoices</NavLink>
          <NavLink href="/worker/milestones" icon={Flag}>Milestones</NavLink>
          <NavLink href="/worker/profile" icon={User}>Profile</NavLink>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground truncate">Worker</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => logoutMutation.mutate()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={(open) => { setChangePasswordOpen(open); if (!open) { setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Re-enter new password" />
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || newPassword !== confirmNewPassword || newPassword.length < 8}>
              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link href={href}>
      <a className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}>
        <Icon className="w-4 h-4" />
        {children}
      </a>
    </Link>
  );
}
