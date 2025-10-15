'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const supabase = createClient()

  // Fetch metrics initially
  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('realtime-admin-analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_analytics',
        },
        (payload) => {
          console.log('📊 Analytics updated:', payload)
          fetchAnalytics() // Re-fetch latest metrics
        }
      )
      .subscribe()

    // Cleanup on component unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Function to load analytics from Supabase
  async function fetchAnalytics() {
    const { data, error } = await supabase.from('admin_analytics').select('*')
    if (!error) {
      const mapped = Object.fromEntries(data.map((m) => [m.metric, m.count]))
      setMetrics(mapped)
    } else {
      console.error('Analytics fetch error:', error)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>

      {metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded bg-white shadow">
            <h4 className="text-sm text-gray-600">Total About Edits</h4>
            <p className="text-2xl font-bold text-blue-700">
              {metrics.about_edits_total}
            </p>
          </div>
          <div className="p-4 border rounded bg-white shadow">
            <h4 className="text-sm text-gray-600">Mission Edits</h4>
            <p className="text-2xl font-bold text-green-700">
              {metrics.mission_edits}
            </p>
          </div>
          <div className="p-4 border rounded bg-white shadow">
            <h4 className="text-sm text-gray-600">Team Edits</h4>
            <p className="text-2xl font-bold text-amber-700">
              {metrics.team_edits}
            </p>
          </div>
          <div className="p-4 border rounded bg-white shadow">
            <h4 className="text-sm text-gray-600">Timeline Edits</h4>
            <p className="text-2xl font-bold text-purple-700">
              {metrics.timeline_edits}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Loading analytics...</p>
      )}
    </div>
  )
}
