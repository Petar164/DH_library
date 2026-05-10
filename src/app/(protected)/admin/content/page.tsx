import { createClient } from '@/lib/supabase/server'
import { brandLabel } from '@/lib/utils'
import { ContentRow } from '@/components/admin/ContentRow'
import Link from 'next/link'

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; brand?: string }>
}) {
  const { type, brand } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('media')
    .select('*, uploader:profiles(username), season:seasons(name, period, year, brand), celebrity:celebrities(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (type) query = query.eq('type', type)
  if (brand) query = query.eq('brand', brand)

  const { data: media } = await query

  const filters = [
    { key: 'type', value: 'image', label: 'Images' },
    { key: 'type', value: 'scan', label: 'Scans' },
    { key: 'type', value: 'video', label: 'Videos' },
    { key: 'type', value: 'interview', label: 'Interviews' },
  ]

  function filterHref(key: string, value: string) {
    const params = new URLSearchParams()
    if (key === 'type' && type === value) { if (brand) params.set('brand', brand) }
    else {
      if (key === 'type') params.set('type', value); else if (type) params.set('type', type)
      if (key === 'brand') params.set('brand', value); else if (brand) params.set('brand', brand)
    }
    return `/admin/content${params.toString() ? `?${params}` : ''}`
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-5 mb-8">
        <Link
          href="/admin/content"
          className={`text-xs tracking-widest uppercase transition-colors ${!type && !brand ? 'text-[#0D0D0D] font-semibold' : 'text-[#888888] hover:text-[#0D0D0D]'}`}
        >
          All
        </Link>
        {filters.map(f => (
          <Link
            key={f.value}
            href={filterHref(f.key, f.value)}
            className={`text-xs tracking-widest uppercase transition-colors ${type === f.value ? 'text-[#0D0D0D] font-semibold' : 'text-[#888888] hover:text-[#0D0D0D]'}`}
          >
            {f.label}
          </Link>
        ))}
        <span className="h-3 w-px bg-[#E2DDD6]" />
        {['dior_homme', 'saint_laurent'].map(b => (
          <Link
            key={b}
            href={filterHref('brand', b)}
            className={`text-xs tracking-widest uppercase transition-colors ${brand === b ? 'text-[#0D0D0D] font-semibold' : 'text-[#888888] hover:text-[#0D0D0D]'}`}
          >
            {brandLabel(b)}
          </Link>
        ))}
      </div>

      <p className="text-xs text-[#888888] mb-6">{media?.length ?? 0} items</p>

      {(!media || media.length === 0) ? (
        <div className="py-20 text-center text-[#888888] text-sm border border-dashed border-[#E2DDD6]">
          No content found.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[#E2DDD6]">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 pb-3 items-center">
            <span className="text-[10px] tracking-widest uppercase text-[#888888]">Preview</span>
            <span className="text-[10px] tracking-widest uppercase text-[#888888]">Details</span>
            <span className="text-[10px] tracking-widest uppercase text-[#888888]">Uploader</span>
            <span className="text-[10px] tracking-widest uppercase text-[#888888]">Date</span>
            <span className="text-[10px] tracking-widest uppercase text-[#888888]">Delete</span>
          </div>
          {media.map(item => (
            <ContentRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
