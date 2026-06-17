import { supabase } from "@/integrations/supabase/client";
import {
  type Application,
  type ApplicationRow,
  appToRow,
  rowToApp,
} from "./types";

const THEME_KEY = "jat.theme";

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

export async function fetchApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("applied_date", { ascending: false });
  if (error) throw error;
  return (data as ApplicationRow[]).map(rowToApp);
}

export async function createApplication(app: Omit<Application, "id">): Promise<Application> {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from("applications")
    .insert({ ...appToRow(app), user_id })
    .select()
    .single();
  if (error) throw error;
  return rowToApp(data as ApplicationRow);
}

export async function updateApplication(app: Application): Promise<Application> {
  const { data, error } = await supabase
    .from("applications")
    .update(appToRow(app))
    .eq("id", app.id)
    .select()
    .single();
  if (error) throw error;
  return rowToApp(data as ApplicationRow);
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteAllApplications(): Promise<void> {
  const user_id = await requireUserId();
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("user_id", user_id);
  if (error) throw error;
}

export async function bulkInsertApplications(apps: Omit<Application, "id">[]): Promise<void> {
  if (!apps.length) return;
  const user_id = await requireUserId();
  const { error } = await supabase
    .from("applications")
    .insert(apps.map((a) => ({ ...appToRow(a), user_id })));
  if (error) throw error;
}

// Theme (local-only)
export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(THEME_KEY) as "light" | "dark") || "light";
}

export function setTheme(t: "light" | "dark") {
  localStorage.setItem(THEME_KEY, t);
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function applyInitialTheme() {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", getTheme() === "dark");
}

// CSV
export function toCSV(apps: Application[]): string {
  const headers = [
    "company", "jobTitle", "location", "appliedDate", "jobLink",
    "jobPortal", "salary", "status", "resumeVersion", "interviewDate", "notes",
  ];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = apps.map((a) =>
    headers.map((h) => esc(String((a as never as Record<string, unknown>)[h] ?? ""))).join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function fromCSV(csv: string): Omit<Application, "id">[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const parseRow = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQ = false;
        else cur += ch;
      } else {
        if (ch === ',') { out.push(cur); cur = ""; }
        else if (ch === '"') inQ = true;
        else cur += ch;
      }
    }
    out.push(cur);
    return out;
  };
  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = cols[i] ?? ""));
    return {
      company: obj.company ?? "",
      jobTitle: obj.jobTitle ?? "",
      location: obj.location ?? "",
      appliedDate: obj.appliedDate || new Date().toISOString().slice(0, 10),
      jobLink: obj.jobLink ?? "",
      jobPortal: obj.jobPortal ?? "",
      salary: obj.salary ?? "",
      status: (obj.status as Application["status"]) || "Applied",
      resumeVersion: obj.resumeVersion ?? "",
      interviewDate: obj.interviewDate ?? "",
      notes: obj.notes ?? "",
    };
  });
}
