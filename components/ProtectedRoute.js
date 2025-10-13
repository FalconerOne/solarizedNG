// /components/ProtectedRoute.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { checkRoleAccess } from "@/lib/checkRoleAccess";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    async function verify() {
      const { authorized } = await checkRoleAccess(allowedRoles);
      if (!authorized) router.replace("/login");
      else setAuthorized(true);
    }
    verify();
  }, [router]);

  if (authorized === null) return <div className="p-10 text-center">Loading...</div>;
  return children;
}
