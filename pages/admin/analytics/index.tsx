"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const COLORS = ["#f97316", "#60a5fa", "#34d399", "#facc15", "#a78bfa"];

const AnalyticsPage: React.FC = () => {
  const supabase = createClientComponentClient();

  const [timeRange, setTimeRange] = useState<"7" | "30" | "all">("7");
  const [entriesData, setEntriesData] = useState<any[]>([]);
  const [prizesData, setPrizesData] = useState<any[]>([]);
  const [giveawayStats, setGiveawayStats] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      const since =
        timeRange === "all"
          ? null
          : new Date(Date.now() - Number(timeRange) * 24 * 60 * 60 * 1000);

      // 1️⃣ Entries over time
      let query = supabase.from("entries").select("created_at");
      if (since) query = query.gte("created_at", since.toISOString());
      const { data: entries } = await query;

      const dailyEntries = (entries || []).reduce((acc: any, entry: any) => {
        const day = new Date(entry.created_at).toLocaleDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      setEntriesData(
        Object.entries(dailyEntries).map(([date, count]) => ({
          date,
          entries: count,
        }))
      );

      // 2️⃣ Prizes claimed vs unclaimed
      const { data: prizes } = await supabase.from("prizes").select("claimed");
      const claimed = prizes?.filter((p) => p.claimed).length || 0;
      const unclaimed = prizes?.filter((p) => !p.claimed).length || 0;
      setPrizesData([
        { name: "Claimed", value: claimed },
        { name: "Unclaimed", value: unclaimed },
      ]);

      // 3️⃣ Top performing giveaways
      const { data: giveaways } = await supabase
        .from("giveaways")
        .select("title, entries_count")
        .order("entries_count", { ascending: false })
        .limit(5);
      setGiveawayStats(
        giveaways?.map((g) => ({
          name: g.title || "Untitled",
          entries: g.entries_count || 0,
        })) || []
      );

      // 4️⃣ Engagement overview (mock)
      setEngagementData([
        { name: "Mon", visits: 400, shares: 240, signups: 120 },
        { name: "Tue", visits: 300, shares: 139, signups: 200 },
        { name: "Wed", visits: 500, shares: 250, signups: 180 },
        { name: "Thu", visits: 450, shares: 210, signups: 260 },
        { name: "Fri", visits: 480, shares: 220, signups: 230 },
        { name: "Sat", visits: 600, shares: 280, signups: 320 },
        { name: "Sun", visits: 520, shares: 260, signups: 300 },
      ]);

      // 5️⃣ Referrals leaderboard
      let refQuery = supabase.from("entries").select("referred_by");
      if (since) refQuery = refQuery.gte("created_at", since.toISOString());
      const { data: referrals } = await refQuery;

      const refMap = (referrals || []).reduce((acc: any, r: any) => {
        if (!r.referred_by) return acc;
        acc[r.referred_by] = (acc[r.referred_by] || 0) + 1;
        return acc;
      }, {});
      setLeaderboard(
        Object.entries(refMap)
          .map(([ref, count]) => ({ ref, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6 overflow-y-auto flex-1">
          {/* 🌟 Sticky Filter Bar */}
          <div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">📊 Giveaway Analytics</h1>

            <div className="flex space-x-2">
              {[
                { label: "Last 7 Days", value: "7" },
                { label: "Last 30 Days", value: "30" },
                { label: "All Time", value: "all" },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setTimeRange(btn.value as any)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    timeRange === btn.value
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* 📈 Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* 1️⃣ Entries Over Time */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-medium text-lg mb-3">Entries Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={entriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="entries"
                    stroke="#f97316"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 2️⃣ Prizes Claimed vs Unclaimed */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-medium text-lg mb-3">
                Prizes Claimed vs. Unclaimed
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={prizesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                    dataKey="value"
                  >
                    {prizesData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 3️⃣ Top Performing Giveaways */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-medium text-lg mb-3">Top Performing Giveaways</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={giveawayStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="entries" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 4️⃣ Engagement Overview */}
            <div className="bg-white rounded-2xl shadow p-4 md:col-span-2">
              <h2 className="font-medium text-lg mb-3">Engagement Overview</h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stackId="1"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="shares"
                    stackId="1"
                    stroke="#60a5fa"
                    fill="#60a5fa"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="signups"
                    stackId="1"
                    stroke="#34d399"
                    fill="#34d399"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 5️⃣ Referrals Leaderboard */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="font-medium text-lg mb-3">Top Referrers</h2>
              <ul className="divide-y">
                {leaderboard.length === 0 ? (
                  <p className="text-gray-400 text-sm py-4 text-center">
                    No referral data yet.
                  </p>
                ) : (
                  leaderboard.map((r, i) => (
                    <li
                      key={i}
                      className="flex justify-between py-2 text-sm text-gray-700"
                    >
                      <span>{r.ref}</span>
                      <span className="font-medium text-orange-500">
                        {r.count} referrals
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
