'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export const dynamic = 'force-dynamic'

type Status = 'checking' | 'ready' | 'invalid'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // The recovery session arrives either as a cookie (set by /auth/confirm) or
  // straight from the URL fragment, which the browser client parses on load.
  useEffect(() => {
    const supabase = createClient()
    let settled = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !settled) { settled = true; setStatus('ready') }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !settled) { settled = true; setStatus('ready') }
    })

    const timer = setTimeout(() => {
      if (!settled) { settled = true; setStatus('invalid') }
    }, 2500)

    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }

    router.push('/library')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm p-10 border border-zinc-200">
        <div className="mb-10 text-center">
          <h1 className="font-[var(--font-pixel)] text-[22px] tracking-[0.2em] uppercase mb-1 leading-none">Archive</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400">New password</p>
        </div>

        {status === 'checking' && (
          <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 text-center py-6">
            verifying link…
          </p>
        )}

        {status === 'invalid' && (
          <>
            <p className="text-xs tracking-wide text-zinc-700 leading-relaxed text-center mb-2">
              this link is no longer valid.
            </p>
            <p className="text-[10px] tracking-wide text-zinc-400 leading-relaxed text-center mb-10">
              reset links expire after an hour and can only be used once.
            </p>
            <p className="text-center text-[10px] tracking-[0.15em] uppercase text-zinc-400">
              <Link href="/forgot-password" className="text-black underline underline-offset-4">Request a new link</Link>
            </p>
          </>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <Input
              id="password"
              type="password"
              label="New password"
              placeholder="min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Input
              id="confirm"
              type="password"
              label="Confirm password"
              placeholder="—"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {error && <p className="text-[10px] text-red-500 text-center tracking-wide">{error}</p>}
            <Button type="submit" loading={loading} className="w-full mt-1">Set password</Button>
          </form>
        )}
      </div>
    </div>
  )
}
