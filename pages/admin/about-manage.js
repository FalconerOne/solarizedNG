// pages/admin/about-manage.js
import ProtectedRoute from "@/components/ProtectedRoute";
import MissionEditor from "@/components/about/MissionEditor";
import Head from "next/head";
import TimelineEditor from "@/components/about/TimelineEditor";

export default function AboutManagePage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Head>
        <title>About Page Manager | SolarizedNG Admin</title>
      </Head>

      <main className="min-h-screen bg-zinc-950 text-white p-6">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🧭 About Page Manager</h1>
          <p className="text-gray-400 mb-8">
            Manage and update content for the public About page.
          </p>

          {/* Mission Editor */}
          <MissionEditor />
            
            <div className="mt-10">
  <TeamEditor />
            <div className="mt-10">
  <TimelineEditor />
</div>

          {/* Future Sections */}
          <div className="mt-10 opacity-60">
            <p>🚧 Team and Milestone editors coming soon...</p>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
