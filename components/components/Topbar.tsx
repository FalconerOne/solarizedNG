// components/Topbar.tsx
import NotificationBell from "./NotificationBell";
import { useRouter } from "next/router";

export default function Topbar() {
  const router = useRouter();

  return (
    <header className="w-full flex items-center justify-between bg-white/70 backdrop-blur-md shadow p-4 rounded-2xl mb-6">
      <h2 className="text-xl font-semibold text-orange-600">
        {router.pathname === "/dashboard"
          ? "Overview"
          : router.pathname.replace("/", "").toUpperCase()}
      </h2>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <button
          onClick={() => router.push("/profile")}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition"
        >
          Profile
        </button>
      </div>
    </header>
  );
}
