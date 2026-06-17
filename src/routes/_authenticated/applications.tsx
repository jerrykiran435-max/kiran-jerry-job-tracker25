import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, ExternalLink, ArrowUpDown, Briefcase } from "lucide-react";
import { useApplications } from "@/hooks/use-applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { ApplicationDialog } from "@/components/application-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { STATUSES, type Application, type Status } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Applications — TrackPath" },
      { name: "description", content: "All your job applications in one searchable, sortable list." },
    ],
  }),
  component: ApplicationsPage,
});

type SortKey = "date-desc" | "date-asc" | "company-asc" | "company-desc";

function ApplicationsPage() {
  const { apps, isLoading, create, update, remove } = useApplications();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sort, setSort] = useState<SortKey>("date-desc");

  const filtered = useMemo(() => {
    let r = apps;
    if (statusFilter !== "all") r = r.filter((a) => a.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((a) =>
        [a.company, a.jobTitle, a.location, a.jobPortal].some((f) => f.toLowerCase().includes(q)),
      );
    }
    r = [...r].sort((a, b) => {
      switch (sort) {
        case "date-asc": return a.appliedDate.localeCompare(b.appliedDate);
        case "date-desc": return b.appliedDate.localeCompare(a.appliedDate);
        case "company-asc": return a.company.localeCompare(b.company);
        case "company-desc": return b.company.localeCompare(a.company);
      }
    });
    return r;
  }, [apps, query, statusFilter, sort]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-10">
      <header className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 animate-fade-up">
        <div className="absolute -top-20 right-10 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl animate-float" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              <span className="gradient-text animate-gradient">Applications</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {apps.length} total · <span className="text-cyan-300">{filtered.length} shown</span>
            </p>
          </div>
          <ApplicationDialog
            trigger={
              <Button size="lg" className="gradient-brand text-white border-0 shadow-lg hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.6)]">
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

      <div className="flex flex-wrap items-center gap-3 rounded-2xl glass p-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company, role, location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus-visible:ring-cyan-400/40"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
          <SelectTrigger className="w-[160px] bg-white/5 border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest first</SelectItem>
            <SelectItem value="date-asc">Oldest first</SelectItem>
            <SelectItem value="company-asc">Company A→Z</SelectItem>
            <SelectItem value="company-desc">Company Z→A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl glass animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="hidden grid-cols-12 gap-4 border-b border-white/5 bg-white/[0.02] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <div className="col-span-3">Company</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-2">Applied</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-white/5">
          {isLoading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center md:gap-4">
              <div className="space-y-2 md:col-span-3"><Skeleton className="h-4 w-32 bg-white/5" /><Skeleton className="h-3 w-40 bg-white/5" /></div>
              <div className="space-y-2 md:col-span-3"><Skeleton className="h-4 w-40 bg-white/5" /><Skeleton className="h-3 w-24 bg-white/5" /></div>
              <Skeleton className="h-4 w-20 md:col-span-2 bg-white/5" />
              <Skeleton className="h-6 w-20 rounded-full md:col-span-2 bg-white/5" />
              <div className="md:col-span-2" />
            </div>
          ))}
          {!isLoading && filtered.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">No applications match your filters.</p>
            </div>
          )}
          {filtered.map((a, i) => (
            <div
              key={a.id}
              className="group grid grid-cols-1 gap-2 px-4 py-4 transition-colors hover:bg-white/[0.03] md:grid-cols-12 md:items-center md:gap-4 animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <div className="flex items-center gap-3 md:col-span-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 text-xs font-semibold">
                  {a.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{a.company}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.location || "Remote"} · {a.jobPortal || "—"}</div>
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="text-sm">{a.jobTitle}</div>
                <div className="text-xs text-muted-foreground">{a.salary || "Salary N/A"}</div>
              </div>
              <div className="text-sm text-muted-foreground md:col-span-2">{a.appliedDate}</div>
              <div className="md:col-span-2"><StatusBadge status={a.status} /></div>
              <div className="flex items-center gap-1 md:col-span-2 md:justify-end">
                {a.jobLink && (
                  <Button asChild variant="ghost" size="icon" className="hover:bg-white/10">
                    <a href={a.jobLink} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                  </Button>
                )}
                <ApplicationDialog
                  initial={a}
                  saving={update.isPending}
                  trigger={<Button variant="ghost" size="icon" className="hover:bg-white/10"><Pencil className="h-4 w-4" /></Button>}
                  onSave={(updated) =>
                    update.mutate({ ...(updated as Application), id: a.id }, {
                      onSuccess: () => toast.success("Application updated"),
                      onError: (e) => toast.error(e.message),
                    })
                  }
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-rose-500/10"><Trash2 className="h-4 w-4 text-rose-300" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-strong border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove {a.company} — {a.jobTitle}.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-rose-500 hover:bg-rose-600"
                        onClick={() =>
                          remove.mutate(a.id, {
                            onSuccess: () => toast.success("Application deleted"),
                            onError: (e) => toast.error(e.message),
                          })
                        }
                      >Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
