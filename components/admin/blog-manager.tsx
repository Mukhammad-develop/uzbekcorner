'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, Save, X, Loader2, Eye, EyeOff, FileText } from 'lucide-react'

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  imageUrl: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
}

const emptyDraft = { slug: '', title: '', excerpt: '', content: '', imageUrl: '', published: false }

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<BlogPost>>({})

  const refresh = async () => {
    const res = await fetch('/api/admin/blog', { cache: 'no-store' })
    const json = await res.json()
    setPosts(json.posts ?? [])
  }

  const createPost = async () => {
    if (!draft.title.trim() || !draft.slug.trim() || !draft.content.trim()) {
      return toast.error('Title, slug and content are required')
    }
    setBusy(true)
    try {
      const r = await fetch('/api/admin/blog', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!r.ok) throw new Error((await r.json()).error ?? 'Failed')
      await refresh(); setAdding(false); setDraft(emptyDraft); toast.success('Post created')
    } catch (e: any) { toast.error(e.message) } finally { setBusy(false) }
  }

  const savePost = async (id: string) => {
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (!r.ok) throw new Error('Failed')
      await refresh(); setEditingId(null); setEditData({}); toast.success('Saved')
    } catch { toast.error('Save failed') } finally { setBusy(false) }
  }

  const togglePublish = async (post: BlogPost) => {
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      })
      if (!r.ok) throw new Error('Failed')
      await refresh(); toast.success(post.published ? 'Post unpublished' : 'Post published')
    } catch { toast.error('Failed') } finally { setBusy(false) }
  }

  const deletePost = async (id: string) => {
    if (!window.confirm('Delete this post permanently?')) return
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error('Failed')
      await refresh(); toast.success('Deleted')
    } catch { toast.error('Delete failed') } finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow text-navy/60">Content</div>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-navy">Blog</h1>
          <p className="mt-2 text-navy/65 text-sm max-w-xl">Write posts here or let your auto-poster publish via the API.</p>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-gold text-sm shadow hover:shadow-lg">
          <Plus size={14} /> New post
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="rounded-xl bg-white shadow-[var(--shadow-sm)] p-6 border border-dashed border-navy/20 space-y-4">
          <h2 className="font-display text-lg text-navy">New post</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="eyebrow text-navy/60">Title</label>
              <input
                className="ucinput mt-2"
                placeholder="My post title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value, slug: slugify(e.target.value) }))}
              />
            </div>
            <div>
              <label className="eyebrow text-navy/60">Slug (URL)</label>
              <input
                className="ucinput mt-2 font-mono text-sm"
                placeholder="my-post-title"
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="eyebrow text-navy/60">Excerpt (short summary)</label>
            <textarea className="ucinput mt-2 min-h-[60px]" placeholder="A short summary shown on the blog index..." value={draft.excerpt} onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))} />
          </div>
          <div>
            <label className="eyebrow text-navy/60">Content (HTML)</label>
            <textarea className="ucinput mt-2 min-h-[200px] font-mono text-sm" placeholder="<p>Your full post content here...</p>" value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} />
          </div>
          <div>
            <label className="eyebrow text-navy/60">Cover image URL (optional)</label>
            <input className="ucinput mt-2" placeholder="https://..." value={draft.imageUrl} onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))} />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-navy/80">
            <input type="checkbox" checked={draft.published} onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))} />
            Publish immediately
          </label>
          <div className="flex gap-3">
            <button onClick={createPost} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-navy font-medium">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Create post
            </button>
            <button onClick={() => { setAdding(false); setDraft(emptyDraft) }} className="px-6 py-2.5 rounded-full bg-muted text-navy/70">Cancel</button>
          </div>
        </div>
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center text-navy/50 shadow-[var(--shadow-sm)]">
          <FileText className="mx-auto mb-3 text-navy/30" size={32} />
          <p>No posts yet. Create one above or let your auto-poster publish via the API.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-xl bg-white shadow-[var(--shadow-sm)] p-5">
              {editingId === post.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="eyebrow text-navy/60">Title</label>
                      <input className="ucinput mt-2" value={String(editData.title ?? post.title)} onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className="eyebrow text-navy/60">Slug</label>
                      <input className="ucinput mt-2 font-mono text-sm" value={String(editData.slug ?? post.slug)} onChange={(e) => setEditData((d) => ({ ...d, slug: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="eyebrow text-navy/60">Excerpt</label>
                    <textarea className="ucinput mt-2 min-h-[60px]" value={String(editData.excerpt ?? post.excerpt ?? '')} onChange={(e) => setEditData((d) => ({ ...d, excerpt: e.target.value }))} />
                  </div>
                  <div>
                    <label className="eyebrow text-navy/60">Content (HTML)</label>
                    <textarea className="ucinput mt-2 min-h-[200px] font-mono text-sm" value={String(editData.content ?? post.content)} onChange={(e) => setEditData((d) => ({ ...d, content: e.target.value }))} />
                  </div>
                  <div>
                    <label className="eyebrow text-navy/60">Cover image URL</label>
                    <input className="ucinput mt-2" value={String(editData.imageUrl ?? post.imageUrl ?? '')} onChange={(e) => setEditData((d) => ({ ...d, imageUrl: e.target.value }))} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => savePost(post.id)} disabled={busy} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold text-navy text-sm font-medium">
                      {busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                    </button>
                    <button onClick={() => { setEditingId(null); setEditData({}) }} className="px-5 py-2 rounded-full bg-muted text-navy/70 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full font-medium ${post.published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-navy/45">{new Date(post.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg text-navy">{post.title}</h3>
                    <p className="text-xs text-navy/50 font-mono mt-0.5">/blog/{post.slug}</p>
                    {post.excerpt && <p className="mt-2 text-sm text-navy/65 line-clamp-2">{post.excerpt}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => togglePublish(post)} disabled={busy} title={post.published ? 'Unpublish' : 'Publish'} className="p-2 rounded-md bg-muted hover:bg-muted/80 text-navy/70 hover:text-navy">
                      {post.published ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button onClick={() => { setEditingId(post.id); setEditData({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, imageUrl: post.imageUrl }) }} className="p-2 rounded-md bg-muted hover:bg-muted/80 text-navy/70 hover:text-navy">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deletePost(post.id)} className="p-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
