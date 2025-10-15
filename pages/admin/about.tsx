import AdminAboutMission from "@/components/admin/about/AdminAboutMission";
import AdminTeamManager from "@/components/admin/about/AdminTeamManager";
import AdminMilestones from "@/components/admin/about/AdminMilestones";

export default function AdminAboutPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold text-amber-400 mb-8">
        About Us Management
      </h1>
      <AdminAboutMission />
      <AdminTeamManager />
      <AdminMilestones />
    </main>
  );
}
