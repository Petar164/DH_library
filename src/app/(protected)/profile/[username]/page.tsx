import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { User } from 'lucide-react'
import { ProfileEditModal } from '@/components/profile/ProfileEditModal'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (!profile) notFound()

  const isOwn = user?.id === profile.id

  const { data: uploads } = await supabase
    .from('media')
    .select('id, type, file_url, title, created_at')
    .eq('uploaded_by', profile.id)
    .order('created_at', { ascending: false })
    .limit(18)

  const roleLabelMap: Record<string, string> = {
    pending: 'Pending',
    viewer: 'Member',
    contributor: 'Contributor',
    admin: 'Admin',
  }
  const roleLabel = roleLabelMap[profile.role] || profile.role

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="bg-white/70 border border-zinc-200 p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full object-cover grayscale pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-zinc-300" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight">{profile.full_name || profile.username}</h1>
                <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 mt-0.5">@{profile.username}</p>
              </div>
              {isOwn && <ProfileEditModal profile={profile} />}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <span className="text-[9px] tracking-[0.25em] uppercase border border-zinc-300 px-2.5 py-1 text-zinc-500 bg-white">
                {roleLabel}
              </span>
              <span className="text-[10px] text-zinc-400">
                {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {profile.bio && (
              <p className="text-sm text-zinc-600 mt-4 max-w-md leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Uploads grid */}
      {uploads && uploads.length > 0 && (
        <div>
          <h2 className="text-[9px] font-bold tracking-[0.35em] uppercase text-zinc-400 mb-5">
            Contributions — {uploads.length}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
            {uploads.map(item => (
              <div key={item.id} className="aspect-square bg-zinc-100 overflow-hidden">
                {(item.type === 'image' || item.type === 'scan') && item.file_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.file_url}
                    alt=""
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 pointer-events-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                    <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-300">{item.type}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
