'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AdminTestPanel() {
  const supabase = createClientComponentClient();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load current state
  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();
      if (!error && data) {
        setIsMaintenance(data.value);
      }
      setLoading(false);
    };
    fetchStatus();
  }, [supabase]);

  // Toggle state
  const handleToggle = async (checked: boolean) => {
    setIsMaintenance(checked);
    await supabase
      .from('app_settings')
      .update({ value: checked })
      .eq('key', 'maintenance_mode');
  };

  if (loading) return <p>Loading status…</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-4">🛠 Admin Test Panel</h1>
      <div className="flex items-center justify-between">
        <Label htmlFor="maintenance" className="text-lg">
          Maintenance Mode
        </Label>
        <Switch
          id="maintenance"
          checked={isMaintenance}
          onCheckedChange={handleToggle}
        />
      </div>
      <p className="mt-3 text-sm text-gray-500">
        When enabled, non-admin users will see the maintenance splash screen.
      </p>
    </div>
  );
}
