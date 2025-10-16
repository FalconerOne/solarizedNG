"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminAnalyticsPage() {
  const supabase = createClientComponentClient();
  const [data, setData] = useState<any[]>([]);
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [selectedGiveaway, setSelectedGiveaway] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchGiveaways();
    fetchAnalytics();
    const interval = setInterval(() => fetchAnalytics(), 300000); // Auto-refresh every 5 minutes
    return () => clearInterval(interval);
  }, [selectedGiveaway, startDate, endDate]);

  const fetchGiveaways = async () => {
    const { data: gData } = await supabase
      .from("giveaways")
      .select("id, title")
      .order("created_at", { ascending: false });
    if (gData) setGiveaways(gData);
  };

  const fetchAnalytics = async () => {
    let query = supabase
      .from("giveaway_daily_stats")
      .select("*")
      .order("date", { ascending: true });

    if (selectedGiveaway !== "all") query = query.eq("giveaway_id", selectedGiveaway);
    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    const { data: aData } = await query;
    if (aData) {
      setData(aData);
      setLastUpdated(new Date());
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Giveaway Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            {/* Giveaway Filter */}
            <select
              value={selectedGiveaway}
              onChange={(e) => setSelectedGiveaway(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">All Giveaways</option>
              {giveaways.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>

            {/* Date Range Filters */}
            <div className="flex gap-2">
              <label className="text-sm text-gray-500">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded p-2"
              />
              <label className="text-sm text-gray-500">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded p-2"
              />
            </div>

            {/* Refresh Indicator */}
            {lastUpdated && (
              <span className="text-xs text-gray-400 ml-auto">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="participants" stroke="#3b82f6" name="Participants" />
              <Line type="monotone" dataKey="entries" stroke="#10b981" name="Entries" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
