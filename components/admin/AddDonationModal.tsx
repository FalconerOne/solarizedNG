'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { addDonation } from '@/lib/admin/donations'
import { toast } from '@/components/ui/use-toast'

export default function AddDonationModal({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ organization_name: '', amount: '', currency: 'NGN', notes: '' })

  const handleSubmit = async () => {
    if (!form.organization_name || !form.amount) return toast({ title: 'Missing fields' })
    try {
      setLoading(true)
      await addDonation(form)
      toast({ title: 'Donation Added Successfully' })
      setOpen(false)
      onAdded()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Donation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Donation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Organization Name" value={form.organization_name} onChange={e => setForm({ ...form, organization_name: e.target.value })} />
          <Input placeholder="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <Input placeholder="Currency (NGN, USD...)" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
          <Input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Submit'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
