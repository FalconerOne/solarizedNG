"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function GiveawayAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);

      const { data: giveaways, error } = await supabase
        .from("giveaways")
        .select("id, title, start_date, end_date");

      if (error || !giveaways) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Combine analytics data
      const analyticsData = await Promise.all(
        giveaways.map(async (g) => {
          const [
            { count: participantCount },
            { count: likeCount },
            { count: referralCount },
            { data: genderData },
          ] = await Promise.all([
            supabase
              .from("giveaway_participants")
              .select("*", { count: "exact", head: true })
              .eq("giveaway_id", g.id),

            supabase
              .from("giveaway_likes")
              .select("*", { count: "exact", head: true })
              .eq("giveaway_id", g.id),

            supabase
              .from("referrals")
              .select("*", { count: "exact", head: true })
              .eq("giveaway_id", g.id),

            supabase
              .from("user_profiles")
              .select("gender")
              .in(
                "id",
                (
                  await supabase
                    .from("giveaway_participants")
                    .select("user_id")
                    .eq("giveaway_id", g.id)
                ).data?.map((u) => u.user_id) || []
              ),
          ]);

          const genderCounts = { male: 0, female: 0, other: 0 };
          genderData?.forEach((g) => {
            const gender = g.gender?.toLowerCase();
            if (genderCounts[gender]) genderCounts[gender]++;
            else genderCounts.other++;
          });

          const now = new Date();
          const ended = new Date(g.end_date) < now;

          return {
            title: g.title,
            participants: participantCount || 0,
            likes: likeCount || 0,
            referrals: referralCount || 0,
            gender_male: genderCounts.male,
            gender_female: genderCounts.female,
            gender_other: genderCounts.other,
            status: ended ? "Ended" : "Active",
            start_date: g.start_date,
            end_date: g.end_date,
          };
        })
      );

      setAnalytics(analyticsData);
      setLoading(false);
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        📊 Giveaway Analytics & Engagement Overview
      </h1>

      {analytics.length === 0 && (
        <p className="text-gray-500">No giveaways or analytics data found.</p>
      )}

      {analytics.map((a) => (
        <Card key={a.title} className="p-4 bg-white shadow-md">
          <CardContent>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">{a.title}</h2>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  a.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {a.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700 mb-4">
              <div><strong>Participants:</strong> {a.participants}</div>
              <div><strong>Likes:</strong> {a.likes}</div>
              <div><strong>Referrals:</strong> {a.referrals}</div>
              <div><strong>Duration:</strong> {a.start_date} → {a.end_date}</div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[a]}>
                <XAxis dataKey="title" hide />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="gender_male" fill="#4f46e5" name="Male" />
                <Bar dataKey="gender_female" fill="#ec4899" name="Female" />
                <Bar dataKey="gender_other" fill="#a1a1aa" name="Other" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
