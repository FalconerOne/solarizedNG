"use client";

import StatusBadge from "@/components/ui/StatusBadge";

export default function LeaderboardPage() {
  const users = [
    { id: 1, username: "LolaActivist", points: 420, activated: true, role: "user" },
    { id: 2, username: "AdeSun", points: 398, activated: true, role: "user" },
    { id: 3, username: "TomiFame", points: 356, activated: false, role: "user" },
    { id: 4, username: "AdminGuy", points: 1200, activated: true, role: "admin" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-orange-700">Leaderboard</h1>
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="card flex items-center justify-between hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-800">@{user.username}</span>
              <StatusBadge activated={user.activated} role={user.role} />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {user.points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
