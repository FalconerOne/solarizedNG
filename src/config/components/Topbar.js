// src/components/Topbar.js
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

export function TopbarBell({ unreadCount = 0 }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative p-2 rounded-full hover:bg-gray-100"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

