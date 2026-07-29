'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    })

    if (error) { setError(error.message); setLoading(false); return }

    // Always report success — telling a stranger whether an address exists
    // would turn this form into an account lookup.
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm p-10 border border-zinc-200">
        <div className="mb-10 text-center">
          <h1 className="font-[var(--font-pixel)] text-[22px] tracking-[0.2em] uppercase mb-1 leading-none">Archive</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400">Reset password</p>
        </div>

        {sent ? (
          <>
            <p className="text-xs tracking-wide text-zinc-700 leading-relaxed text-center mb-2">
              check your inbox.
            </p>
            <p className="text-[10px] tracking-wide text-zinc-400 leading-relaxed text-center mb-10">
              if an account exists for {email}, a reset link is on its way. the link expires in one hour.
            </p>
            <p className="text-center text-[10px] tracking-[0.15em] uppercase text-zinc-400">
              <Link href="/login" className="text-black underline underline-offset-4">Back to sign in</Link>
            </p>
          </>
        ) : (
          <>
            <p className="text-[10px] tracking-wide text-zinc-400 leading-relaxed mb-8 text-center">
              enter your email and we&apos;ll send you a link to set a new password.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="—"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              {error && <p className="text-[10px] text-red-500 text-center tracking-wide">{error}</p>}
              <Button type="submit" loading={loading} className="w-full mt-1">Send reset link</Button>
            </form>

            <p className="text-center text-[10px] tracking-[0.15em] uppercase text-zinc-400 mt-8">
              <Link href="/login" className="text-black underline underline-offset-4">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
