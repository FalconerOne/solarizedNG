"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface PrizeClaim {
  id: string;
  user_id: string;
  prize_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function PrizeClaimPanel() {
  const [claims, setClaims] = useState<PrizeClaim[]>([]);

  useEffect(() => {
    loadClaims();
  }, []);

  async function loadClaims() {
    const { data, error } = await supabase.from("prize_claims").select("*");
    if (error) console.error(error);
    else setClaims(data);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("prize_claims").update({ status }).eq("id", id);
    if (error) toast.error("Update failed");
    else {
      toast.success(`Claim ${status}`);
      loadClaims();
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      <h3 className="text-slate-200 text-lg mb-3 font-medium">Prize Claims</h3>
      <ul className="space-y-2">
        {claims.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center bg-slate-800/40 p-3 rounded-md"
          >
            <div>
              <p className="text-slate-100 font-medium">{c.prize_name}</p>
              <p className="text-slate-400 text-sm">User {c.user_id.slice(0, 6)}...</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs rounded-md ${
                  c.status === "approved"
                    ? "bg-green-500/20 text-green-400"
                    : c.status === "rejected"
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {c.status}
              </span>
              {c.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(c.id, "approved")}
                    className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-md text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(c.id, "rejected")}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded-md text-xs"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
