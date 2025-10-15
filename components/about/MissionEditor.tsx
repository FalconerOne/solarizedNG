// components/about/MissionEditor.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getMission, updateMission } from "@/utils/aboutApi";

export default function MissionEditor() {
  const [mission, setMission] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const loadMission = async () => {
      try {
        const data = await getMission();
        setMission(data?.mission_text || "");
      } catch (err) {
        console.error("Failed to load mission:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMission();
  }, []);

  const handleSave = async () => {
    if (!mission.trim()) return;
    setSaving(true);
    try {
      const { error } = await updateMission(mission);
      if (error) throw error;

      // ✅ D7.3: Trigger revalidation of About page
      await fetch("/api/revalidate-about", {
        method: "POST",
        headers: {
          "x-revalidate-secret":
            process.env.NEXT_PUBLIC_REVALIDATE_SECRET || "solarizedng_about_refresh",
        },
      });

      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      console.error("Mission update error:", err);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400">Loading mission...</p>;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        ✏️ Edit Mission Statement
      </h2>

      <textarea
        className="w-full h-40 p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:outline-none"
        value={mission}
        onChange={(e) => setMission(e.target.value)}
      />

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2 rounded-md text-white font-medium transition ${
            saving
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {status === "success" && (
          <span className="text-green-500 font-medium">Saved ✅</span>
        )}
        {status === "error" && (
          <span className="text-red-500 font-medium">Error saving ❌</span>
        )}
      </div>
    </div>
  );
}
