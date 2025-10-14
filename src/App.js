// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "@/Sidebar";
import Topbar from "@/Topbar";

// Pages
import OverviewPage from "@/pages/OverviewPage";
import StatsPage from "@/pages/StatsPage";
import ActivityPage from "@/pages/ActivityPage";
import Notifications from "@/pages/Notifications";
import SettingsPage from "@/pages/SettingsPage";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          <Topbar />

          {/* Page Routes */}
          <main className="flex-1 overflow-y-auto p-4">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
