'use client';

import { useEffect, useState } from 'react';

export default function MaintenancePreviewBanner() {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    setIsPreview(url.searchParams.get('preview') === 'true');
  }, []);

  if (!isPreview) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-400 text-black text-center py-2 z-[9999] shadow-lg">
      🧩 <strong>Maintenance Preview Active</strong> — you’re viewing the site while maintenance mode is ON
    </div>
  );
}
