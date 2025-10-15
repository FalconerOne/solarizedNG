'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

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
            <p className="text-2xl font-bold">{metrics.about_edits_total}</p>
          </div>
          <div className="p-4 border rounded bg-white shadow">
            <h4 className="text-sm text-gray-600">Mission Edits</h4>
            <p className="text-2xl font-bold">{metrics.mission_edits}</p>
          </div>
          <div className="p-4 border rounded bg-white shadow">
            <h4 className="text-sm text-gray-600">Team Edits</h4>
            <p className="text-2xl font-bold">{metrics.team_edits}</p>
          </div>
          <div className="p-4 border rounded bg-white shadow">
            <h4 className="text-sm text-gray-600">Timeline Edits</h4>
            <p className="text-2xl font-bold">{metrics.timeline_edits}</p>
          </div>
        </div>
      ) : (
        <p>Loading analytics...</p>
      )}
    </div>
  )
}
