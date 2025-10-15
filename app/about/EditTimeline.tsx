'use client'

import { useState } from 'react'
import { logAboutEdit } from '@/lib/logAboutEdit'
import { createClient } from '@/utils/supabase/client'

export default function EditTimeline({ user }: { user: any }) {
  const [timeline, setTimeline] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Handles saving the updated timeline section
  async function handleSave() {
    setSaving(true)

    // Step 1: Update the "timeline" field in the about_page table
    const { error } = await supabase
      .from('about_page')
      .update({ timeline })
      .eq('id', 1)

    // Step 2: If update succeeds, log the action in admin_activity
    if (!error) {
      await logAboutEdit({
        userId: user?.id,
        section: 'timeline',
        summary: 'Timeline section updated successfully by admin',
      })

      alert('✅ Timeline updated and logged successfully.')
    } else {
      console.error('Error updating timeline:', error)
      alert('❌ Unable to update timeline. Please try again.')
    }

    setSaving(false)
  }

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">
        Edit Timeline
      </h3>

      <textarea
        className="w-full border rounded-md p-2 mb-3 focus:ring focus:ring-purple-200"
        rows={5}
        placeholder="Add or modify timeline events..."
        value={timeline}
        onChange={(e) => setTimeline(e.target.value)}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className={`px-4 py-2 rounded-md text-white ${
          saving ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {saving ? 'Saving...' : 'Save Timeline'}
      </button>
    </div>
  )
}
