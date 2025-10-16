"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/lib/admin/dashboardData";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// ✅ Full Admin Dashboard with Enhanced Data Handling
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
            <h3 cl
