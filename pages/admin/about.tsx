// pages/admin/about.tsx
"use client";
import React from "react";
import MissionEditor from "@/components/about/MissionEditor";
import TeamEditor from "@/components/about/TeamEditor";
import TimelineEditor from "@/components/about/TimelineEditor";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Shield, Users, Clock } from "lucide-react";

export default function AdminAboutPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-950 text-gray-100 px-6 py-10">
        <div className="max-w-5xl mx-auto mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2 text-orange-400">
            🛠 About Page Management
          </h1>
          <p className="text-gray-400">
            Manage your mission, team members, and milestones in one place.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <section className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-orange-500" />
              <h2 className="text-2xl font-semibold text-orange-400">
                Mission Statement
              </h2>
            </div>
            <MissionEditor />
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-orange-500" />
              <h2 className="text-2xl font-semibold text-orange-400">Team</h2>
            </div>
            <TeamEditor />
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-orange-500" />
              <h2 className="text-2xl font-semibold text-orange-400">
                Milestones
              </h2>
            </div>
            <TimelineEditor />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
