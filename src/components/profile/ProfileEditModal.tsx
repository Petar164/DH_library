'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Profile } from '@/types'
import { X, User } from 'lucide-react'

export function ProfileEditModal({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '')

  const fileRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    let avatarUrl = profile.avatar_url

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (uploadError) { setError(uploadError.message); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      avatarUrl = publicUrl
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName || null, bio: bio || null, avatar_url: avatarUrl })
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
        className="text-[9px] tracking-[0.25em] uppercase text-zinc-400 hover:text-black transition-colors border border-zinc-300 px-3 py-1.5 bg-white hover:border-black"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-md p-8 relative border border-zinc-200">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-zinc-300 hover:text-black transition-colors">
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-[10px] font-bold tracking-[0.35em] uppercase mb-8">Edit Profile</h2>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-16 h-16 overflow-hidden bg-zinc-100 flex-shrink-0 hover:opacity-70 transition-opacity border border-zinc-200"
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover grayscale" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-zinc-300" />
                    </div>
                  )}
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-black underline underline-offset-2"
                  >
                    Change photo
                  </button>
                  <p className="text-[9px] text-zinc-400 mt-1">jpg, png — max 5mb</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <Input id="fullName" label="Full Name" placeholder="—" value={fullName} onChange={e => setFullName(e.target.value)} />

              <div>
                <Textarea id="bio" label="Bio" placeholder="tell us about yourself..." value={bio} onChange={e => setBio(e.target.value)} rows={4} maxLength={300} />
                <p className="text-[9px] text-zinc-400 text-right mt-1">{bio.length}/300</p>
              </div>

              {error && <p className="text-[10px] text-red-500 tracking-wide">{error}</p>}

              <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
