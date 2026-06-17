import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<Status, string> = {
  Applied:
    "bg-sky-500/15 text-sky-200 ring-sky-400/30 shadow-[0_0_20px_-8px_rgba(56,189,248,0.5)]",
  Assessment:
    "bg-amber-500/15 text-amber-200 ring-amber-400/30 shadow-[0_0_20px_-8px_rgba(245,158,11,0.5)]",
  Interview:
    "bg-violet-500/15 text-violet-200 ring-violet-400/30 shadow-[0_0_20px_-8px_rgba(139,92,246,0.5)]",
  "HR Round":
    "bg-indigo-500/15 text-indigo-200 ring-indigo-400/30 shadow-[0_0_20px_-8px_rgba(99,102,241,0.5)]",
  Offer:
    "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30 shadow-[0_0_20px_-8px_rgba(16,185,129,0.6)]",
  Rejected:
    "bg-rose-500/15 text-rose-200 ring-rose-400/30 shadow-[0_0_20px_-8px_rgba(244,63,94,0.5)]",
};

const DOT: Record<Status, string> = {
  Applied: "bg-sky-400",
  Assessment: "bg-amber-400",
  Interview: "bg-violet-400",
  "HR Round": "bg-indigo-400",
  Offer: "bg-emerald-400",
  Rejected: "bg-rose-400",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset backdrop-blur-sm",
        STYLES[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[status])} />
      {status}
    </span>
  );
}
