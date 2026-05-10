'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Profile, Role } from '@/types'
import { User } from 'lucide-react'

export function UserRow({ user }: { user: Profile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<Role>(user.role)

  async function updateRole(newRole: Role | 'revoked') {
    setLoading(true)
    const res = await fetch('/api/admin/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, role: newRole === 'revoked' ? 'pending' : newRole }),
    })
    if (res.ok) { setRole(newRole === 'revoked' ? 'pending' : newRole); router.refresh() }
    setLoading(false)
  }

  const roleBadge: Record<Role, string> = {
    pending: 'text-zinc-500 border-zinc-300',
    viewer: 'text-zinc-600 border-zinc-300',
    contributor: 'text-black border-black',
    admin: 'text-white bg-black border-black',
  }

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 py-4 items-center">
      {/* User info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover grayscale" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-zinc-300" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">@{user.username}</p>
          {user.full_name && <p className="text-[10px] text-zinc-400 truncate">{user.full_name}</p>}
          {user.bio && <p className="text-[9px] text-zinc-300 truncate max-w-xs hidden sm:block">{user.bio}</p>}
        </div>
      </div>

      {/* Role badge */}
      <span className={`text-[9px] tracking-[0.2em] uppercase border px-2 py-0.5 ${roleBadge[role]}`}>
        {role}
      </span>

      {/* Joined */}
      <span className="text-[10px] text-zinc-400 hidden sm:block font-mono">
        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {role === 'pending' && (
          <>
            <button onClick={() => updateRole('viewer')} disabled={loading} className="text-[9px] tracking-[0.15em] uppercase bg-black text-white px-3 py-1.5 hover:bg-zinc-800 transition-colors disabled:opacity-30">
              Approve
            </button>
            <button onClick={() => updateRole('contributor')} disabled={loading} className="text-[9px] tracking-[0.15em] uppercase border border-black text-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors disabled:opacity-30">
              Contributor
            </button>
          </>
        )}

        {role !== 'pending' && role !== 'admin' && (
          <select
            value={role}
            onChange={e => updateRole(e.target.value as Role)}
            disabled={loading}
            className="text-[9px] tracking-[0.15em] uppercase bg-white border border-zinc-300 px-2 py-1.5 focus:outline-none focus:border-black disabled:opacity-30"
          >
            <option value="viewer">Viewer</option>
            <option value="contributor">Contributor</option>
          </select>
        )}

        {role !== 'pending' && (
          <button
            onClick={() => { if (confirm(`Revoke @${user.username}?`)) updateRole('revoked') }}
            disabled={loading}
            className="text-[9px] tracking-[0.15em] uppercase text-zinc-300 hover:text-red-500 transition-colors disabled:opacity-30"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  )
}
