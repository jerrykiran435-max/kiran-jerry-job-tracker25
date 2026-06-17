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
  appliedDate: string;
  jobLink: string;
  jobPortal: string;
  salary: string;
  status: Status;
  resumeVersion: string;
  interviewDate: string;
  notes: string;
}

// DB row <-> app shape
export interface ApplicationRow {
  id: string;
  company: string;
  job_title: string;
  location: string;
  applied_date: string;
  job_link: string;
  job_portal: string;
  salary: string;
  status: Status;
  resume_version: string;
  interview_date: string | null;
  notes: string;
}

export function rowToApp(r: ApplicationRow): Application {
  return {
    id: r.id,
    company: r.company,
    jobTitle: r.job_title,
    location: r.location,
    appliedDate: r.applied_date,
    jobLink: r.job_link,
    jobPortal: r.job_portal,
    salary: r.salary,
    status: r.status,
    resumeVersion: r.resume_version,
    interviewDate: r.interview_date ?? "",
    notes: r.notes,
  };
}

export function appToRow(a: Omit<Application, "id"> & { id?: string }) {
  return {
    company: a.company,
    job_title: a.jobTitle,
    location: a.location,
    applied_date: a.appliedDate,
    job_link: a.jobLink,
    job_portal: a.jobPortal,
    salary: a.salary,
    status: a.status,
    resume_version: a.resumeVersion,
    interview_date: a.interviewDate ? a.interviewDate : null,
    notes: a.notes,
  };
}
