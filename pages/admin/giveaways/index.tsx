"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PlusCircle, ChevronDown, ChevronRight, Trash2, Edit } from "lucide-react";

const GiveawaysPage: React.FC = () => {
  const supabase = createClientComponentClient();
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  // Fetch all giveaways
  useEffect(() => {
    fetchGiveaways();
  }, []);

  async function fetchGiveaways() {
    setLoading(true);
    const { data, error } = await supabase
      .from("giveaways")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setGiveaways(data);
    setLoading(false);
  }

  // Expand or collapse giveaway to show prizes
  async function togglePrizes(giveawayId: string) {
    if (expanded === giveawayId) {
      setExpanded(null);
      return;
    }

    if (!prizes[giveawayId]) {
      const { data, error } = await supabase
        .from("prizes")
        .select("*")
        .eq("giveaway_id", giveawayId)
        .order("rank", { ascending: true });
      if (!error) setPrizes((prev) => ({ ...prev, [giveawayId]: data || [] }));
    }

    setExpanded(giveawayId);
  }

  // Add a prize
  async function addPrize(giveawayId: string) {
    const title = prompt("Enter prize title:");
    if (!title) return;

    const description = prompt("Enter description (optional):") || "";
    const rank = parseInt(prompt("Enter rank (1 for top prize):") || "1");

    const { error } = await supabase.from("prizes").insert([
      { giveaway_id: giveawayId, title, description, rank },
    ]);

    if (error) {
      alert("Error adding prize");
      console.error(error);
    } else {
      alert("Prize added successfully!");
      togglePrizes(giveawayId);
      togglePrizes(giveawayId); // refresh view
    }
  }

  // Delete a prize
  async function deletePrize(prizeId: string, giveawayId: string) {
    if (!confirm("Delete this prize?")) return;
    const { error } = await supabase.from("prizes").delete().eq("id", prizeId);
    if (error) {
      alert("Failed to delete");
      console.error(error);
    } else {
      setPrizes((prev) => ({
        ...prev,
        [giveawayId]: prev[giveawayId].filter((p) => p.id !== prizeId),
      }));
    }
  }

  // Edit a prize
  async function editPrize(prize: any, giveawayId: string) {
    const title = prompt("Edit title:", prize.title);
    if (!title) return;

    const description = prompt("Edit description:", prize.description || "");
    const rank = parseInt(prompt("Edit rank:", prize.rank || "1"));

    const { error } = await supabase
      .from("prizes")
      .update({ title, description, rank })
      .eq("id", prize.id);

    if (error) {
      alert("Failed to update prize");
      console.error(error);
    } else {
      setPrizes((prev) => ({
        ...prev,
        [giveawayId]: prev[giveawayId].map((p) =>
          p.id === prize.id ? { ...p, title, description, rank } : p
        ),
      }));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 flex items-center">
        <span>🎁 Giveaways & Prizes</span>
      </h1>

      {loading && <p>Loading giveaways...</p>}

      <div className="space-y-4">
        {giveaways.map((giveaway) => (
          <div
            key={giveaway.id}
            className="bg-white shadow rounded-2xl p-4 border border-gray-100"
          >
            {/* Giveaway header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{giveaway.title}</h2>
                <p className="text-gray-500 text-sm">
                  {giveaway.description || "No description"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => addPrize(giveaway.id)}
                  className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  <PlusCircle size={18} /> Add Prize
                </button>
                <button
                  onClick={() => togglePrizes(giveaway.id)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {expanded === giveaway.id ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Prize list */}
            {expanded === giveaway.id && (
              <div className="mt-4 border-t border-gray-100 pt-3 space-y-2">
                {(!prizes[giveaway.id] || prizes[giveaway.id].length === 0) && (
                  <p className="text-gray-500 text-sm">No prizes added yet.</p>
                )}

                {prizes[giveaway.id]?.map((prize) => (
                  <div
                    key={prize.id}
                    className="flex justify-between items-center bg-gray-50 rounded-lg p-2"
                  >
                    <div>
                      <p className="font-medium">{prize.title}</p>
                      <p className="text-sm text-gray-500">
                        {prize.description || "—"} (Rank: {prize.rank})
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => editPrize(prize, giveaway.id)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deletePrize(prize.id, giveaway.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {giveaways.length === 0 && !loading && (
          <p className="text-gray-500 text-sm">No giveaways found.</p>
        )}
      </div>
    </div>
  );
};

export default GiveawaysPage;
