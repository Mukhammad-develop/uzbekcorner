'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Plus, Trash2, Pencil, Save, X, Loader2, UtensilsCrossed, Upload, ImageIcon,
} from 'lucide-react'

export type MenuItemRow = {
  id: string
  categoryId: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  imageKey: string | null
  sortOrder: number
  available: boolean
}

export type CategoryRow = {
  id: string
  name: string
  description: string | null
  sortOrder: number
  active: boolean
  items: MenuItemRow[]
}

export function MenuManager({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories)
  const [busy, setBusy] = useState(false)

  // ----- category state -----
  const [addingCat, setAddingCat] = useState(false)
  const [catDraft, setCatDraft] = useState({ name: '', description: '', sortOrder: 0, active: true })
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [catEdit, setCatEdit] = useState<Partial<CategoryRow>>({})

  // ----- item state -----
  const [addingItemFor, setAddingItemFor] = useState<string | null>(null)
  const [itemDraft, setItemDraft] = useState({ name: '', description: '', price: 0, sortOrder: 0, available: true, imageUrl: '', imageKey: '' })
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [itemEdit, setItemEdit] = useState<Partial<MenuItemRow>>({})

  const refresh = async () => {
    const res = await fetch('/api/admin/categories', { cache: 'no-store' })
    const json = await res.json()
    const list: CategoryRow[] = (json?.categories ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description ?? null,
      sortOrder: c.sortOrder ?? 0,
      active: Boolean(c.active),
      items: (c.items ?? []).map((i: any) => ({
        id: i.id,
        categoryId: i.categoryId,
        name: i.name,
        description: i.description ?? null,
        price: Number(i.price ?? 0),
        imageUrl: i.imageUrl ?? null,
        imageKey: i.imageKey ?? null,
        sortOrder: i.sortOrder ?? 0,
        available: Boolean(i.available),
      })),
    }))
    setCategories(list)
  }

  // ---------- Category handlers ----------
  const createCategory = async () => {
    if (!catDraft.name.trim()) return toast.error('Name required')
    setBusy(true)
    try {
      const r = await fetch('/api/admin/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catDraft),
      })
      if (!r.ok) throw new Error('failed')
      await refresh()
      setAddingCat(false); setCatDraft({ name: '', description: '', sortOrder: 0, active: true })
      toast.success('Category added')
    } catch { toast.error('Failed to add category') } finally { setBusy(false) }
  }

  const saveCategory = async (id: string) => {
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catEdit),
      })
      if (!r.ok) throw new Error('failed')
      await refresh(); setEditingCat(null); setCatEdit({}); toast.success('Saved')
    } catch { toast.error('Save failed') } finally { setBusy(false) }
  }

  const deleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category? All its items will also be removed.')) return
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error('failed')
      await refresh(); toast.success('Deleted')
    } catch { toast.error('Delete failed') } finally { setBusy(false) }
  }

  // ---------- Upload helper ----------
  const uploadImage = async (file: File): Promise<{ publicUrl: string; cloud_storage_path: string } | null> => {
    try {
      const res = await fetch('/api/admin/upload-url', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type || 'image/jpeg' }),
      })
      if (!res.ok) throw new Error('sign failed')
      const { uploadUrl, cloud_storage_path, publicUrl } = await res.json()
      const headers: Record<string, string> = { 'Content-Type': file.type || 'image/jpeg' }
      if (uploadUrl.includes('content-disposition')) headers['Content-Disposition'] = 'attachment'
      const put = await fetch(uploadUrl, { method: 'PUT', headers, body: file })
      if (!put.ok) throw new Error('upload failed')
      return { publicUrl, cloud_storage_path }
    } catch (err) {
      console.error(err)
      toast.error('Image upload failed')
      return null
    }
  }

  // ---------- Item handlers ----------
  const createItem = async (categoryId: string) => {
    if (!itemDraft.name.trim()) return toast.error('Name required')
    setBusy(true)
    try {
      const r = await fetch('/api/admin/menu-items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...itemDraft, categoryId }),
      })
      if (!r.ok) throw new Error('failed')
      await refresh()
      setAddingItemFor(null)
      setItemDraft({ name: '', description: '', price: 0, sortOrder: 0, available: true, imageUrl: '', imageKey: '' })
      toast.success('Dish added')
    } catch { toast.error('Failed to add item') } finally { setBusy(false) }
  }

  const saveItem = async (id: string) => {
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/menu-items/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemEdit),
      })
      if (!r.ok) throw new Error('failed')
      await refresh(); setEditingItem(null); setItemEdit({}); toast.success('Saved')
    } catch { toast.error('Save failed') } finally { setBusy(false) }
  }

  const deleteItem = async (id: string) => {
    if (!window.confirm('Delete this dish?')) return
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/menu-items/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error('failed')
      await refresh(); toast.success('Deleted')
    } catch { toast.error('Delete failed') } finally { setBusy(false) }
  }

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow text-navy/60">Content</div>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-navy">Menu</h1>
          <p className="mt-2 text-navy/65 text-sm max-w-xl">Organise the menu into categories and dishes. Dish images are shown on the public menu page.</p>
        </div>
        <button onClick={() => setAddingCat(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-gold text-sm shadow hover:shadow-lg">
          <Plus size={14} /> Add category
        </button>
      </div>

      {addingCat && (
        <div className="rounded-lg bg-white p-5 shadow-[var(--shadow-sm)] border border-dashed border-navy/20">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="eyebrow text-navy/60">Name</label>
              <input className="ucinput mt-2" placeholder="e.g. Starters" value={catDraft.name} onChange={(e) => setCatDraft((d) => ({ ...d, name: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="eyebrow text-navy/60">Description</label>
              <input className="ucinput mt-2" placeholder="Optional" value={catDraft.description} onChange={(e) => setCatDraft((d) => ({ ...d, description: e.target.value }))} />
            </div>
            <div>
              <label className="eyebrow text-navy/60">Sort</label>
              <input type="number" className="ucinput mt-2" value={catDraft.sortOrder} onChange={(e) => setCatDraft((d) => ({ ...d, sortOrder: parseInt(e.target.value || '0', 10) }))} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={createCategory} disabled={busy} className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-full bg-gold text-navy font-medium">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
              </button>
              <button onClick={() => setAddingCat(false)} className="h-10 px-3 rounded-full bg-muted text-navy/70"><X size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="rounded-lg bg-white p-10 text-center text-navy/55 shadow-[var(--shadow-sm)]">
          <UtensilsCrossed className="mx-auto mb-3 text-navy/35" /> No menu categories yet.
        </div>
      ) : categories.map((cat) => {
        const isEditingCat = editingCat === cat.id
        return (
          <section key={cat.id} className="rounded-lg bg-white shadow-[var(--shadow-sm)]">
            {/* Category header */}
            <header className="flex flex-wrap items-center gap-3 p-5 border-b border-border">
              {isEditingCat ? (
                <>
                  <input className="ucinput max-w-[220px]" value={String(catEdit.name ?? cat.name)} onChange={(e) => setCatEdit((d) => ({ ...d, name: e.target.value }))} />
                  <input className="ucinput flex-1 min-w-[200px]" placeholder="Description" value={String(catEdit.description ?? cat.description ?? '')} onChange={(e) => setCatEdit((d) => ({ ...d, description: e.target.value }))} />
                  <input type="number" className="ucinput w-24" value={Number(catEdit.sortOrder ?? cat.sortOrder)} onChange={(e) => setCatEdit((d) => ({ ...d, sortOrder: parseInt(e.target.value || '0', 10) }))} />
                  <label className="inline-flex items-center gap-2 text-sm text-navy/80"><input type="checkbox" checked={Boolean(catEdit.active ?? cat.active)} onChange={(e) => setCatEdit((d) => ({ ...d, active: e.target.checked }))} /> Active</label>
                  <button onClick={() => saveCategory(cat.id)} disabled={busy} className="px-3 py-1.5 rounded-md bg-gold text-navy text-xs font-medium"><Save size={12} className="inline mr-1" /> Save</button>
                  <button onClick={() => { setEditingCat(null); setCatEdit({}) }} className="px-3 py-1.5 rounded-md bg-muted text-navy/70 text-xs">Cancel</button>
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl text-navy">{cat.name}</h2>
                  {cat.description && <span className="text-navy/60 text-sm">· {cat.description}</span>}
                  {!cat.active && <span className="text-[10px] uppercase tracking-[0.22em] text-navy/55 bg-muted rounded-full px-2 py-0.5">Hidden</span>}
                  <span className="ml-auto text-xs text-navy/55">{cat.items.length} items · sort {cat.sortOrder}</span>
                  <button onClick={() => { setEditingCat(cat.id); setCatEdit({ name: cat.name, description: cat.description, sortOrder: cat.sortOrder, active: cat.active }) }} className="px-3 py-1.5 rounded-md bg-muted text-navy/80 hover:text-navy text-xs"><Pencil size={12} className="inline mr-1" /> Edit</button>
                  <button onClick={() => deleteCategory(cat.id)} className="px-3 py-1.5 rounded-md bg-destructive/10 text-destructive text-xs"><Trash2 size={12} className="inline mr-1" /> Delete</button>
                </>
              )}
            </header>

            {/* Items grid */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((it) => {
                const isEditingItem = editingItem === it.id
                return (
                  <div key={it.id} className="rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors p-3">
                    <div className="relative aspect-video rounded-md bg-navy/5 overflow-hidden mb-3">
                      {(isEditingItem ? (itemEdit.imageUrl ?? it.imageUrl) : it.imageUrl) ? (
                        <Image src={(isEditingItem ? (itemEdit.imageUrl ?? it.imageUrl) : it.imageUrl) as string} alt={it.name} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-navy/40"><ImageIcon size={20} /></div>
                      )}
                      <label className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[11px] bg-white/90 hover:bg-white text-navy px-2 py-1 rounded-full cursor-pointer shadow">
                        <Upload size={11} /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const f = e.target.files?.[0]; if (!f) return
                          setBusy(true)
                          const up = await uploadImage(f)
                          setBusy(false)
                          if (!up) return
                          if (isEditingItem) {
                            setItemEdit((d) => ({ ...d, imageUrl: up.publicUrl, imageKey: up.cloud_storage_path }))
                          } else {
                            // Save directly
                            const r = await fetch(`/api/admin/menu-items/${it.id}`, {
                              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ imageUrl: up.publicUrl, imageKey: up.cloud_storage_path }),
                            })
                            if (r.ok) { toast.success('Image updated'); refresh() }
                          }
                        }} />
                      </label>
                    </div>

                    {isEditingItem ? (
                      <div className="space-y-2">
                        <input className="ucinput" value={String(itemEdit.name ?? it.name)} onChange={(e) => setItemEdit((d) => ({ ...d, name: e.target.value }))} />
                        <textarea className="ucinput min-h-[60px]" placeholder="Description" value={String(itemEdit.description ?? it.description ?? '')} onChange={(e) => setItemEdit((d) => ({ ...d, description: e.target.value }))} />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="eyebrow text-navy/60">Price (£)</label>
                            <input type="number" step="0.01" className="ucinput mt-1" value={Number(itemEdit.price ?? it.price)} onChange={(e) => setItemEdit((d) => ({ ...d, price: parseFloat(e.target.value || '0') }))} />
                          </div>
                          <div>
                            <label className="eyebrow text-navy/60">Sort</label>
                            <input type="number" className="ucinput mt-1" value={Number(itemEdit.sortOrder ?? it.sortOrder)} onChange={(e) => setItemEdit((d) => ({ ...d, sortOrder: parseInt(e.target.value || '0', 10) }))} />
                          </div>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-navy/80"><input type="checkbox" checked={Boolean(itemEdit.available ?? it.available)} onChange={(e) => setItemEdit((d) => ({ ...d, available: e.target.checked }))} /> Available</label>
                        <div className="flex items-center gap-2 pt-1">
                          <button onClick={() => saveItem(it.id)} disabled={busy} className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-md bg-gold text-navy text-xs font-medium">
                            {busy ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                          </button>
                          <button onClick={() => { setEditingItem(null); setItemEdit({}) }} className="h-9 px-3 rounded-md bg-muted text-navy/70 text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-navy text-sm">{it.name}</div>
                            {it.description && <div className="text-xs text-navy/65 mt-1 line-clamp-2">{it.description}</div>}
                          </div>
                          <div className="font-display text-gold text-base shrink-0">£{it.price.toFixed(2)}</div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-navy/55">
                          <span>{it.available ? 'Available' : <span className="text-destructive">Unavailable</span>}</span>
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => { setEditingItem(it.id); setItemEdit({ name: it.name, description: it.description, price: it.price, sortOrder: it.sortOrder, available: it.available, imageUrl: it.imageUrl, imageKey: it.imageKey }) }} className="px-2 py-1 rounded-md bg-white text-navy/80 hover:text-navy"><Pencil size={11} /></button>
                            <button onClick={() => deleteItem(it.id)} className="px-2 py-1 rounded-md bg-destructive/10 text-destructive"><Trash2 size={11} /></button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

              {/* Add item card */}
              {addingItemFor === cat.id ? (
                <div className="rounded-lg bg-white p-3 border border-dashed border-navy/20">
                  <div className="relative aspect-video rounded-md bg-navy/5 overflow-hidden mb-3 flex items-center justify-center">
                    {itemDraft.imageUrl ? (
                      <Image src={itemDraft.imageUrl} alt="preview" fill className="object-cover" />
                    ) : (
                      <div className="text-navy/40 text-xs flex items-center gap-2"><ImageIcon size={16} /> No image</div>
                    )}
                    <label className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[11px] bg-white/90 hover:bg-white text-navy px-2 py-1 rounded-full cursor-pointer shadow">
                      <Upload size={11} /> Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const f = e.target.files?.[0]; if (!f) return
                        setBusy(true)
                        const up = await uploadImage(f)
                        setBusy(false)
                        if (!up) return
                        setItemDraft((d) => ({ ...d, imageUrl: up.publicUrl, imageKey: up.cloud_storage_path }))
                      }} />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <input className="ucinput" placeholder="Dish name" value={itemDraft.name} onChange={(e) => setItemDraft((d) => ({ ...d, name: e.target.value }))} />
                    <textarea className="ucinput min-h-[60px]" placeholder="Description (optional)" value={itemDraft.description} onChange={(e) => setItemDraft((d) => ({ ...d, description: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="eyebrow text-navy/60">Price (£)</label>
                        <input type="number" step="0.01" className="ucinput mt-1" value={itemDraft.price} onChange={(e) => setItemDraft((d) => ({ ...d, price: parseFloat(e.target.value || '0') }))} />
                      </div>
                      <div>
                        <label className="eyebrow text-navy/60">Sort</label>
                        <input type="number" className="ucinput mt-1" value={itemDraft.sortOrder} onChange={(e) => setItemDraft((d) => ({ ...d, sortOrder: parseInt(e.target.value || '0', 10) }))} />
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-navy/80"><input type="checkbox" checked={itemDraft.available} onChange={(e) => setItemDraft((d) => ({ ...d, available: e.target.checked }))} /> Available</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => createItem(cat.id)} disabled={busy} className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-md bg-gold text-navy text-xs font-medium">
                        {busy ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Add dish
                      </button>
                      <button onClick={() => { setAddingItemFor(null); setItemDraft({ name: '', description: '', price: 0, sortOrder: 0, available: true, imageUrl: '', imageKey: '' }) }} className="h-9 px-3 rounded-md bg-muted text-navy/70 text-xs">Cancel</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingItemFor(cat.id)} className="rounded-lg bg-white border border-dashed border-navy/20 text-navy/55 hover:text-navy hover:border-navy/40 p-3 min-h-[220px] flex flex-col items-center justify-center gap-2 transition-colors">
                  <Plus size={20} />
                  <span className="text-xs">Add dish</span>
                </button>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
