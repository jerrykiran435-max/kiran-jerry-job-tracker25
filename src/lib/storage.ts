import type { Application, Status } from "./types";

const KEY = "jat.applications.v1";
const THEME_KEY = "jat.theme";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SAMPLE_COMPANIES = [
  ["Google", "Software Engineer Intern", "Mountain View, CA", "LinkedIn", "$8,500/mo"],
  ["Microsoft", "SDE I", "Redmond, WA", "Company Site", "$120,000/yr"],
  ["Stripe", "Backend Engineer", "Remote", "LinkedIn", "$140,000/yr"],
  ["Meta", "Frontend Engineer", "Menlo Park, CA", "Referral", "$135,000/yr"],
  ["Amazon", "SDE Intern", "Seattle, WA", "Company Site", "$8,000/mo"],
  ["Atlassian", "Graduate Engineer", "Sydney, AU", "LinkedIn", "$95,000/yr"],
  ["Shopify", "Junior Developer", "Remote", "AngelList", "$105,000/yr"],
  ["Notion", "Software Engineer", "San Francisco, CA", "Company Site", "$130,000/yr"],
  ["Airbnb", "New Grad Engineer", "San Francisco, CA", "LinkedIn", "$145,000/yr"],
  ["Linear", "Product Engineer", "Remote", "Twitter", "$125,000/yr"],
  ["Vercel", "Frontend Engineer", "Remote", "Company Site", "$135,000/yr"],
  ["Datadog", "Associate Engineer", "New York, NY", "LinkedIn", "$115,000/yr"],
  ["Cloudflare", "Systems Engineer", "Austin, TX", "Company Site", "$125,000/yr"],
  ["GitHub", "Software Engineer", "Remote", "LinkedIn", "$130,000/yr"],
  ["Figma", "Design Engineer", "San Francisco, CA", "Referral", "$140,000/yr"],
  ["Asana", "New Grad SWE", "San Francisco, CA", "Company Site", "$120,000/yr"],
  ["Coinbase", "Backend Engineer", "Remote", "LinkedIn", "$135,000/yr"],
  ["Square", "Software Engineer", "San Francisco, CA", "Company Site", "$125,000/yr"],
];

const STATUSES_POOL: Status[] = [
  "Applied", "Applied", "Applied", "Assessment", "Assessment",
  "Interview", "Interview", "HR Round", "Offer", "Rejected", "Rejected",
];

function generateSample(): Application[] {
  const now = Date.now();
  const day = 86400000;
  return SAMPLE_COMPANIES.map((c, i) => {
    const status = STATUSES_POOL[i % STATUSES_POOL.length];
    const applied = new Date(now - (i * 5 + Math.floor(Math.random() * 6)) * day);
    const hasInterview = ["Interview", "HR Round", "Offer"].includes(status);
    const interview = hasInterview
      ? new Date(applied.getTime() + (10 + Math.floor(Math.random() * 14)) * day).toISOString().slice(0, 10)
      : "";
    return {
      id: uid(),
      company: c[0],
      jobTitle: c[1],
      location: c[2],
      appliedDate: applied.toISOString().slice(0, 10),
      jobLink: `https://jobs.example.com/${c[0].toLowerCase()}`,
      jobPortal: c[3],
      salary: c[4],
      status,
      resumeVersion: i % 3 === 0 ? "v3 - Backend" : i % 3 === 1 ? "v2 - Frontend" : "v1 - General",
      interviewDate: interview,
      notes:
        status === "Offer"
          ? "Received offer! Negotiating start date."
          : status === "Rejected"
            ? "Did not progress past technical round."
            : status === "Interview"
              ? "Prep system design + behavioral."
              : "",
    };
  });
}

export function loadApplications(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const sample = generateSample();
      localStorage.setItem(KEY, JSON.stringify(sample));
      return sample;
    }
    return JSON.parse(raw) as Application[];
  } catch {
    return [];
  }
}

export function saveApplications(apps: Application[]) {
  localStorage.setItem(KEY, JSON.stringify(apps));
  window.dispatchEvent(new Event("jat:update"));
}

export function newId() {
  return uid();
}

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

export function fromCSV(csv: string): Application[] {
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
    return { id: uid(), ...obj } as unknown as Application;
  });
}
