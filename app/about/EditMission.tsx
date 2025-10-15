'use client'

import { useState } from 'react'
import { logAboutEdit } from '@/lib/logAboutEdit'
import { createClient } from '@/utils/supabase/client'

export default function EditMission({ user }: { user: any }) {
  const [mission, setMission] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('about_page')
      .update({ mission })
      .eq('id', 1)

    if (!error) {
      await logAboutEdit({
        userId: user?.id,
        section: 'mission',
        summary: 'Mission statement updated successfully',
      })
      alert('Mission updated and logged!')
    } else {
      console.error(error)
    }
    setSaving(false)
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2">Edit Mission</h3>
      <textarea
        className="w-full border rounded p-2 mb-3"
        value={mission}
        onChange={(e) => setMission(e.target.value)}
        placeholder="Update mission..."
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}
