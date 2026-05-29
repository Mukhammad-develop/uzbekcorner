'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react'
import { DAY_NAMES } from '@/lib/time-utils'

type Hour = { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }

export function VisitSection({
  hours,
  address,
  phone,
  email,
}: {
  hours: Hour[]
  address: string
  phone: string
  email: string
}) {
  const today = new Date().getDay()
  const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  const mapUrl = `https://maps.app.goo.gl/iawDBMdPsckDvjvd7`
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2487.526325576955!2d-0.1328512233057043!3d51.43012731634529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487605558d1ba6d9%3A0xdd2fb0c616fbe391!2sUzbek%20Corner!5e0!3m2!1sru!2s!4v1780066675497!5m2!1sru!2s`

  return (
    <section id="visit" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-5"
        >
          <div className="eyebrow ornament text-navy/60">Visit us</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-navy leading-tight">
            Come and <span className="text-[color:hsl(var(--accent))]">taste</span> Uzbekistan in London.
          </h2>

          <div className="mt-8 space-y-5 text-navy/80">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 text-gold shrink-0" />
              <div>
                <div className="text-sm text-navy/55 uppercase tracking-[0.2em]">Address</div>
                <div className="mt-0.5">{address}</div>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-[color:hsl(var(--accent))] hover:underline"
                >
                  Get directions <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 text-gold shrink-0" />
              <div>
                <div className="text-sm text-navy/55 uppercase tracking-[0.2em]">Phone</div>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-[color:hsl(var(--accent))]">{phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 text-gold shrink-0" />
              <div>
                <div className="text-sm text-navy/55 uppercase tracking-[0.2em]">Email</div>
                <a href={`mailto:${email}`} className="hover:text-[color:hsl(var(--accent))]">{email}</a>
              </div>
            </div>
          </div>

          <Link
            href="/book"
            className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-navy text-gold font-medium shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Reserve a table
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-7 space-y-5"
        >
          <div className="rounded-lg overflow-hidden shadow-[var(--shadow-md)] aspect-[16/10] bg-muted relative">
            <iframe
              title="Map to Uzbek Corner London"
              src={embedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="rounded-lg bg-white shadow-[var(--shadow-sm)] p-6">
            <div className="flex items-center gap-2 text-navy">
              <Clock size={16} className="text-gold" />
              <span className="eyebrow text-navy/60">Opening hours</span>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {sorted.map((h) => {
                const isToday = h.dayOfWeek === today
                return (
                  <li key={h.dayOfWeek} className={`flex items-center justify-between py-2.5 text-sm ${isToday ? 'text-navy font-medium' : 'text-navy/70'}`}>
                    <span className="flex items-center gap-2">
                      {isToday && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:hsl(var(--accent))]" />}
                      {DAY_NAMES[h.dayOfWeek]}
                    </span>
                    <span className="font-mono">
                      {h.closed ? <span className="text-navy/50">Closed</span> : `${h.openTime} — ${h.closeTime}`}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
