import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Briefcase, BarChart3, Settings, Target, LogOut, Sparkles } from "lucide-react";
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
    <aside className="hidden md:flex md:w-64 md:flex-col md:sticky md:top-0 md:h-screen">
      <div className="m-4 flex flex-1 flex-col rounded-2xl glass overflow-hidden">
        <div className="relative flex h-16 items-center gap-3 border-b border-white/5 px-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl gradient-brand blur-md opacity-70" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-lg">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-sm font-display font-semibold tracking-tight">TrackPath</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Job Tracker
            </div>
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
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "text-white shadow-lg"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-white/5",
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-xl gradient-brand opacity-90" />
                )}
                <Icon className={cn("relative h-4 w-4 transition-transform group-hover:scale-110", active && "drop-shadow")} />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/5 p-4 space-y-3">
          {email && (
            <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-brand text-[11px] font-semibold text-white">
                {email[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-xs text-sidebar-foreground/90 truncate" title={email}>
                {email}
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-white/5 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 flex rounded-2xl glass-strong p-1.5 md:hidden">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition-all",
              active ? "text-white" : "text-muted-foreground",
            )}
          >
            {active && <span className="absolute inset-0 rounded-xl gradient-brand opacity-90" />}
            <Icon className="relative h-4 w-4" />
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
