import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface StatData {
  users: number;
  giveaways: number;
  entries: number;
  winners: number;
}

interface EntryCount {
  date: string;
  count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [chartData, setChartData] = useState<EntryCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [{ count: users }, { count: giveaways }, { count: entries }, { count: winners }] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("giveaways").select("*", { count: "exact", head: true }),
          supabase.from("entries").select("*", { count: "exact", head: true }),
          supabase.from("winners").select("*", { count: "exact", head: true }),
        ]);

      setStats({
        users: users || 0,
        giveaways: giveaways || 0,
        entries: entries || 0,
        winners: winners || 0,
      });

      // Aggregate entries per day for chart
      const { data: entriesData } = await supabase.rpc("get_daily_entries");
      setChartData(entriesData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-700">📈 Admin Dashboard</h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading analytics...</p>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats &&
                Object.entries(stats).map(([key, value]) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white shadow rounded-xl p-4 text-center border border-gray-100"
                  >
                    <div className="text-sm text-gray-500">{key.toUpperCase()}</div>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                  </motion.div>
                ))}
            </div>

            {/* Chart */}
            <Card className="shadow-md border">
              <CardContent>
                <h2 className="text-lg font-semibold mb-3">📊 Daily Participation</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
