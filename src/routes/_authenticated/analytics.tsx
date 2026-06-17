import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { useApplications } from "@/hooks/use-applications";
import { STATUSES, type Status } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TrackPath" },
      { name: "description", content: "Visualize your job application trends, conversion rates, and status distribution." },
    ],
  }),
  component: Analytics,
});

const COLORS: Record<Status, string> = {
  Applied: "#38bdf8",
  Assessment: "#fbbf24",
  Interview: "#a78bfa",
  "HR Round": "#818cf8",
  Offer: "#34d399",
  Rejected: "#fb7185",
};

function Analytics() {
  const { apps, isLoading } = useApplications();

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
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-10">
      <header className="relative overflow-hidden rounded-3xl glass p-6 md:p-8 animate-fade-up">
        <div className="absolute -top-16 right-10 h-44 w-44 rounded-full bg-cyan-500/20 blur-3xl animate-float" />
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            <span className="gradient-text animate-gradient">Analytics</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Trends and conversion rates from your applications.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <ConversionCard label="Interview Conversion Rate" value={interviewRate} hint={`${interviewed} of ${apps.length} reached interview`} from="from-violet-500/30" to="to-fuchsia-500/10" bar="from-violet-400 via-fuchsia-400 to-pink-400" delay={80} />
        <ConversionCard label="Offer Conversion Rate" value={offerRate} hint={`${offers} of ${apps.length} resulted in an offer`} from="from-emerald-500/30" to="to-cyan-500/10" bar="from-emerald-400 via-teal-400 to-cyan-400" delay={160} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl glass p-6 lg:col-span-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold">Applications per Month</h2>
              <p className="text-xs text-muted-foreground">Volume over time</p>
            </div>
          </div>
          <div className="mt-4 h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      backdropFilter: "blur(12px)",
                      color: "white",
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barFill)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl glass p-6 lg:col-span-2 animate-fade-up" style={{ animationDelay: "320ms" }}>
          <div>
            <h2 className="font-display text-base font-semibold">Status Distribution</h2>
            <p className="text-xs text-muted-foreground">Where you are in each pipeline</p>
          </div>
          <div className="mt-4 h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-full bg-white/5" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3} stroke="none">
                    {distribution.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name as Status]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      backdropFilter: "blur(12px)",
                      color: "white",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversionCard({
  label, value, hint, from, to, bar, delay,
}: { label: string; value: number; hint: string; from: string; to: string; bar: string; delay: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl glass p-6 transition-transform hover:-translate-y-1 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${from} ${to} opacity-60`} />
      <div className="relative">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-2 font-display text-5xl font-bold gradient-text">{value}%</div>
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
          <div className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-1000`} style={{ width: `${value}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
