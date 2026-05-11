'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

type Step = 'account' | 'profile'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError('')
    setStep('profile')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError || !data.user) { setError(signUpError?.message || 'Sign up failed'); setLoading(false); return }

    const res = await fetch('/api/auth/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.user.id, username, full_name: fullName, bio }),
    })
    const profileResult = await res.json()

    if (!res.ok) {
      setError(profileResult.error || 'Failed to create profile')
      setLoading(false)
      return
    }

    router.push('/pending')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm p-10 border border-zinc-200">
        <div className="mb-10 text-center">
          <h1 className="font-[var(--font-pixel)] text-[22px] tracking-[0.2em] uppercase mb-1 leading-none">Archive</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400">
            {step === 'account' ? 'Step 1 of 2 — Account' : 'Step 2 of 2 — Profile'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-px bg-zinc-200 mb-10 relative">
          <div className={`absolute left-0 top-0 h-full bg-black transition-all duration-500 ${step === 'account' ? 'w-1/2' : 'w-full'}`} />
        </div>

        {step === 'account' ? (
          <form onSubmit={handleAccountStep} className="flex flex-col gap-7">
            <Input id="email" type="email" label="Email" placeholder="—" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input id="password" type="password" label="Password" placeholder="min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            {error && <p className="text-[10px] text-red-500 tracking-wide">{error}</p>}
            <Button type="submit" className="w-full mt-1">Continue</Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <Input
              id="username"
              type="text"
              label="Username"
              placeholder="—"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
              required
              pattern="[a-z0-9_.]+"
            />
            <Input id="fullName" type="text" label="Full Name (optional)" placeholder="—" value={fullName} onChange={e => setFullName(e.target.value)} />
            <div>
              <Textarea
                id="bio"
                label="Bio — why do you want access?"
                placeholder="tell us about yourself and your interest in the archive..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                maxLength={300}
              />
              <p className="text-[9px] text-zinc-400 text-right mt-1 tracking-wide">{bio.length}/300</p>
            </div>

            {error && <p className="text-[10px] text-red-500 tracking-wide">{error}</p>}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => { setStep('account'); setError('') }} className="flex-1">Back</Button>
              <Button type="submit" loading={loading} className="flex-1">Submit</Button>
            </div>

            <p className="text-[9px] tracking-[0.1em] text-zinc-400 text-center leading-relaxed">
              access is reviewed and approved manually.
            </p>
          </form>
        )}

        {step === 'account' && (
          <p className="text-center text-[10px] tracking-[0.15em] uppercase text-zinc-400 mt-8">
            Have an account?{' '}
            <Link href="/login" className="text-black underline underline-offset-4">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
