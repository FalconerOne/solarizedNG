// components/analytics/BroadcastStats.jsx
import React, { useEffect, useState } from "react";

export default function BroadcastStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/admin/notification-stats");
        const stats = await res.json();
        setData(stats);
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <p>Loading broadcast analytics...</p>;
  if (!data || data.error) return <p>No analytics found.</p>;

  const { total, latest, segments } = data;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">📊 Broadcast Overview</h2>
      <p>Total Broadcasts: <strong>{total}</strong></p>
      <p>Last Sent: {latest ? new Date(latest).toLocaleString() : "N/A"}</p>

      <h3 className="mt-4 font-semibold">Segments</h3>
      <ul className="text-sm mt-2">
        {segments &&
          Object.entries(segments).map(([segment, count]) => (
            <li key={segment}>
              {segment}: <strong>{count}</strong>
            </li>
          ))}
      </ul>
    </div>
  );
}
