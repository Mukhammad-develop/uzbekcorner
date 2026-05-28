'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Plus, Loader2, Mail } from 'lucide-react'

type Email = { id: string; email: string }

export function NotificationEmails({ initial }: { initial: Email[] }) {
  const [emails, setEmails] = useState<Email[]>(initial)
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)

  const add = async () => {
    const e = newEmail.trim().toLowerCase()
    if (!e) return
    setAdding(true)
    try {
      const res = await fetch('/api/admin/notification-emails', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: e }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'failed')
      setEmails((prev) => [...prev, { id: json.email.id, email: json.email.email }])
      setNewEmail('')
      toast.success('Recipient added')
    } catch (err: any) { toast.error(err?.message ?? 'Could not add') } finally { setAdding(false) }
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notification-emails/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('failed')
      setEmails((prev) => prev.filter((p) => p.id !== id))
      toast.success('Removed')
    } catch { toast.error('Could not remove') }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="eyebrow text-navy/60">Who gets notified</div>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-navy">Notification emails</h1>
        <p className="mt-2 text-navy/65 text-sm">Add the email addresses that should receive a notification whenever a customer makes a booking. Add as many as you need.</p>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="email"
            placeholder="manager@uzbekcorner.co.uk"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add() }}
            className="ucinput flex-1"
          />
          <button onClick={add} disabled={adding || !newEmail.trim()} className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-navy text-gold font-medium disabled:opacity-60">
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add recipient
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-[var(--shadow-sm)] overflow-hidden">
        {emails.length === 0 && (
          <div className="py-10 text-center text-navy/55 text-sm">
            <Mail className="mx-auto mb-2 text-navy/35" /> No recipients yet — add one above.
          </div>
        )}
        <ul className="divide-y divide-border">
          {emails.map((e) => (
            <li key={e.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="h-8 w-8 rounded-full bg-navy text-gold inline-flex items-center justify-center"><Mail size={14} /></span>
                <span className="text-navy truncate">{e.email}</span>
              </div>
              <button onClick={() => remove(e.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive text-xs"><Trash2 size={12} /> Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
