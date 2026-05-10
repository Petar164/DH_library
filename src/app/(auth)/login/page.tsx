'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/library')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm p-10 border border-zinc-200">
        <div className="mb-10 text-center">
          <h1 className="text-[11px] font-bold tracking-[0.4em] uppercase mb-1">Archive</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400">Private access</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-7">
          <Input id="email" type="email" label="Email" placeholder="—" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <Input id="password" type="password" label="Password" placeholder="—" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p className="text-[10px] text-red-500 text-center tracking-wide">{error}</p>}
          <Button type="submit" loading={loading} className="w-full mt-1">
            Enter
          </Button>
        </form>

        <p className="text-center text-[10px] tracking-[0.15em] uppercase text-zinc-400 mt-8">
          No account?{' '}
          <Link href="/signup" className="text-black underline underline-offset-4">
            Request access
          </Link>
        </p>
      </div>
    </div>
  )
}
