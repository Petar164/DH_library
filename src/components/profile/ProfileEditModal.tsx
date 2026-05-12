'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Profile } from '@/types'
import { X, User, ImagePlus } from 'lucide-react'

const BG_PALETTE = [
  // Monochrome (7)
  { label: 'White',     value: '#FFFFFF' },
  { label: 'Snow',      value: '#F5F5F0' },
  { label: 'Silver',    value: '#D4D0C8' },
  { label: 'Gray',      value: '#A0A0A0' },
  { label: 'Slate',     value: '#555555' },
  { label: 'Charcoal',  value: '#222222' },
  { label: 'Black',     value: '#000000' },
  // Blues (5)
  { label: 'Ice',       value: '#E8F4FD' },
  { label: 'Sky',       value: '#90C8E8' },
  { label: 'Denim',     value: '#4A7FA5' },
  { label: 'Navy',      value: '#1B3A6B' },
  { label: 'Midnight',  value: '#0A1628' },
  // Reds (5)
  { label: 'Blush',     value: '#FDE8E8' },
  { label: 'Rose',      value: '#E8A0A0' },
  { label: 'Crimson',   value: '#C0392B' },
  { label: 'Burgundy',  value: '#6B1A1A' },
  { label: 'Maroon',    value: '#2D0A0A' },
  // Yellow / Greens (5)
  { label: 'Lemon',     value: '#FFFACD' },
  { label: 'Sage',      value: '#B8D4A8' },
  { label: 'Olive',     value: '#6B7A3A' },
  { label: 'Forest',    value: '#2D5A3A' },
  { label: 'Hunter',    value: '#0A1F10' },
  // Weird (3 + 2 picks)
  { label: 'Lavender',  value: '#E8D4F8' },
  { label: 'Aubergine', value: '#4A1A6B' },
  { label: 'Deep Violet', value: '#1A0A2D' },
  { label: 'Rust',      value: '#6B2A0A' },
  { label: 'Deep Teal', value: '#0A2D2D' },
]

const TEXT_COLORS = [
  { label: 'Black',  value: '#000000' },
  { label: 'White',  value: '#FFFFFF' },
  { label: 'Gray',   value: '#888888' },
  { label: 'Cream',  value: '#FFF8DC' },
  { label: 'Silver', value: '#C8C8C8' },
]

export function ProfileEditModal({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName]       = useState(profile.full_name || '')
  const [bio, setBio]                 = useState(profile.bio || '')
  const [avatarFile, setAvatarFile]   = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '')
  const [bannerFile, setBannerFile]   = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState(profile.banner_url || '')
  const [textColor, setTextColor]     = useState(profile.text_color || '#000000')
  const [bgColor, setBgColor]         = useState(profile.bg_color || '#FFFFFF')

  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    let avatarUrl = profile.avatar_url
    let bannerUrl = profile.banner_url

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`
      const { error: err } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (err) { setError(err.message); setLoading(false); return }
      avatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
    }

    if (bannerFile) {
      const ext = bannerFile.name.split('.').pop()
      const path = `${profile.id}/banner.${ext}`
      const { error: err } = await supabase.storage.from('avatars').upload(path, bannerFile, { upsert: true })
      if (err) { setError(err.message); setLoading(false); return }
      bannerUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        bio: bio || null,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        text_color: textColor,
        bg_color: bgColor,
      })
      .eq('id', profile.id)

    if (updateError) { setError(updateError.message); setLoading(false); return }

    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[9px] tracking-[0.25em] uppercase text-zinc-400 hover:text-black transition-colors border border-zinc-300 px-3 py-1.5 bg-white hover:border-black font-mono"
      >
        Edit Profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-white w-full max-w-lg relative border border-zinc-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-[10px] font-bold tracking-[0.35em] uppercase font-mono">Edit Profile</h2>
              <button onClick={() => setOpen(false)} className="text-zinc-300 hover:text-black transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6 p-6">

              {/* Banner */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-semibold tracking-[0.25em] uppercase text-zinc-500 font-mono">Banner Image</label>
                <button
                  type="button"
                  onClick={() => bannerRef.current?.click()}
                  className="w-full h-24 bg-zinc-100 border border-zinc-200 hover:border-zinc-400 transition-colors overflow-hidden relative flex items-center justify-center"
                >
                  {bannerPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bannerPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-zinc-300">
                      <ImagePlus className="w-5 h-5" />
                      <span className="text-[9px] tracking-[0.2em] uppercase font-mono">Upload banner</span>
                    </div>
                  )}
                </button>
                <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="w-16 h-16 overflow-hidden bg-zinc-100 flex-shrink-0 hover:opacity-70 transition-opacity border border-zinc-200"
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-zinc-300" />
                    </div>
                  )}
                </button>
                <div>
                  <button type="button" onClick={() => avatarRef.current?.click()}
                    className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-black underline underline-offset-2 font-mono">
                    Change photo
                  </button>
                  <p className="text-[9px] text-zinc-400 mt-1 font-mono">jpg, png — max 5mb</p>
                </div>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <Input id="fullName" label="Full Name" placeholder="—" value={fullName} onChange={e => setFullName(e.target.value)} />

              <div>
                <Textarea id="bio" label="Bio" placeholder="tell us about yourself..." value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={300} />
                <p className="text-[9px] text-zinc-400 text-right mt-1 font-mono">{bio.length}/300</p>
              </div>

              {/* Text color */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-semibold tracking-[0.25em] uppercase text-zinc-500 font-mono">Header Text Color</label>
                <div className="flex gap-2">
                  {TEXT_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => setTextColor(c.value)}
                      className="w-8 h-8 flex-shrink-0 transition-transform hover:scale-110"
                      style={{
                        background: c.value,
                        border: textColor === c.value ? '2px solid #000' : '1px solid #ccc',
                        outline: textColor === c.value ? '1px solid #fff' : 'none',
                        outlineOffset: '-3px',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* BG color */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-semibold tracking-[0.25em] uppercase text-zinc-500 font-mono">
                  Page Background Color
                </label>
                <div className="grid grid-cols-9 sm:grid-cols-[repeat(14,1fr)] gap-1.5">
                  {BG_PALETTE.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => setBgColor(c.value)}
                      className="aspect-square transition-transform hover:scale-110"
                      style={{
                        background: c.value,
                        border: bgColor === c.value ? '2px solid #000' : '1px solid #ccc',
                        outline: bgColor === c.value ? '1px solid #fff' : 'none',
                        outlineOffset: '-3px',
                      }}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-zinc-400 font-mono">Selected: <span style={{ color: bgColor === '#FFFFFF' ? '#999' : bgColor }}>■</span> {BG_PALETTE.find(c => c.value === bgColor)?.label ?? bgColor}</p>
              </div>

              {error && <p className="text-[10px] text-red-500 tracking-wide font-mono">{error}</p>}

              <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
