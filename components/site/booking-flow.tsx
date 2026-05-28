'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { formatNiceDate, todayISO, DAY_NAMES } from '@/lib/time-utils'

type Slot = { time: string; available: boolean }
type TableAv = { tableId: string; label: string; capacity: number; slots: Slot[] }
type Availability = { closed: boolean; openTime: string; closeTime: string; allSlots: string[]; tables: TableAv[] }

export function BookingFlow() {
  const [date, setDate] = useState<string>(todayISO())
  const [partySize, setPartySize] = useState<number>(2)
  const [data, setData] = useState<Availability | null>(null)
  const [loading, setLoading] = useState(false)
  const [pick, setPick] = useState<{ tableId: string; label: string; capacity: number; time: string } | null>(null)
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<null | { date: string; time: string; table: string }>(null)

  const fetchAvailability = async (d: string, p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/public/availability?date=${encodeURIComponent(d)}&partySize=${p}`, { cache: 'no-store' })
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e); setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAvailability(date, partySize) }, [date, partySize])

  const weekday = useMemo(() => {
    try {
      const [y, m, d] = date.split('-').map((n) => parseInt(n, 10))
      return DAY_NAMES[new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).getUTCDay()] ?? ''
    } catch { return '' }
  }, [date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pick) return
    if (!form.customerName.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error('Please fill in name, phone and email.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          tableId: pick.tableId,
          startTime: pick.time,
          partySize,
          ...form,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? 'Booking failed')
      setConfirmed({ date, time: pick.time, table: pick.label })
      toast.success('Booking confirmed! See you soon.')
    } catch (err: any) {
      toast.error(err?.message ?? 'Booking failed, please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <section className="py-14">
        <div className="mx-auto max-w-[720px] px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-lg bg-white p-10 text-center shadow-[var(--shadow-lg)]"
          >
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[color:hsl(var(--accent))]/10 text-[color:hsl(var(--accent))]">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="mt-4 font-display text-3xl text-navy">You’re booked in!</h2>
            <p className="mt-2 text-navy/70">We’ve sent your reservation through to the team.</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="rounded-md bg-muted/70 p-4">
                <div className="eyebrow text-navy/60">Date</div>
                <div className="mt-1 text-navy font-medium">{formatNiceDate(confirmed.date)}</div>
              </div>
              <div className="rounded-md bg-muted/70 p-4">
                <div className="eyebrow text-navy/60">Time</div>
                <div className="mt-1 text-navy font-medium font-mono">{confirmed.time}</div>
              </div>
              <div className="rounded-md bg-muted/70 p-4">
                <div className="eyebrow text-navy/60">Table</div>
                <div className="mt-1 text-navy font-medium">{confirmed.table}</div>
              </div>
            </div>
            <button
              onClick={() => { setConfirmed(null); setPick(null); setForm({ customerName: '', phone: '', email: '', notes: '' }) }}
              className="mt-10 px-6 py-2.5 rounded-full bg-navy text-gold text-sm shadow hover:shadow-lg transition-all"
            >
              Make another booking
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="rounded-lg bg-white shadow-[var(--shadow-md)] p-5 md:p-8">
          {/* Step 1: Date + Party */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="eyebrow text-navy/60 flex items-center gap-2 mb-2">
                <Calendar size={12} /> Date
              </label>
              <input
                type="date"
                min={todayISO()}
                value={date}
                onChange={(e) => { setPick(null); setDate(e.target.value || todayISO()) }}
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-[15px] focus:ring-2 focus:ring-ring outline-none"
              />
              <div className="mt-2 text-xs text-navy/55">{weekday} · {formatNiceDate(date)}</div>
            </div>
            <div>
              <label className="eyebrow text-navy/60 flex items-center gap-2 mb-2">
                <Users size={12} /> Party size
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setPick(null); setPartySize(n) }}
                    className={`h-11 min-w-11 px-4 rounded-full text-sm font-medium transition-all ${partySize === n ? 'bg-navy text-gold shadow-md' : 'bg-muted text-navy/80 hover:bg-navy/10'}`}
                  >
                    {n}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-navy/55 ml-2">or</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={partySize}
                    onChange={(e) => { setPick(null); setPartySize(Math.max(1, parseInt(e.target.value || '1', 10))) }}
                    className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-navy/55">Parties of 9+ please <a href="mailto:hello@uzbekcorner.co.uk?subject=Private%20dining%20enquiry" className="underline text-[color:hsl(var(--accent))]">email us</a> for private dining.</div>
            </div>
          </div>
        </div>

        {/* Step 2: Tables + Slots */}
        <div className="mt-8">
          {loading && (
            <div className="flex items-center justify-center gap-2 text-navy/60 py-14">
              <Loader2 size={16} className="animate-spin" /> Checking tables…
            </div>
          )}

          {!loading && data?.closed && (
            <div className="rounded-lg bg-white p-10 text-center shadow-[var(--shadow-sm)]">
              <h3 className="font-display text-2xl text-navy">We’re closed on this date</h3>
              <p className="mt-2 text-navy/65">Please choose another day — we’d love to have you any other day of the week.</p>
            </div>
          )}

          {!loading && !data?.closed && data?.tables?.length === 0 && (
            <div className="rounded-lg bg-white p-10 text-center shadow-[var(--shadow-sm)]">
              <h3 className="font-display text-2xl text-navy">No tables fit this party</h3>
              <p className="mt-2 text-navy/65">Try a smaller party size, another date, or contact us for private dining.</p>
            </div>
          )}

          {!loading && !data?.closed && (data?.tables?.length ?? 0) > 0 && (
            <div className="space-y-5">
              {data?.tables?.map((t) => {
                const anyAvailable = t.slots.some((s) => s.available)
                return (
                  <div key={t.tableId} className="rounded-lg bg-white p-5 md:p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl text-navy">{t.label}</h3>
                        <div className="text-xs text-navy/55 mt-0.5">Seats up to {t.capacity}</div>
                      </div>
                      {!anyAvailable && <span className="text-xs px-3 py-1 rounded-full bg-muted text-navy/60">Fully booked today</span>}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {t.slots.map((s) => {
                        const active = pick?.tableId === t.tableId && pick?.time === s.time
                        return (
                          <button
                            key={`${t.tableId}-${s.time}`}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setPick({ tableId: t.tableId, label: t.label, capacity: t.capacity, time: s.time })}
                            className={
                              active
                                ? 'h-9 px-3 rounded-md text-sm font-mono bg-navy text-gold shadow-md'
                                : s.available
                                  ? 'h-9 px-3 rounded-md text-sm font-mono bg-muted text-navy/80 hover:bg-navy hover:text-gold transition-colors'
                                  : 'h-9 px-3 rounded-md text-sm font-mono bg-muted/40 text-navy/35 line-through cursor-not-allowed'
                            }
                          >
                            {s.time}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Step 3: details */}
        <AnimatePresence>
          {pick && (
            <motion.form
              key="details"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.35 }}
              onSubmit={handleSubmit}
              className="mt-8 rounded-lg bg-white shadow-[var(--shadow-md)] p-5 md:p-8"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="eyebrow text-navy/60">Selected</div>
                  <div className="mt-1 text-navy font-medium">
                    {formatNiceDate(date)} · <span className="font-mono">{pick.time}</span> · {pick.label}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPick(null)}
                  className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy"
                >
                  <ArrowLeft size={14} /> Change
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="eyebrow text-navy/60">Full name</label>
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                    className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2.5 text-[15px] focus:ring-2 focus:ring-ring outline-none"
                  />
                </div>
                <div>
                  <label className="eyebrow text-navy/60">Phone</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2.5 text-[15px] focus:ring-2 focus:ring-ring outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="eyebrow text-navy/60">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2.5 text-[15px] focus:ring-2 focus:ring-ring outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="eyebrow text-navy/60">Special requests (optional)</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2.5 text-[15px] focus:ring-2 focus:ring-ring outline-none"
                    placeholder="Birthday, allergies, high chair, etc."
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-navy/55 max-w-md">
                  Your contact details will only be used to manage this booking. We’ll be in touch if anything changes.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gold text-navy font-medium shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Confirming…</> : <>Confirm booking</>}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
