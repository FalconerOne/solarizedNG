// src/config/navigation.js
export const NavLinks = [
  {
    label: "Overview",
    path: "/",
    icon: "home",
    roles: ["admin", "supervisor", "user"],
  },
  {
    label: "Stats",
    path: "/stats",
    icon: "bar-chart-2",
    roles: ["admin", "supervisor"],
  },
  {
    label: "Activity",
    path: "/activity",
    icon: "list",
    roles: ["admin", "supervisor", "user"],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: "settings",
    roles: ["admin", "supervisor", "user"],
  },
  // ✅ New global link
  {
    label: "Notifications",
    path: "/notifications",
    icon: "bell",
    roles: ["admin", "supervisor", "user"],
    badgeKey: "unreadCount",
  },
];
