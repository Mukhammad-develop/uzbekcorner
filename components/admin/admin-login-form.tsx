'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, LogIn, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params?.get('callbackUrl') || '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      const res = await signIn('credentials', { email, password, redirect: false, callbackUrl })
      if (res?.error) {
        toast.error('Invalid email or password')
      } else if (res?.ok) {
        toast.success('Welcome back')
        router.replace(callbackUrl)
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy text-white relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 suzani-bg opacity-60" />
      <div className="relative w-full max-w-md px-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gold text-navy font-display shadow-lg">UC</div>
          <div className="eyebrow text-gold mt-4">Uzbek Corner London</div>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Admin sign in</h1>
        </div>

        <form onSubmit={onSubmit} className="mt-8 rounded-lg bg-white/95 text-navy p-6 shadow-[var(--shadow-lg)] space-y-4">
          <div>
            <label className="eyebrow text-navy/60">Email</label>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="eyebrow text-navy/60">Password</label>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-navy text-gold font-medium shadow hover:shadow-lg transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            Sign in
          </button>
          <p className="text-xs text-navy/55 flex items-center gap-2 justify-center">
            <ShieldCheck size={14} className="text-[color:hsl(var(--accent))]" /> Staff access only.
          </p>
        </form>
      </div>
    </main>
  )
}
