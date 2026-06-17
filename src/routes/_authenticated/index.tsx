import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Briefcase, ClipboardList, MessageSquare, Trophy, XCircle,
  TrendingUp, Plus, FileCheck, ArrowUpRight, Sparkles,
} from "lucide-react";
import { useApplications } from "@/hooks/use-applications";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationDialog } from "@/components/application-dialog";
import type { Application, Status } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TrackPath" },
      { name: "description", content: "Overview of your job applications, interviews, and offers." },
    ],
  }),
  component: Dashboard,
});

const CARD_STYLES: Record<string, { from: string; ring: string; icon: string }> = {
  Total:       { from: "from-indigo-500/30 to-cyan-500/20", ring: "ring-indigo-400/30", icon: "text-indigo-200" },
  Applied:     { from: "from-sky-500/30 to-blue-500/10",    ring: "ring-sky-400/30",    icon: "text-sky-200" },
  Assessment:  { from: "from-amber-500/30 to-orange-500/10",ring: "ring-amber-400/30",  icon: "text-amber-200" },
  Interview:   { from: "from-violet-500/30 to-fuchsia-500/10",ring: "ring-violet-400/30",icon: "text-violet-200" },
  Offer:       { from: "from-emerald-500/30 to-teal-500/10",ring: "ring-emerald-400/30",icon: "text-emerald-200" },
  Rejected:    { from: "from-rose-500/30 to-pink-500/10",   ring: "ring-rose-400/30",   icon: "text-rose-200" },
};

function Dashboard() {
  const { apps, isLoading, create } = useApplications();

  const stats = useMemo(() => {
    const by: Record<Status, number> = {
      Applied: 0, Assessment: 0, Interview: 0, "HR Round": 0, Offer: 0, Rejected: 0,
    };
    apps.forEach((a) => (by[a.status] += 1));
    const decided = by.Offer + by.Rejected;
    const successRate = decided > 0 ? Math.round((by.Offer / decided) * 100) : 0;
    return { by, successRate };
  }, [apps]);

  const recent = useMemo(
    () => [...apps].sort((a, b) => b.appliedDate.localeCompare(a.appliedDate)).slice(0, 6),
    [apps],
  );

  const cards = [
    { key: "Total", label: "Total Applications", value: apps.length, icon: Briefcase },
    { key: "Applied", label: "Applied", value: stats.by.Applied, icon: ClipboardList },
    { key: "Assessment", label: "Assessment", value: stats.by.Assessment, icon: FileCheck },
    { key: "Interview", label: "Interview", value: stats.by.Interview + stats.by["HR Round"], icon: MessageSquare },
    { key: "Offer", label: "Offer", value: stats.by.Offer, icon: Trophy },
    { key: "Rejected", label: "Rejected", value: stats.by.Rejected, icon: XCircle },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-10">
      {/* Hero header */}
      <header className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 animate-fade-up">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full gradient-brand opacity-30 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-white/10">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              Your job search, illuminated
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-display font-bold tracking-tight">
              <span className="gradient-text animate-gradient">Dashboard</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {apps.length === 0
                ? "Add your first application to start tracking momentum."
                : `Tracking ${apps.length} application${apps.length === 1 ? "" : "s"} across ${Object.values(stats.by).filter(Boolean).length} stages.`}
            </p>
          </div>
          <ApplicationDialog
            trigger={
              <Button size="lg" className="gradient-brand text-white border-0 shadow-lg hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.6)] transition-shadow">
                <Plus className="mr-2 h-4 w-4" /> Add Application
              </Button>
            }
            saving={create.isPending}
            onSave={(app) => create.mutate(app as Omit<Application, "id">, {
              onSuccess: () => toast.success("Application added"),
              onError: (e) => toast.error(e.message),
            })}
          />
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />
            ))
          : cards.map((c, i) => {
              const Icon = c.icon;
              const style = CARD_STYLES[c.key];
              return (
                <div
                  key={c.label}
                  className="group relative overflow-hidden rounded-2xl glass p-4 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(99,102,241,0.5)] animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-100", style.from)} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{c.label}</span>
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 ring-1", style.ring)}>
                        <Icon className={cn("h-3.5 w-3.5", style.icon)} />
                      </div>
                    </div>
                    <div className="mt-4 font-display text-3xl font-bold tracking-tight">{c.value}</div>
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Success rate */}
        <div className="relative overflow-hidden rounded-2xl glass p-6 animate-fade-up" style={{ animationDelay: "360ms" }}>
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 ring-1 ring-emerald-400/30">
                <TrendingUp className="h-5 w-5 text-emerald-200" />
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Success Rate</div>
                <div className="font-display text-4xl font-bold gradient-text">{stats.successRate}%</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Offers vs. decided applications (offers + rejections).
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-1000"
                style={{ width: `${stats.successRate}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
              <span>{stats.by.Offer} offers</span>
              <span>{stats.by.Rejected} rejected</span>
            </div>
          </div>
        </div>

        {/* Recent applications */}
        <div className="rounded-2xl glass overflow-hidden lg:col-span-2 animate-fade-up" style={{ animationDelay: "420ms" }}>
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <div>
              <h2 className="text-base font-display font-semibold">Recent Applications</h2>
              <p className="text-xs text-muted-foreground">Your latest 6 submissions</p>
            </div>
            <Link
              to="/applications"
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-white/5" />
                  <Skeleton className="h-3 w-48 bg-white/5" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
              </div>
            ))}
            {!isLoading && recent.length === 0 && (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">No applications yet. Add your first one above.</p>
              </div>
            )}
            {recent.map((a) => (
              <div key={a.id} className="group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-xs font-semibold">
                    {a.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.company}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.jobTitle} · {a.location || "Remote"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-muted-foreground sm:inline">{a.appliedDate}</span>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
