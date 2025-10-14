// src/components/Topbar.tsx
import React from "react";
import NotificationBell from "@/components/NotificationBell";

const Topbar: React.FC = () => {
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm flex justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        SolarizedNG
      </h1>

      <div className="flex items-center gap-4">
        {/* 🔔 Notifications */}
        <NotificationBell />

        {/* 👤 User avatar placeholder */}
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
          U
        </div>
      </div>
    </header>
  );
};

export default Topbar;
