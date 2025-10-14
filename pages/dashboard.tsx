// pages/dashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
import { checkRoleAccess } from "@/lib/checkRoleAccess";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ActivityFeed from "@/components/ActivityFeed";

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const user = useUser();

  const [role, setRole] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function verifyAccess() {
      const result = await checkRoleAccess(["admin", "supervisor", "user"]);
      setAuthorized(result.authorized);
      setRole(result.role);

      if (!result.authorized) router.push("/login");
    }

    verifyAccess();
  }, [router]);

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Checking access...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div
