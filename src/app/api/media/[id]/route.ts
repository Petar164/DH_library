import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: media } = await supabase
    .from('media')
    .select('file_path, uploaded_by')
    .eq('id', id)
    .single()

  if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = profile?.role === 'admin'
  const isOwner = media.uploaded_by === user.id
  if (!isAdmin && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = await createAdminClient()

  await admin.storage.from('media').remove([media.file_path])
  const { error } = await admin.from('media').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
