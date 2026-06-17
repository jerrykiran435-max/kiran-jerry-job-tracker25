import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<Status, string> = {
  Applied: "bg-sky-500/15 text-sky-600 dark:text-sky-300 ring-sky-500/30",
  Assessment: "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30",
  Interview: "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/30",
  "HR Round": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ring-indigo-500/30",
  Offer: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30",
  Rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/30",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
