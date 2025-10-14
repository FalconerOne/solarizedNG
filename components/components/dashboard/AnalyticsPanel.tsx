"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getAnalyticsData, AnalyticsData } from "@/lib/supabase/analytics";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";

export default function AnalyticsPanel() {
  const [stats, setStats] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();

    const entriesChannel = supabase
      .channel("entries-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entries" },
        () => fetchAnalytics()
      )
      .subscribe();

    const sharesChannel = supabase
      .channel("shares-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shares" },
        () => fetchAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(entriesChannel);
      supabase.removeChannel(sharesChannel);
    };
  }, []);

  async function fetchAnalytics() {
    const data = await getAnalyticsData();
    setStats(data);
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Giveaways" value={stats.totals.totalGiveaways} />
        <SummaryCard label="Total Entries" value={stats.totals.totalEntries} />
        <SummaryCard label="Total Shares" value={stats.totals.totalShares} />
      </div>

      {/* Chart Visualization */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-md">
        <h3 className="text-slate-300 text-lg mb-3 font-medium">
          Performance per Giveaway
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.giveawayStats}>
              <XAxis dataKey="title" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                }}
              />
              <Bar dataKey="entryCount" fill="#38bdf8" name="Entries" />
              <Bar dataKey="shareCount" fill="#f472b6" name="Shares" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="p-6 bg-slate-900 rounded-2xl shadow-md border border-slate-800">
      <h4 className="text-slate-400 text-sm">{label}</h4>
      <p className="text-3xl font-semibold text-slate-100 mt-2">{value}</p>
    </div>
  );
}
