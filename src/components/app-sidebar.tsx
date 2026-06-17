import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Briefcase, BarChart3, Settings, Target, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function useUserEmail() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return email;
}

function useSignOut() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const email = useUserEmail();
  const signOut = useSignOut();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-sidebar-foreground">TrackPath</div>
          <div className="text-xs text-muted-foreground">Job Application Tracker</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4 space-y-3">
        {email && (
          <div className="text-xs text-muted-foreground truncate" title={email}>
            {email}
          </div>
        )}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card md:hidden">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
