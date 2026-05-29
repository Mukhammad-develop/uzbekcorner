'use client'

import { motion } from 'framer-motion'

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 suzani-bg">
      <div className="mx-auto max-w-[800px] px-5 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
        >
          <div className="eyebrow ornament text-navy/60">Our story</div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight text-navy leading-tight">
            A corner of <span className="text-[color:hsl(var(--accent))]">Uzbekistan</span>, set quietly on Streatham.
          </h2>
          <p className="mt-6 text-navy/75 leading-relaxed">
            Tucked inside Streatham, Uzbek Corner London has served homemade Central-Asian cooking since our
            first kazan was fired. Our chef prepares everything with love, care and attention — plov layered slowly
            over lamb and sweet carrots, somsa stamped by hand, and lagman noodles pulled fresh each morning.
          </p>
          <p className="mt-4 text-navy/70 leading-relaxed">
            Whether you're meeting friends for piala tea, gathering family for shashlik, or planning a private
            dinner for up to 14, we'd love to welcome you to our table.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <Stat value="14" label="Seats for private dining" />
            <Stat value="20+" label="Dishes on the menu" />
            <Stat value="SW16" label="Streatham, London" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md bg-white shadow-[var(--shadow-sm)] px-4 py-5 text-center hover:shadow-[var(--shadow-md)] transition-shadow">
      <div className="font-display text-3xl text-navy">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-navy/55">{label}</div>
    </div>
  )
}
