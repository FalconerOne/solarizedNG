'use client'

import { useEffect, useState } from 'react'
import { listDonations, authorizeDonation } from '@/lib/admin/donations'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

export default function DonationTable() {
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await listDonations()
      setDonations(res || [])
    } catch (err: any) {
      toast({ title: 'Error', description: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAuthorize = async (id: string) => {
    try {
      await authorizeDonation(id)
      toast({ title: 'Donation Authorized' })
      fetchData()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message })
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Organization</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Currency</th>
            <th className="p-2">Donated By</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {donations?.map((d: any) => (
            <tr key={d.id} className="border-t">
              <td className="p-2">{d.organization_name}</td>
              <td className="p-2">{d.amount}</td>
              <td className="p-2">{d.currency}</td>
              <td className="p-2">{d.donated_by ?? '-'}</td>
              <td className="p-2">{new Date(d.date_donated).toLocaleString()}</td>
              <td className="p-2">{d.donation_status ?? 'pending'}</td>
              <td className="p-2 text-right">
                {d.donation_status !== 'authorized' && (
                  <Button size="sm" onClick={() => handleAuthorize(d.id)}>Authorize</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
