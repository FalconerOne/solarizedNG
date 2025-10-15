// components/admin/analytics/BroadcastStats.jsx
import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BroadcastStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notification-stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load broadcast stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const chartData =
    stats && stats.segments
      ? Object.entries(stats.segments).map(([segment, count]) => ({
          segment,
          count,
        }))
      : [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">📈 Broadcast Analytics</h2>
        <button
          onClick={loadStats}
          className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-3">
            Total Broadcasts:{" "}
            <strong>{stats?.total || 0}</strong> · Last sent:{" "}
            {stats?.latest
              ? new Date(stats.latest).toLocaleString()
              : "No data"}
          </p>

          {chartData.length > 0 ? (
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400">No broadcasts yet.</p>
          )}
        </>
      )}
    </div>
  );
}
