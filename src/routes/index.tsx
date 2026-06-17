import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Briefcase, ClipboardList, MessageSquare, Trophy, XCircle, TrendingUp, Plus, FileCheck } from "lucide-react";
import { useApplications } from "@/hooks/use-applications";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { ApplicationDialog } from "@/components/application-dialog";
import type { Status } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TrackPath" },
      { name: "description", content: "Overview of your job applications, interviews, and offers." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { apps, setApps } = useApplications();

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
    { label: "Total Applications", value: apps.length, icon: Briefcase, accent: "text-foreground" },
    { label: "Applied", value: stats.by.Applied, icon: ClipboardList, accent: "text-sky-500" },
    { label: "Assessment", value: stats.by.Assessment, icon: FileCheck, accent: "text-amber-500" },
    { label: "Interview", value: stats.by.Interview + stats.by["HR Round"], icon: MessageSquare, accent: "text-violet-500" },
    { label: "Offer", value: stats.by.Offer, icon: Trophy, accent: "text-emerald-500" },
    { label: "Rejected", value: stats.by.Rejected, icon: XCircle, accent: "text-rose-500" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your job search at a glance.</p>
        </div>
        <ApplicationDialog
          trigger={<Button><Plus className="mr-2 h-4 w-4" /> Add Application</Button>}
          onSave={(app) => { setApps([app, ...apps]); toast.success("Application added"); }}
        />
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                <Icon className={`h-4 w-4 ${c.accent}`} />
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{c.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Success Rate</div>
              <div className="text-3xl font-semibold text-foreground">{stats.successRate}%</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Offers vs. decided applications (offers + rejections).
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-base font-semibold text-foreground">Recent Applications</h2>
            <Link to="/applications" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recent.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground">No applications yet.</div>
            )}
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{a.company}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.jobTitle} · {a.location || "—"}</div>
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
