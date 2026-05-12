import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { User } from 'lucide-react'
import { ProfileEditModal } from '@/components/profile/ProfileEditModal'

const ROLE_LABELS: Record<string, string> = {
  pending: 'Pending',
  viewer: 'Member',
  contributor: 'Contributor',
  admin: 'Admin',
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (!profile) notFound()

  const isOwn = user?.id === profile.id

  const { data: uploads, count: totalUploads } = await supabase
    .from('media')
    .select('id, type, file_url, title, created_at', { count: 'exact' })
    .eq('uploaded_by', profile.id)
    .order('created_at', { ascending: false })

  const scansCount = (uploads ?? []).filter(u => u.type === 'scan' || u.type === 'image').length

  const { count: foldersCount } = await supabase
    .from('folder_media')
    .select('folder_id', { count: 'exact', head: true })
    .in('media_id', (uploads ?? []).map(u => u.id))

  const bg = profile.bg_color || '#FFFFFF'
  const textColor = profile.text_color || '#000000'

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>

      {/* ── Header block ── */}
      <div className="relative">
        {/* Banner */}
        <div
          className="w-full"
          style={{
            height: 200,
            background: profile.banner_url ? undefined : '#111',
            overflow: 'hidden',
          }}
        >
          {profile.banner_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.banner_url}
              alt="banner"
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          )}
        </div>

        {/* Avatar — overlaps banner */}
        <div className="absolute left-4 sm:left-8" style={{ bottom: -44 }}>
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ border: `3px solid ${bg}`, background: '#222' }}
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            ) : (
              <User className="w-8 h-8 text-zinc-400" />
            )}
          </div>
        </div>

        {/* Edit button top-right */}
        {isOwn && (
          <div className="absolute right-4 sm:right-8 bottom-3">
            <ProfileEditModal profile={profile} />
          </div>
        )}
      </div>

      {/* ── Profile info ── */}
      <div className="px-4 sm:px-8 pt-14 pb-6" style={{ color: textColor }}>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: textColor }}>
          {profile.full_name || profile.username}
        </h1>
        <p className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: textColor, opacity: 0.6 }}>
          @{profile.username}
        </p>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span
            className="text-[9px] tracking-[0.25em] uppercase px-2.5 py-1"
            style={{ border: `1px solid ${textColor}`, color: textColor, opacity: 0.7 }}
          >
            {ROLE_LABELS[profile.role] || profile.role}
          </span>
          <span className="text-[10px]" style={{ color: textColor, opacity: 0.45 }}>
            since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {profile.bio && (
          <p className="text-sm mt-4 max-w-lg leading-relaxed" style={{ color: textColor, opacity: 0.8 }}>
            {profile.bio}
          </p>
        )}
      </div>

      {/* ── Stats ── */}
      <div
        className="mx-4 sm:mx-8 mb-8 grid grid-cols-3 text-center"
        style={{ borderTop: `1px solid ${textColor}20`, borderBottom: `1px solid ${textColor}20` }}
      >
        {[
          { label: 'Contributions', value: totalUploads ?? 0 },
          { label: 'Scans & Images', value: scansCount },
          { label: 'Folders', value: foldersCount ?? 0 },
        ].map(stat => (
          <div key={stat.label} className="py-4 px-2">
            <p className="text-2xl font-bold tracking-tight" style={{ color: textColor }}>{stat.value}</p>
            <p className="text-[8px] tracking-[0.2em] uppercase mt-0.5" style={{ color: textColor, opacity: 0.45 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Contributions feed ── */}
      {uploads && uploads.length > 0 ? (
        <div className="px-4 sm:px-8 pb-12">
          <p className="text-[9px] tracking-[0.3em] uppercase mb-4" style={{ color: textColor, opacity: 0.5 }}>
            All Contributions
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5">
            {uploads.map(item => (
              <div key={item.id} className="aspect-square bg-zinc-900 overflow-hidden relative group">
                {(item.type === 'image' || item.type === 'scan') && item.file_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.file_url}
                    alt={item.title || ''}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80 pointer-events-none select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-500">{item.type}</span>
                  </div>
                )}
                {/* Title on hover */}
                {item.title && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 pointer-events-none">
                    <p className="text-[9px] text-white font-mono leading-tight line-clamp-2">{item.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-8 py-16 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: textColor, opacity: 0.3 }}>
            No contributions yet
          </p>
        </div>
      )}
    </div>
  )
}
