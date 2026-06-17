export const STATUSES = [
  "Applied",
  "Assessment",
  "Interview",
  "HR Round",
  "Offer",
  "Rejected",
] as const;

export type Status = (typeof STATUSES)[number];

export interface Application {
  id: string;
  company: string;
  jobTitle: string;
  location: string;
  appliedDate: string; // ISO date
  jobLink: string;
  jobPortal: string;
  salary: string;
  status: Status;
  resumeVersion: string;
  interviewDate: string; // ISO or ""
  notes: string;
}
