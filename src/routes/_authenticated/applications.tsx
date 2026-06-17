import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, ExternalLink, ArrowUpDown, Loader2 } from "lucide-react";
import { useApplications } from "@/hooks/use-applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{apps.length} total · {filtered.length} shown</p>
        </div>
        <ApplicationDialog
          trigger={<Button><Plus className="mr-2 h-4 w-4" /> Add Application</Button>}
          saving={create.isPending}
          onSave={(app) => create.mutate(app as Omit<Application, "id">, {
            onSuccess: () => toast.success("Application added"),
            onError: (e) => toast.error(e.message),
          })}
        />
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company, role, location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-[180px]">
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

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <div className="col-span-3">Company</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-2">Applied</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-border">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">No applications match your filters.</div>
          )}
          {filtered.map((a) => (
            <div key={a.id} className="grid grid-cols-1 gap-2 px-4 py-4 md:grid-cols-12 md:items-center md:gap-4">
              <div className="md:col-span-3">
                <div className="font-medium text-foreground">{a.company}</div>
                <div className="text-xs text-muted-foreground">{a.location || "—"} · {a.jobPortal || "—"}</div>
              </div>
              <div className="md:col-span-3">
                <div className="text-sm text-foreground">{a.jobTitle}</div>
                <div className="text-xs text-muted-foreground">{a.salary || "Salary N/A"}</div>
              </div>
              <div className="text-sm text-muted-foreground md:col-span-2">{a.appliedDate}</div>
              <div className="md:col-span-2"><StatusBadge status={a.status} /></div>
              <div className="flex items-center gap-1 md:col-span-2 md:justify-end">
                {a.jobLink && (
                  <Button asChild variant="ghost" size="icon">
                    <a href={a.jobLink} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                  </Button>
                )}
                <ApplicationDialog
                  initial={a}
                  saving={update.isPending}
                  trigger={<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>}
                  onSave={(updated) =>
                    update.mutate({ ...(updated as Application), id: a.id }, {
                      onSuccess: () => toast.success("Application updated"),
                      onError: (e) => toast.error(e.message),
                    })
                  }
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this application?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove {a.company} — {a.jobTitle}.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
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
