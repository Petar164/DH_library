import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/library')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-zinc-400 mb-1">Admin</p>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="flex items-center gap-6 mb-10 border-b border-zinc-300 pb-4">
        {[
          { href: '/admin', label: 'Overview' },
          { href: '/admin/users', label: 'Users' },
          { href: '/admin/content', label: 'Content' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[10px] tracking-[0.25em] uppercase text-zinc-400 hover:text-black transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  )
}
