"use client";

import { useState, useEffect } from "react";
import { getMission, updateMission } from "@/lib/adminAboutActions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AdminAboutMission() {
  const [mission, setMission] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMission().then((data) => {
      setMission(data?.mission_text || "");
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    await updateMission(mission);
    setSaving(false);
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow mb-10">
      <h2 className="text-xl font-semibold text-amber-400 mb-4">
        Mission Statement
      </h2>
      {loading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : (
        <>
          <Textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            className="bg-zinc-800 text-white mb-4 min-h-[120px]"
          />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {saving ? "Saving..." : "Save Mission"}
          </Button>
        </>
      )}
    </div>
  );
}
