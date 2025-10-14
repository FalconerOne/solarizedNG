"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { checkRoleAccess } from "@/lib/checkRoleAccess";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ActivityFeed from "@/components/ActivityFeed";

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const user = useUser();
  const supabase = createClientComponentClient();

  const [role, setRole] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [logMessage, setLogMessage] = useState<string>("");
  const [clearing, setClearing] = useState(false);
  const [clearMsg, setClearMsg] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Verify access
  useEffect(() => {
    async function verifyAccess() {
      const result = await checkRoleAccess(["admin", "supervisor", "user"]);
      setAuthorized(result.authorized);
      setRole(result.role);

      if (!result.authorized) router.push("/login");
    }
    verifyAccess();
  }, [router]);

  // Add test log
  async function logActivity() {
    if (!user) {
      alert("No user session found");
      return;
    }

    const message = logMessage.trim() || "Test activity triggered from dashboard";

    const { error } = await supabase.from("activity_log").insert([
      {
        user_id: user.id,
        role: role || "user",
        action_type: "TEST_ACTION",
        description: message,
        source: "dashboard",
      },
    ]);

    if (error) {
      console.error("Error logging activity:", error);
      alert("❌ Failed to log activity");
    } else {
      alert("✅ Activity logged successfully!");
      setLogMessage("");
    }
  }

  // Admin: Clear logs
  async function clearTestLogs() {
    if (!confirm("Are you sure you want to clear all logs?")) return;
    setClearing(true);
    setClearMsg(null);
    const { error } = await supabase.from("activity_log").delete().neq("id", "");
    if (error) {
      console.error("Error clearing logs:", error);
      setClearMsg("❌ Failed to clear logs.");
    } else {
      setClearMsg("✅ All test logs cleared successfully.");
    }
    setClearing(false);
  }

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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6 overflow-y-auto flex-1">
          <h1 className="text-2xl font-semibold mb-4">
            Welcome, {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}!
          </h1>

          <p className="text-gray-600 mb-6">
            This is your SolarizedNG dashboard overview. You can test logging to Supabase below.
          </p>

          {/* 🧰 Log Tools (collapsible) */}
          <div className="mb-8 bg-white shadow rounded-xl overflow-hidden">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="w-full flex justify-between items-center px-4 py-3 bg-orange-50 hover:bg-orange-100 transition"
            >
              <span className="font-semibold text-gray-800">🧰 Log Tools</span>
              <span className="text-gray-500">{toolsOpen ? "▲" : "▼"}</span>
            </button>

            {toolsOpen && (
              <div className="p-4 border-t border-gray-200 transition-all duration-200">
                {/* Add Test Log Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Custom Log Message
                  </label>
                  <input
                    type="text"
                    value={logMessage}
                    onChange={(e) => setLogMessage(e.target.value)}
                    placeholder="Enter a message to log"
                    className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                  <button
                    onClick={logActivity}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                  >
                    Add Test Log
                  </button>
                </div>

                {/* Admin-only Clear Logs */}
                {role === "admin" && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">
                      Admin Tools
                    </h2>
                    <button
                      onClick={clearTestLogs}
                      disabled={clearing}
                      className={`px-4 py-2 rounded-lg text-white font-medium ${
                        clearing ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {clearing ? "Clearing..." : "🧹 Clear All Logs"}
                    </button>
                    {clearMsg && (
                      <p className="mt-2 text-sm text-gray-600">{clearMsg}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <ActivityFeed />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
