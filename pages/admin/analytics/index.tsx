"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#F59E0B", "#6366F1"];

const AnalyticsPage: React.FC = () => {
  const [entriesGrowth, setEntriesGrowth] = useState<any[]>([]);
  const [topGiveaways, setTopGiveaways] = useState<any[]>([]);
  const [prizeDistribution, setPrizeDistribution] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      // 1️⃣ Entries over time (grouped by date)
      const { data: entries } = await supabase
        .from("entries")
        .select("id, created_at")
        .order("created_at", { ascending: true });

      if (entries) {
        const growthMap: Record<string, number> = {};
        entries.forEach(e => {
          const date = new Date(e.created_at).toISOString().split("T")[0];
          growthMap[date] = (growthMap[date] || 0) + 1;
        });
        const formatted = Object.entries(growthMap).map(([date, count]) => ({
          date,
          count
        }));
        setEntriesGrowth(formatted);
      }

      // 2️⃣ Top giveaways by entries count
      const { data: giveaways } = await supabase
        .from("entries")
        .select("giveaway_id, id");
      if (giveaways) {
        const countMap: Record<string, number> = {};
        giveaways.forEach(g => {
          countMap[g.giveaway_id] = (countMap[g.giveaway_id] || 0) + 1;
        });
        const sorted = Object.entries(countMap)
          .map(([giveaway_id, total]) => ({ giveaway_id, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        setTopGiveaways(sorted);
      }

      // 3️⃣ Prize type breakdown (count by type)
      const { data: prizes } = await supabase
        .from("prizes")
        .select("id, title, giveaway_id");
      if (prizes) {
        const distMap: Record<string, number> = {};
        prizes.forEach(p => {
          distMap[p.title] = (distMap[p.title] || 0) + 1;
        });
        const formatted = Object.entries(distMap).map(([name, value]) => ({
          name,
          value
        }));
        setPrizeDistribution(formatted);
      }
    }

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Analytics Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Entries Growth */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-medium mb-3">Entries Growth Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={entriesGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#F97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Giveaways */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-medium mb-3">Top Giveaways by Entries</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topGiveaways}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="giveaway_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Prize Distribution */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-medium mb-3">Prize Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={prizeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name }) => name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prizeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
