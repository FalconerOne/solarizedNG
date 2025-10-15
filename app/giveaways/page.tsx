"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import JoinGiveawayModal from "@/components/giveaways/JoinGiveawayModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function GiveawaysPage() {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGiveaway, setSelectedGiveaway] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    const fetchGiveaways = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("giveaways")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      else setGiveaways(data || []);
      setLoading(false);
    };

    fetchUser();
    fetchGiveaways();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading Giveaways...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700 text-center">
        Available Giveaways 🎉
      </h1>

      {giveaways.length === 0 ? (
        <p className="text-gray-500 text-center">No active giveaways at the moment.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {giveaways.map((g) => (
            <Card
              key={g.id}
              className="border border-gray-200 shadow-sm hover:shadow-lg transition rounded-xl bg-white"
            >
              <img
                src={g.image_url || "/default-prize.jpg"}
                alt={g.title}
                className="w-full h-40 object-cover rounded-t-xl"
              />
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{g.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-2">{g.description}</p>
                <p className="mt-2 text-sm font-medium">
                  Activation Fee:{" "}
                  <span className="text-indigo-600">
                    {g.activation_fee > 0 ? `$${g.activation_fee}` : "Free"}
                  </span>
                </p>
                <Button
                  onClick={() => setSelectedGiveaway(g)}
                  className="mt-3 w-full bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Join Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for joining giveaway */}
      {selectedGiveaway && user && (
        <JoinGiveawayModal
          open={!!selectedGiveaway}
          onClose={() => setSelectedGiveaway(null)}
          giveaway={selectedGiveaway}
          userId={user.id}
        />
      )}
    </div>
  );
}
