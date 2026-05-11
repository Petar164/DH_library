import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('folder_media').select('folder_id').eq('media_id', mediaId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
