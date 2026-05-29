'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function CtaBand() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-lg bg-navy text-white px-8 md:px-14 py-14 md:py-20 shadow-[var(--shadow-lg)]"
        >
          <div aria-hidden className="absolute inset-0 suzani-bg opacity-50" />
          <div className="relative text-center max-w-2xl mx-auto">
            <div className="eyebrow ornament text-gold">Reservations</div>
            <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight">
              Join us at the <span className="text-gold">Uzbek</span> table.
            </h2>
            <p className="mt-5 text-white/75 leading-relaxed">
              Pick a date, choose your table and we’ll hold a warm welcome for you. Larger groups or private dining? Drop us a line.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/book" className="px-7 py-3.5 rounded-full bg-gold text-navy font-medium shadow-md hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                Book a table
              </Link>
              <a href="mailto:hello@uzbekcorner.uk?subject=Private%20dining%20enquiry" className="px-7 py-3.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white transition-colors">
                Private dining →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
