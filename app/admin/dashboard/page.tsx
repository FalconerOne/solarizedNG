"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/lib/dashboardData";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2, Gift, Users, ActivitySquare } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await getDashboardData();
        setData(result);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading Dashboard...
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-red-500">Error loading data.</div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SummaryCard
          title="Total Giveaways"
          value={data.totalGiveaways}
          icon={<Gift className="text-pink-500" />}
          gradient="from-pink-100 via-pink-50 to-white"
        />
        <SummaryCard
          title="Total Participants"
          value={data.totalParticipants}
          icon={<Users className="text-blue-500" />}
          gradient="from-blue-100 via-blue-50 to-white"
        />
        <SummaryCard
          title="Active Giveaways"
          value={Math.floor(data.totalGiveaways * 0.75)}
          icon={<ActivitySquare className="text-green-500" />}
          gradient="from-green-100 via-green-50 to-white"
        />
      </div>

      {/* ===== Top Users ===== */}
      <Card className="p-5 shadow-sm border border-gray-200 hover:shadow-md transition">
        <CardHeader>
          <h3 className="font-semibold text-indigo-700 text-lg flex items-center gap-2">
            <Users className="w-4 h-4" /> Top Engaged Users
          </h3>
        </CardHeader>
        <CardContent>
          {data.topUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No user data available yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.topUsers.map((user: any, idx: number) => (
                <li
                  key={idx}
                  className="py-2 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition"
                >
                  <span className="font-medium text-gray-700">
                    {user.full_name || "Unnamed User"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {user.total_activity} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ===== Recent Activity ===== */}
      <Card className="p-5 shadow-sm border border-gray-200 hover:shadow-md transition">
        <CardHeader>
          <h3 className="font-semibold text-indigo-700 text-lg flex items-center gap-2">
            <ActivitySquare className="w-4 h-4" /> Recent Activity
          </h3>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity logged yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recentActivity.map((act: any, idx: number) => (
                <li
                  key={idx}
                  className="py-2 text-sm hover:bg-gray-50 px-2 rounded-md transition"
                >
                  <span className="text-gray-700">{act.details}</span>
                  <br />
                  <span className="text-xs text-gray-400">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ===== Summary Card Component ===== */
function SummaryCard({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <Card
      className={`p-5 text-center shadow-md border border-gray
