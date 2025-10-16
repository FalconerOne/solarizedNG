"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/lib/dashboardData";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
    <div className="p-6 space-y-6">
      {/* --- Dashboard Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 text-center shadow-md border border-gray-200">
          <CardHeader>
            <h3 className="font-semibold text-indigo-700">Total Giveaways</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {data.totalGiveaways}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 text-center shadow-md border border-gray-200">
          <CardHeader>
            <h3 className="font-semibold text-indigo-700">Total Participants</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {data.totalParticipants}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 text-center shadow-md border border-gray-200">
          <CardHeader>
            <h3 className="font-semibold text-indigo-700">Total Registered Users</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {data.totalRegisteredUsers}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 text-center shadow-md border border-gray-200">
          <CardHeader>
            <h3 className="font-semibold text-indigo-700">Guest Users</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {data.totalGuestUsers}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 text-center shadow-md border border-gray-200">
          <CardHeader>
            <h3 className="font-semibold text-indigo-700">Total Donations</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${data.totalDonations?.toLocaleString() || "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Top Users --- */}
      <Card className="p-4 shadow-sm border border-gray-200">
        <CardHeader>
          <h3 className="font-semibold text-indigo-700">Top Engaged Users</h3>
        </CardHeader>
        <CardContent>
          {data.topUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No user data available yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.topUsers.map((user: any, idx: number) => (
                <li key={idx} className="py-2 flex justify-between">
                  <span>{user.full_name || "Unnamed User"}</span>
                  <span className="text-sm text-gray-600">
                    {user.total_activity} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* --- Recent Activity --- */}
      <Card className="p-4 shadow-sm border border-gray-200">
        <CardHeader>
          <h3 className="font-semibold text-indigo-700">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity logged yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recentActivity.map((act: any, idx: number) => (
                <li key={idx} className="py-2 text-sm">
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
