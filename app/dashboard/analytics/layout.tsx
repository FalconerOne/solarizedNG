// app/dashboard/layout.tsx
"use client";

import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProd = process.env.NEXT_PUBLIC_ENV === "production";

  return (
    <div className="relative min-h-screen bg-gray-950 text-white">
      {/* ✅ Optional Production Banner */}
      {isProd && (
        <div className="fixed top-0 left-0 w-full text-center bg-emerald-600 text-white text-xs py-1 z-50 shadow-md">
          ✅ SolarizedNG v1.0 Stable — Live Sync Active
        </div>
      )}

      {/* Main Dashboard Section */}
      <main className="pt-6 px-4">{children}</main>
    </div>
  );
}
