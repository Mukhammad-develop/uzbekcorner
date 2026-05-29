'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { DAY_NAMES } from '@/lib/time-utils'

type Settings = {
  slotIntervalMin: number
  bookingDurationMin: number
  inclusive: boolean
  restaurantName: string
  address: string
  phone: string
  email: string
  instagramUrl?: string | null
  facebookUrl?: string | null
  tiktokUrl?: string | null
  googleBusinessUrl?: string | null
}
type Hour = { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }

export function SettingsForm({ initialSettings, initialHours }: { initialSettings: Settings | null; initialHours: Hour[] }) {
  const [settings, setSettings] = useState<Settings>(
    initialSettings ?? { slotIntervalMin: 15, bookingDurationMin: 60, inclusive: true, restaurantName: 'Uzbek Corner London', address: '', phone: '', email: '', instagramUrl: '', facebookUrl: '', tiktokUrl: '', googleBusinessUrl: '' },
  )
  const [hours, setHours] = useState<Hour[]>(() => {
    const byDow = new Map(initialHours.map((h) => [h.dayOfWeek, h]))
    return [0,1,2,3,4,5,6].map((d) => byDow.get(d) ?? { dayOfWeek: d, openTime: '12:30', closeTime: '21:30', closed: false })
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, hours }),
      })
      if (!res.ok) throw new Error('save failed')
      toast.success('Settings saved')
    } catch (e) {
      toast.error('Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow text-navy/60">Configuration</div>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-navy">Restaurant & booking settings</h1>
        <p className="mt-2 text-navy/65 text-sm">These values drive the public website, opening hours, and the booking slot logic.</p>
      </div>

      {/* Booking mechanics */}
      <section className="rounded-lg bg-white p-6 shadow-[var(--shadow-sm)]">
        <h2 className="font-display text-xl text-navy">Booking logic</h2>
        <p className="mt-1 text-sm text-navy/60">Slot interval determines how often a slot is offered; booking duration is how long each reservation holds.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Slot interval (minutes)">
            <input type="number" min={5} max={240} value={settings.slotIntervalMin}
              onChange={(e) => setSettings((s) => ({ ...s, slotIntervalMin: Math.max(5, parseInt(e.target.value || '0', 10)) }))}
              className="ucinput" />
          </Field>
          <Field label="Booking duration (minutes)">
            <input type="number" min={15} max={480} value={settings.bookingDurationMin}
              onChange={(e) => setSettings((s) => ({ ...s, bookingDurationMin: Math.max(15, parseInt(e.target.value || '0', 10)) }))}
              className="ucinput" />
          </Field>
          <Field label="Inclusive end-slot">
            <label className="mt-2 flex items-center gap-3 p-3 rounded-md bg-muted/70">
              <input type="checkbox" checked={settings.inclusive} onChange={(e) => setSettings((s) => ({ ...s, inclusive: e.target.checked }))} className="h-4 w-4" />
              <span className="text-sm text-navy/80">
                {settings.inclusive ? (<>ON — the slot at <span className="font-mono">start+duration</span> is also blocked.</>) : (<>OFF — the slot at <span className="font-mono">start+duration</span> stays free.</>)}
              </span>
            </label>
          </Field>
        </div>
        <p className="mt-4 text-xs text-navy/55 leading-relaxed">
          Example with interval 15 min & duration 60 min: booking at 3:15pm blocks 3:15, 3:30, 3:45, 4:00{settings.inclusive ? ' and 4:15 (inclusive)' : ' — 4:15 stays free (exclusive)'}.
        </p>
      </section>

      {/* Opening hours */}
      <section className="rounded-lg bg-white p-6 shadow-[var(--shadow-sm)]">
        <h2 className="font-display text-xl text-navy">Opening hours</h2>
        <div className="mt-4 divide-y divide-border">
          {hours.map((h, idx) => (
            <div key={h.dayOfWeek} className="py-3 grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3 sm:col-span-2 text-navy font-medium">{DAY_NAMES[h.dayOfWeek]}</div>
              <div className="col-span-4 sm:col-span-3">
                <input disabled={h.closed} type="time" value={h.openTime}
                  onChange={(e) => setHours((prev) => prev.map((p, i) => i === idx ? { ...p, openTime: e.target.value } : p))}
                  className="ucinput disabled:opacity-40" />
              </div>
              <div className="col-span-1 text-center text-navy/50">—</div>
              <div className="col-span-4 sm:col-span-3">
                <input disabled={h.closed} type="time" value={h.closeTime}
                  onChange={(e) => setHours((prev) => prev.map((p, i) => i === idx ? { ...p, closeTime: e.target.value } : p))}
                  className="ucinput disabled:opacity-40" />
              </div>
              <div className="col-span-12 sm:col-span-3 flex items-center justify-end">
                <label className="inline-flex items-center gap-2 text-sm text-navy/70">
                  <input type="checkbox" checked={h.closed} onChange={(e) => setHours((prev) => prev.map((p, i) => i === idx ? { ...p, closed: e.target.checked } : p))} className="h-4 w-4" />
                  Closed
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info */}
      <section className="rounded-lg bg-white p-6 shadow-[var(--shadow-sm)]">
        <h2 className="font-display text-xl text-navy">Public information</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Restaurant name"><input className="ucinput" value={settings.restaurantName} onChange={(e) => setSettings((s) => ({ ...s, restaurantName: e.target.value }))} /></Field>
          <Field label="Phone"><input className="ucinput" value={settings.phone} onChange={(e) => setSettings((s) => ({ ...s, phone: e.target.value }))} /></Field>
          <Field label="Email"><input type="email" className="ucinput" value={settings.email} onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))} /></Field>
          <Field label="Address"><input className="ucinput" value={settings.address} onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))} /></Field>
        </div>
      </section>

      {/* Social Media Links */}
      <section className="rounded-lg bg-white p-6 shadow-[var(--shadow-sm)]">
        <h2 className="font-display text-xl text-navy">Social Media Profiles</h2>
        <p className="mt-1 text-sm text-navy/60">Provide links to your social media accounts and Google Business profile to boost trust and SEO.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Instagram URL">
            <input className="ucinput" placeholder="https://instagram.com/your-username" value={settings.instagramUrl ?? ''} onChange={(e) => setSettings((s) => ({ ...s, instagramUrl: e.target.value }))} />
          </Field>
          <Field label="Facebook URL">
            <input className="ucinput" placeholder="https://facebook.com/your-page" value={settings.facebookUrl ?? ''} onChange={(e) => setSettings((s) => ({ ...s, facebookUrl: e.target.value }))} />
          </Field>
          <Field label="TikTok URL">
            <input className="ucinput" placeholder="https://tiktok.com/@your-username" value={settings.tiktokUrl ?? ''} onChange={(e) => setSettings((s) => ({ ...s, tiktokUrl: e.target.value }))} />
          </Field>
          <Field label="Google Business Profile URL">
            <input className="ucinput" placeholder="https://maps.google.com/..." value={settings.googleBusinessUrl ?? ''} onChange={(e) => setSettings((s) => ({ ...s, googleBusinessUrl: e.target.value }))} />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-navy text-gold font-medium shadow hover:shadow-lg transition-all disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save changes
        </button>
      </div>

    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow text-navy/60">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  )
}
