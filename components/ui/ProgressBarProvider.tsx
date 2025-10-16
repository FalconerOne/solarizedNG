"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ProgressBar from "./ProgressBar";

/**
 * Tracks route changes or background activity (like sync, load, or navigation)
 * and displays a smooth progress bar at the top of the app.
 */
export default function ProgressBarProvider() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    setIsActive(true);

    const timer = setTimeout(() => {
      setIsActive(false);
    }, 1800); // 1.8s fade-out after navigation

    return () => clearTimeout(timer);
  }, [pathname]);

  return <ProgressBar isActive={isActive} />;
}
