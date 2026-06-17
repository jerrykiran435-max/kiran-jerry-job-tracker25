import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, Upload, Moon, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useApplications } from "@/hooks/use-applications";
import { fromCSV, getTheme, setTheme, toCSV } from "@/lib/storage";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TrackPath" },
      { name: "description", content: "Theme, CSV import and export." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { apps, setApps } = useApplications();
  const [dark, setDark] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDark(getTheme() === "dark"); }, []);

  const toggleDark = (v: boolean) => {
    setDark(v);
    setTheme(v ? "dark" : "light");
  };

  const exportCsv = () => {
    const blob = new Blob([toCSV(apps)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trackpath-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const imported = fromCSV(text);
    if (!imported.length) return toast.error("No rows found in CSV");
    setApps([...imported, ...apps]);
    toast.success(`Imported ${imported.length} applications`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize your experience and manage your data.</p>
      </header>

      <Section title="Appearance">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
            <div>
              <div className="font-medium text-foreground">Dark Mode</div>
              <div className="text-sm text-muted-foreground">Toggle between light and dark themes.</div>
            </div>
          </div>
          <Switch checked={dark} onCheckedChange={toggleDark} />
        </div>
      </Section>

      <Section title="Data Management">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium text-foreground">Export to CSV</div>
              <div className="text-sm text-muted-foreground">Download all {apps.length} applications as a CSV file.</div>
            </div>
            <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              <div className="font-medium text-foreground">Import from CSV</div>
              <div className="text-sm text-muted-foreground">Add applications from a CSV file (matches export format).</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importCsv(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Import CSV
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              <div className="font-medium text-foreground">Clear all data</div>
              <div className="text-sm text-muted-foreground">Delete every application stored in your browser.</div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Clear</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all applications?</AlertDialogTitle>
                  <AlertDialogDescription>This cannot be undone. Export first if you want a backup.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { setApps([]); toast.success("All data cleared"); }}>
                    Clear all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}
