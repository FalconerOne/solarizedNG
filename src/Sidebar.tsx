import { NavLinks } from "@/config/navigation";
import { NavLink } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export default function Sidebar() {
  const { unreadCount } = useNotifications();
  const user = useUser();
  const role = user?.user_metadata?.role || "user";

  return (
    <aside className="w-64 p-4 border-r border-gray-200 h-screen bg-white">
      <nav>
        <ul className="space-y-2">
          {NavLinks.filter(link => link.roles.includes(role)).map(link => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded-md transition ${
                    isActive ? "bg-gray-200" : "hover:bg-gray-100"
                  }`
                }
              >
                {link.icon === "bell" ? (
                  <Bell size={18} />
                ) : (
                  <i data-icon={link.icon}></i>
                )}
                <span>{link.label}</span>
                {link.badgeKey === "unreadCount" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

