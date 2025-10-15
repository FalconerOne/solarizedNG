// pages/admin/about-manage.js
import ProtectedRoute from "@/components/ProtectedRoute";
import MissionEditor from "@/components/about/MissionEditor";
import TeamEditor from "@/components/about/TeamEditor";
import TimelineEditor from "@/components/about/TimelineEditor";
import Head from "next/head";
import { useState } from "react";
import { getMission, getTeam, getMilestones } from "@/utils/aboutApi";

export default function AboutManagePage() {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handlePreview() {
    setLoading(true);
    const [mission, team, milestones] = await Promise.all([
      getMission(),
      getTeam(),
      getMilestones(),
    ]);
    setPreviewData({ mission, team, milestones });
    setLoading(false);
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <Head>
        <title>About Page Manager | SolarizedNG Admin</title>
      </Head>

      <main className="min-h-screen bg-zinc-950 text-white p-6">
        <section className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🧭 About Page Manager</h1>
          <p className="text-gray-400 mb-8">
            Manage and update all content for the public About page.
          </p>

          {/* Mission */}
          <MissionEditor />

          {/* Team */}
          <div className="mt-10">
            <TeamEditor />
          </div>

          {/* Timeline */}
          <div className="mt-10">
            <TimelineEditor />
          </div>

          {/* Preview & Summary */}
          <div className="mt-12 p-6 bg-gray-900 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              🪞 Live Preview (Summary)
            </h2>
            <p className="text-gray-400 mb-6">
              Click below to load the latest content as it will appear publicly.
            </p>
            <button
              onClick={handlePreview}
              disabled={loading}
              className={`px-5 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading..." : "Generate Preview"}
            </button>

            {previewData && (
              <div className="mt-8 space-y-8">
                {/* Mission */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-400">Mission</h3>
                  <p className="text-gray-300 mt-1">
                    {previewData.mission?.mission_text || "—"}
                  </p>
                </div>

                {/* Team */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-400">Team Members</h3>
                  <ul className="mt-2 space-y-1 text-gray-300">
                    {previewData.team?.map((m) => (
                      <li key={m.id}>
                        {m.name} — {m.role}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-orange-400">Milestones</h3>
                  <ul className="mt-2 space-y-1 text-gray-300">
                    {previewData.milestones?.map((ms) => (
                      <li key={ms.id}>
                        <strong>{ms.year}</strong>: {ms.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
