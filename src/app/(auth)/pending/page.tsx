'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export default function PendingPage() {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xs bg-white/80 backdrop-blur-sm border border-zinc-200 p-12">
        <div className="w-8 h-8 border border-zinc-300 rotate-45 mx-auto mb-10" />

        <h1 className="text-[11px] font-bold tracking-[0.4em] uppercase mb-6">Archive</h1>
        <p className="text-xs tracking-wide text-zinc-700 leading-relaxed mb-2">
          your account is pending approval.
        </p>
        <p className="text-[10px] tracking-wide text-zinc-400 leading-relaxed mb-10">
          access is granted selectively. you'll be notified once reviewed.
        </p>

        <Button variant="ghost" onClick={signOut} size="sm">
          sign out
        </Button>
      </div>
    </div>
  )
}
