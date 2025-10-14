// pages/dashboard.tsx
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-orange-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Topbar />

        <section className="animate-fadeSlideIn">
          <h1 className="text-3xl font-semibold mb-4 text-gray-800">
            Welcome to SolarizedNG Dashboard
          </h1>
          <p className="text-gray-600">
            Your modular overview panel with live Supabase data.
          </p>
        </section>
      </main>
    </div>
  );
}
