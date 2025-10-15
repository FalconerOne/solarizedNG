// components/admin/analytics/BroadcastStats.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { RefreshCw } from "lucide-react";

export default function BroadcastStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notification-stats");
    const data = await res.json();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const chartData =
    stats && stats.segments
      ? Object.entries(stats.segments).map(([segment, count]) => ({ segment, count }))
      : [];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📈 Broadcast Analytics</h2>
          <button onClick={loadStats} className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Total Broadcasts: <strong>{stats.total}</strong> · Last sent:{" "}
              {stats.latest ? new Date(stats.latest).toLocaleString() : "—"}
            </p>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No broadcasts yet.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
