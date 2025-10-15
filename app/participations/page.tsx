"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function MyParticipationsPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [participations, setParticipations] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipations = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("giveaway_participants")
        .select(
          `
          id,
          joined_at,
          giveaway:giveaway_id (
            id,
            title,
            activation_fee,
            status
          )
        `
        )
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });

      if (error) console.error(error);
      setParticipations(data || []);
      setLoading(false);
    };

    fetchParticipations();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-indigo-600" />
      </div>
    );

  if (!userId)
    return (
      <div className="text-center py-16 text-gray-600">
        Please log in to view your participations.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-indigo-700">
        My Participations
      </h1>

      {participations.length === 0 ? (
        <p className="text-gray-500 text-center">You haven’t joined any giveaways yet.</p>
      ) : (
        <div className="grid gap-4">
          {participations.map((p) => (
            <Card
              key={p.id}
              className="shadow-md border border-gray-100 hover:shadow-lg transition"
            >
              <CardHeader>
                <CardTitle className="text-lg text-indigo-700">
                  {p.giveaway?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <p>Status: {p.giveaway?.status || "Active"}</p>
                <p>
                  Activation Fee:{" "}
                  {p.giveaway?.activation_fee > 0
                    ? `$${p.giveaway.activation_fee}`
                    : "Free"}
                </p>
                <p>
                  Joined:{" "}
                  {new Date(p.joined_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
