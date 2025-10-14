"use client";

import React from "react";

interface StatusBadgeProps {
  activated?: boolean;
  role?: string;
}

export default function StatusBadge({ activated, role }: StatusBadgeProps) {
  // Determine base color
  const statusColor = activated
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";

  return (
    <div className="flex items-center gap-2">
      {/* Activation badge */}
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}
      >
        {activated ? "Activated" : "Unactivated"}
      </span>

      {/* Optional role tag */}
      {role && (
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
          {role}
        </span>
      )}
    </div>
  );
}
