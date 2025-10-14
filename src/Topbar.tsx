import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export default function Topbar() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
      <h1 className="text-lg font-semibold">SolarizedNG Dashboard</h1>

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
    </header>
  );
}

