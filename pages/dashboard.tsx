// pages/dashboard.tsx

import React from "react";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
import { checkRoleAccess } from "@/lib/checkRoleAccess";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardPage() {
  const router = useRouter();
  const user = useUser();

  const [role, setRole] = React.useState<string | null>(null);
  const [authorized, setAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    async function verifyAccess() {
      const result = await checkRoleAccess(["admin", "supervisor", "user"]);
      setAuthorized(result.authorized);
      setRole(result.role);

      if (!result.authorized) router.push("/login");
    }

    verifyAccess();
  }, [router]);

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Checking access...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Access Denied
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6 overflow-y-auto flex-1">
          <h1 className="text-2xl font-semibold mb-4">
            Welcome, {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}!
          </h1>

          <p className="text-gray-600 mb-6">
            This is your SolarizedNG dashboard overview. 
            Your role determines what data and controls you can access.
          </p>

          {/* Sample panels (replace later with OverviewPanel, StatsWidget, etc.) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow">
              <h2 className="text-lg font-medium mb-2">Overview</h2>
              <p className="text-gray-500 text-sm">General system insights.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow">
              <h2 className="text-lg font-medium mb-2">Recent Activity</h2>
              <p className="text-gray-500 text-sm">Live updates from Supabase.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow">
              <h2 className="text-lg font-medium mb-2">Stats</h2>
              <p className="text-gray-500 text-sm">Analytics and charts.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
