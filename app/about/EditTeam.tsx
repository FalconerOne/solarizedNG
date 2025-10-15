'use client'

import { useState } from 'react'
import { logAboutEdit } from '@/lib/logAboutEdit'
import { createClient } from '@/utils/supabase/client'

export default function EditTeam({ user }: { user: any }) {
  const [teamInfo, setTeamInfo] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Handles saving the updated team section
  async function handleSave() {
    setSaving(true)

    // Step 1: Update the "team" field in the about_page table
    const { error } = await supabase
      .from('about_page')
      .update({ team: teamInfo })
      .eq('id', 1)

    // Step 2: If successful, record the edit in admin_activity
    if (!error) {
      await logAboutEdit({
        userId: user?.id,
        section: 'team',
        summary: 'Team section updated successfully by admin',
      })

      alert('✅ Team section updated and logged successfully.')
    } else {
      console.error('Error updating team section:', error)
      alert('❌ Unable to update team section. Please try again.')
    }

    setSaving(false)
  }

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">
        Edit Team Section
      </h3>

      <textarea
        className="w-full border rounded-md p-2 mb-3 focus:ring focus:ring-blue-200"
        rows={4}
        placeholder="Write or update information about your team..."
        value={teamInfo}
        onChange={(e) => setTeamInfo(e.target.value)}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className={`px-4 py-2 rounded-md text-white ${
          saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {saving ? 'Saving...' : 'Save Team Info'}
      </button>
    </div>
  )
}
