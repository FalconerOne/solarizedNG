import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ScrollToTop from "./component/ScrollToTop"; // adjust if path differs
import { useEffect } from "react";
import { supabase } from "./config/supabaseClient";
import OverviewPage from "./pages/OverviewPage";
import StatsPage from "./pages/StatsPage";
import ActivityPage from "./pages/ActivityPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";

function App() {
  useEffect(() => {
    // Example Supabase session listener (optional)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth session changed:", session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className="flex flex-col flex-1">
          {/* Topbar */}
          <Topbar />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
