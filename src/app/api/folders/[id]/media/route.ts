import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: folder_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mediaId } = await request.json()

  const { error } = await supabase.from('folder_media').insert({ folder_id, media_id: mediaId })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Auto-set cover to first image added if folder has none
  const { data: folder } = await supabase.from('folders').select('cover_image_url').eq('id', folder_id).single()
  if (folder && !folder.cover_image_url) {
    const { data: media } = await supabase.from('media').select('file_url, type').eq('id', mediaId).single()
    if (media && (media.type === 'image' || media.type === 'scan')) {
      await supabase.from('folders').update({ cover_image_url: media.file_url }).eq('id', folder_id)
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: folder_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mediaId } = await request.json()
  const { error } = await supabase.from('folder_media').delete().eq('folder_id', folder_id).eq('media_id', mediaId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
