'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, XCircle, Trash2, Phone, Mail, StickyNote, RefreshCw, Filter } from 'lucide-react'
import { formatNiceDate, todayISO } from '@/lib/time-utils'

type Booking = {
  id: string
  date: string
  startTime: string
  durationMin: number
  partySize: number
  customerName: string
  phone: string
  email: string
  notes: string | null
  status: string
  createdAt: string
  table: { id: string; label: string }
}

export function BookingsManager({ tables }: { tables: { id: string; label: string }[] }) {
  const [date, setDate] = useState<string>(todayISO())
  const [tableId, setTableId] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (date) params.set('date', date)
      if (tableId) params.set('tableId', tableId)
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin/bookings?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      setBookings(json?.bookings ?? [])
    } catch { toast.error('Could not load bookings') } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() /* eslint-disable-next-line */ }, [date, tableId, status])

  const setBookingStatus = async (id: string, s: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }) })
      if (!res.ok) throw new Error('failed')
      toast.success(s === 'CANCELLED' ? 'Booking cancelled' : 'Booking confirmed')
      fetchData()
    } catch { toast.error('Could not update') }
  }

  const removeBooking = async (id: string) => {
    if (!window.confirm('Delete this booking permanently?')) return
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('failed')
      toast.success('Deleted'); fetchData()
    } catch { toast.error('Could not delete') }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow text-navy/60">Reservations</div>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-navy">Bookings</h1>
        <p className="mt-2 text-navy/65 text-sm">Filter by date, table or status. Confirm or cancel reservations with one click.</p>
      </div>

      <div className="rounded-lg bg-white p-4 md:p-5 shadow-[var(--shadow-sm)] grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-1">
          <label className="eyebrow text-navy/60">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ucinput mt-2" />
        </div>
        <div>
          <label className="eyebrow text-navy/60">Table</label>
          <select value={tableId} onChange={(e) => setTableId(e.target.value)} className="ucinput mt-2">
            <option value="">All tables</option>
            {tables.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="eyebrow text-navy/60">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="ucinput mt-2">
            <option value="">Any</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="md:col-span-2 flex gap-2 justify-end">
          <button onClick={() => { setDate(todayISO()); setTableId(''); setStatus('') }} className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-muted text-navy/80 text-sm"><Filter size={14} /> Reset</button>
          <button onClick={fetchData} className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-navy text-gold text-sm">{loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Refresh</button>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-[var(--shadow-sm)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.22em] text-navy/55 bg-muted/60">
              <th className="py-3 px-4">When</th>
              <th className="py-3 px-4">Guest</th>
              <th className="py-3 px-4 hidden md:table-cell">Contact</th>
              <th className="py-3 px-4 hidden sm:table-cell">Table</th>
              <th className="py-3 px-4">Party</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (<tr><td colSpan={7} className="py-10 text-center text-navy/55"><Loader2 className="mx-auto animate-spin" /></td></tr>)}
            {!loading && bookings.length === 0 && (<tr><td colSpan={7} className="py-10 text-center text-navy/55">No bookings match your filters.</td></tr>)}
            {!loading && bookings.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30 align-top">
                <td className="py-3 px-4">
                  <div className="font-mono text-navy">{b.startTime}</div>
                  <div className="text-xs text-navy/55">{formatNiceDate(b.date)}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-navy font-medium">{b.customerName}</div>
                  {b.notes && (
                    <div className="mt-1 inline-flex items-start gap-1 text-xs text-navy/55 max-w-xs"><StickyNote size={12} className="mt-0.5 text-[color:hsl(var(--accent))]" /> <span className="line-clamp-2">{b.notes}</span></div>
                  )}
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <div className="inline-flex items-center gap-1 text-xs text-navy/70"><Phone size={12} /> {b.phone}</div>
                  <div className="inline-flex items-center gap-1 text-xs text-navy/70 mt-1"><Mail size={12} /> {b.email}</div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">{b.table?.label}</td>
                <td className="py-3 px-4">{b.partySize}</td>
                <td className="py-3 px-4">
                  {b.status === 'CONFIRMED' ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[color:hsl(var(--accent))]/10 text-[color:hsl(var(--accent))]"><CheckCircle2 size={12} /> Confirmed</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-navy/55"><XCircle size={12} /> Cancelled</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    {b.status === 'CONFIRMED' ? (
                      <button onClick={() => setBookingStatus(b.id, 'CANCELLED')} className="px-3 py-1.5 rounded-md bg-muted hover:bg-destructive/10 text-destructive text-xs"><XCircle size={12} className="inline mr-1" /> Cancel</button>
                    ) : (
                      <button onClick={() => setBookingStatus(b.id, 'CONFIRMED')} className="px-3 py-1.5 rounded-md bg-[color:hsl(var(--accent))]/10 text-[color:hsl(var(--accent))] text-xs"><CheckCircle2 size={12} className="inline mr-1" /> Restore</button>
                    )}
                    <button onClick={() => removeBooking(b.id)} className="px-3 py-1.5 rounded-md bg-destructive/10 text-destructive text-xs"><Trash2 size={12} className="inline mr-1" /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
