import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES, type Application, type Status } from "@/lib/types";

interface Props {
  trigger: React.ReactNode;
  initial?: Application;
  onSave: (app: Application | Omit<Application, "id">) => void;
  saving?: boolean;
}

type FormState = Omit<Application, "id"> & { id?: string };

const empty = (): FormState => ({
  company: "",
  jobTitle: "",
  location: "",
  appliedDate: new Date().toISOString().slice(0, 10),
  jobLink: "",
  jobPortal: "",
  salary: "",
  status: "Applied",
  resumeVersion: "",
  interviewDate: "",
  notes: "",
});

export function ApplicationDialog({ trigger, initial, onSave, saving }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initial ?? empty());

  useEffect(() => {
    if (open) setForm(initial ?? empty());
  }, [open, initial]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.jobTitle.trim()) return;
    onSave(form as Application);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Application" : "New Application"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Company Name *">
            <Input value={form.company} onChange={(e) => set("company", e.target.value)} required />
          </Field>
          <Field label="Job Title *">
            <Input value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} required />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="Application Date">
            <Input
              type="date"
              value={form.appliedDate}
              onChange={(e) => set("appliedDate", e.target.value)}
            />
          </Field>
          <Field label="Job Link">
            <Input value={form.jobLink} onChange={(e) => set("jobLink", e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Job Portal">
            <Input value={form.jobPortal} onChange={(e) => set("jobPortal", e.target.value)} placeholder="LinkedIn, Indeed..." />
          </Field>
          <Field label="Salary Package">
            <Input value={form.salary} onChange={(e) => set("salary", e.target.value)} placeholder="$120,000/yr" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => set("status", v as Status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Resume Version">
            <Input value={form.resumeVersion} onChange={(e) => set("resumeVersion", e.target.value)} />
          </Field>
          <Field label="Interview Date">
            <Input
              type="date"
              value={form.interviewDate}
              onChange={(e) => set("interviewDate", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </Field>
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
