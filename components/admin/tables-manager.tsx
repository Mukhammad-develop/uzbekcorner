'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, Save, X, Armchair, Loader2 } from 'lucide-react'

type Table = { id: string; label: string; capacity: number; sortOrder: number; active: boolean }

export function TablesManager({ initialTables }: { initialTables: Table[] }) {
  const [tables, setTables] = useState<Table[]>(initialTables)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Table>>({})
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState({ label: '', capacity: 2, sortOrder: 0, active: true })
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    const res = await fetch('/api/admin/tables', { cache: 'no-store' })
    const json = await res.json()
    setTables(json?.tables ?? [])
  }

  const add = async () => {
    if (!newRow.label.trim() || !newRow.capacity) return toast.error('Label & capacity required')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRow) })
      if (!res.ok) throw new Error('failed')
      await refresh(); setAdding(false); setNewRow({ label: '', capacity: 2, sortOrder: 0, active: true })
      toast.success('Table added')
    } catch { toast.error('Failed to add table') } finally { setBusy(false) }
  }

  const saveEdit = async (id: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/tables/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
      if (!res.ok) throw new Error('failed')
      await refresh(); setEditing(null); setDraft({})
      toast.success('Saved')
    } catch { toast.error('Save failed') } finally { setBusy(false) }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this table? Any bookings on this table will also be removed.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/tables/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('failed')
      await refresh(); toast.success('Deleted')
    } catch { toast.error('Delete failed') } finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow text-navy/60">Configuration</div>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-navy">Tables</h1>
          <p className="mt-2 text-navy/65 text-sm">Add, edit or disable tables. Capacity filters which tables appear for a given party size.</p>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-gold text-sm shadow hover:shadow-lg">
          <Plus size={14} /> Add table
        </button>
      </div>

      {adding && (
        <div className="rounded-lg bg-white p-5 shadow-[var(--shadow-sm)] border border-dashed border-navy/20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="eyebrow text-navy/60">Label</label>
              <input className="ucinput mt-2" placeholder="e.g. T8 — Window (2)" value={newRow.label} onChange={(e) => setNewRow((n) => ({ ...n, label: e.target.value }))} />
            </div>
            <div>
              <label className="eyebrow text-navy/60">Capacity</label>
              <input type="number" min={1} className="ucinput mt-2" value={newRow.capacity} onChange={(e) => setNewRow((n) => ({ ...n, capacity: parseInt(e.target.value || '0', 10) }))} />
            </div>
            <div>
              <label className="eyebrow text-navy/60">Sort order</label>
              <input type="number" className="ucinput mt-2" value={newRow.sortOrder} onChange={(e) => setNewRow((n) => ({ ...n, sortOrder: parseInt(e.target.value || '0', 10) }))} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={add} disabled={busy} className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-full bg-gold text-navy font-medium">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
              </button>
              <button onClick={() => setAdding(false)} className="h-10 px-3 rounded-full bg-muted text-navy/70"><X size={14} /></button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white shadow-[var(--shadow-sm)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.22em] text-navy/55 bg-muted/60">
              <th className="py-3 px-4">Table</th>
              <th className="py-3 px-4">Capacity</th>
              <th className="py-3 px-4">Sort</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tables.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-navy/55"><Armchair className="mx-auto mb-2 text-navy/35" /> No tables yet.</td></tr>
            )}
            {tables.map((t) => {
              const isEditing = editing === t.id
              return (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    {isEditing
                      ? <input className="ucinput" value={String(draft.label ?? t.label)} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} />
                      : <span className="text-navy font-medium">{t.label}</span>}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing
                      ? <input type="number" min={1} className="ucinput w-24" value={Number(draft.capacity ?? t.capacity)} onChange={(e) => setDraft((d) => ({ ...d, capacity: parseInt(e.target.value || '0', 10) }))} />
                      : <span className="text-navy/80">{t.capacity}</span>}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing
                      ? <input type="number" className="ucinput w-24" value={Number(draft.sortOrder ?? t.sortOrder)} onChange={(e) => setDraft((d) => ({ ...d, sortOrder: parseInt(e.target.value || '0', 10) }))} />
                      : <span className="text-navy/70">{t.sortOrder}</span>}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing
                      ? <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(draft.active ?? t.active)} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} /> Active</label>
                      : (t.active
                          ? <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[color:hsl(var(--accent))]/10 text-[color:hsl(var(--accent))]">Active</span>
                          : <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-navy/55">Disabled</span>)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => saveEdit(t.id)} disabled={busy} className="px-3 py-1.5 rounded-md bg-gold text-navy text-xs font-medium"><Save size={12} className="inline mr-1" /> Save</button>
                        <button onClick={() => { setEditing(null); setDraft({}) }} className="px-3 py-1.5 rounded-md bg-muted text-navy/70 text-xs">Cancel</button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => { setEditing(t.id); setDraft({ label: t.label, capacity: t.capacity, sortOrder: t.sortOrder, active: t.active }) }} className="px-3 py-1.5 rounded-md bg-muted text-navy/80 hover:text-navy text-xs"><Pencil size={12} className="inline mr-1" /> Edit</button>
                        <button onClick={() => remove(t.id)} className="px-3 py-1.5 rounded-md bg-destructive/10 text-destructive text-xs"><Trash2 size={12} className="inline mr-1" /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
