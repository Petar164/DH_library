import { createClient } from '@/lib/supabase/server'
import { UserRow } from '@/components/admin/UserRow'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter === 'pending') query = query.eq('role', 'pending')
  else if (filter === 'contributors') query = query.eq('role', 'contributor')
  else if (filter === 'viewers') query = query.eq('role', 'viewer')

  const { data: users } = await query

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-5 mb-8">
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'viewers', label: 'Viewers' },
          { value: 'contributors', label: 'Contributors' },
        ].map(opt => (
          <a
            key={opt.value}
            href={`/admin/users${opt.value ? `?filter=${opt.value}` : ''}`}
            className={`text-xs tracking-widest uppercase transition-colors ${
              filter === opt.value || (!filter && !opt.value)
                ? 'text-[#0D0D0D] font-semibold'
                : 'text-[#888888] hover:text-[#0D0D0D]'
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      {/* Users table */}
      {(!users || users.length === 0) ? (
        <div className="py-20 text-center text-[#888888] text-sm border border-dashed border-[#E2DDD6]">
          No users found.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[#E2DDD6]">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 pb-3 items-center">
            <span className="text-[10px] tracking-widest uppercase text-[#888888]">User</span>
            <span className="text-[10px] tracking-widest uppercase text-[#888888]">Role</span>
            <span className="text-[10px] tracking-widest uppercase text-[#888888]">Joined</span>
            <span className="text-[10px] tracking-widest uppercase text-[#888888]">Actions</span>
          </div>
          {users.map(user => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
