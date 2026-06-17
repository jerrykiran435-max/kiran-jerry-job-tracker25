import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { useApplications } from "@/hooks/use-applications";
import { STATUSES, type Status } from "@/lib/types";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TrackPath" },
      { name: "description", content: "Visualize your job application trends, conversion rates, and status distribution." },
    ],
  }),
  component: Analytics,
});

const COLORS: Record<Status, string> = {
  Applied: "#0ea5e9",
  Assessment: "#f59e0b",
  Interview: "#8b5cf6",
  "HR Round": "#6366f1",
  Offer: "#10b981",
  Rejected: "#f43f5e",
};

function Analytics() {
  const { apps } = useApplications();

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    apps.forEach((a) => {
      const m = a.appliedDate.slice(0, 7);
      map.set(m, (map.get(m) ?? 0) + 1);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [apps]);

  const distribution = useMemo(
    () => STATUSES.map((s) => ({ name: s, value: apps.filter((a) => a.status === s).length })),
    [apps],
  );

  const total = apps.length || 1;
  const interviewed = apps.filter((a) =>
    ["Interview", "HR Round", "Offer"].includes(a.status),
  ).length;
  const offers = apps.filter((a) => a.status === "Offer").length;
  const interviewRate = Math.round((interviewed / total) * 100);
  const offerRate = Math.round((offers / total) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Trends and conversion rates from your applications.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <ConversionCard label="Interview Conversion Rate" value={interviewRate} hint={`${interviewed} of ${apps.length} reached interview`} color="from-violet-500 to-violet-400" />
        <ConversionCard label="Offer Conversion Rate" value={offerRate} hint={`${offers} of ${apps.length} resulted in an offer`} color="from-emerald-500 to-emerald-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold text-foreground">Applications per Month</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "currentColor" }} className="text-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "currentColor" }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Status Distribution</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {distribution.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name as Status]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversionCard({ label, value, hint, color }: { label: string; value: number; hint: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 text-4xl font-semibold text-foreground">{value}%</div>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
