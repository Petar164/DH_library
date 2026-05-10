import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Image, Clock, CheckCircle } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: totalMedia },
    { count: totalSeasons },
    { data: recentPending },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'pending'),
    supabase.from('media').select('*', { count: 'exact', head: true }),
    supabase.from('seasons').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('id, username, bio, created_at').eq('role', 'pending').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Active Members', value: totalUsers ?? 0, icon: Users, href: '/admin/users' },
    { label: 'Pending Approval', value: pendingUsers ?? 0, icon: Clock, href: '/admin/users?filter=pending', urgent: (pendingUsers ?? 0) > 0 },
    { label: 'Media Items', value: totalMedia ?? 0, icon: Image, href: '/admin/content' },
    { label: 'Seasons', value: totalSeasons ?? 0, icon: CheckCircle, href: '/library' },
  ]

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {stats.map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`bg-white/70 border p-6 flex flex-col gap-5 hover:border-black transition-colors ${
              stat.urgent ? 'border-black' : 'border-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`w-4 h-4 ${stat.urgent ? 'text-black' : 'text-zinc-300'}`} />
              {stat.urgent && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-400 mt-1">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending approvals */}
      {recentPending && recentPending.length > 0 ? (
        <div className="bg-white/70 border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[9px] font-bold tracking-[0.35em] uppercase text-zinc-500">Pending Approvals</h2>
            <Link href="/admin/users?filter=pending" className="text-[9px] tracking-[0.2em] uppercase text-zinc-400 hover:text-black">
              View all
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-zinc-100">
            {recentPending.map(user => (
              <div key={user.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">@{user.username}</p>
                  {user.bio && <p className="text-[11px] text-zinc-400 mt-0.5 max-w-md truncate">{user.bio}</p>}
                  <p className="text-[9px] text-zinc-300 mt-1 tracking-wide">
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <Link
                  href="/admin/users?filter=pending"
                  className="text-[9px] tracking-[0.2em] uppercase border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors flex-shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-[10px] tracking-[0.25em] uppercase text-zinc-400 border border-dashed border-zinc-300">
          no pending approvals
        </div>
      )}
    </div>
  )
}
