import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { workerTrpc } from "@/lib/workerTrpc";
import { 
  LayoutDashboard, 
  FileText, 
  Flag, 
  User, 
  LogOut,
  Bell
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  
  // Check auth
  const { data: user, isLoading, error } = workerTrpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  const logoutMutation = workerTrpc.auth.logout.useMutation({
    onSuccess: () => setLocation("/worker/login"),
  });

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
            <Button variant="ghost" size="icon" onClick={() => logoutMutation.mutate()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

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
