import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { brandLabel, seasonLabel } from '@/lib/utils'
import { SeasonRecord, Celebrity } from '@/types'

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; brand?: string }>
}) {
  const { view = 'seasons', brand } = await searchParams
  const supabase = await createClient()

  let seasons: SeasonRecord[] = []
  let celebrities: Celebrity[] = []

  if (view !== 'celebrities') {
    let query = supabase.from('seasons').select('*').order('year', { ascending: false }).order('period', { ascending: true })
    if (brand) query = query.eq('brand', brand)
    const { data } = await query
    seasons = data || []
  } else {
    const { data } = await supabase.from('celebrities').select('*').order('name', { ascending: true })
    celebrities = data || []
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6">
        <h1 className="text-[9px] font-bold tracking-[0.4em] uppercase text-zinc-500">Browse</h1>

        {/* View toggle */}
        <div className="flex items-center gap-1 border border-zinc-300 bg-white/60 w-fit">
          {[
            { label: 'Seasons', val: 'seasons' },
            { label: 'Celebrities', val: 'celebrities' },
          ].map(opt => (
            <Link
              key={opt.val}
              href={`/library?view=${opt.val}`}
              className={`text-[10px] tracking-[0.2em] uppercase px-5 py-2 transition-colors ${
                (opt.val === 'celebrities' && view === 'celebrities') || (opt.val === 'seasons' && view !== 'celebrities')
                  ? 'bg-black text-white'
                  : 'text-zinc-500 hover:text-black'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Brand filter */}
        {view !== 'celebrities' && (
          <div className="flex items-center gap-5">
            {[
              { value: '', label: 'All' },
              { value: 'dior_homme', label: 'Dior Homme' },
              { value: 'saint_laurent', label: 'Saint Laurent' },
            ].map(opt => (
              <Link
                key={opt.value}
                href={`/library?view=seasons${opt.value ? `&brand=${opt.value}` : ''}`}
                className={`text-[10px] tracking-[0.2em] uppercase transition-colors ${
                  brand === opt.value || (!brand && !opt.value)
                    ? 'text-black font-bold'
                    : 'text-zinc-400 hover:text-black'
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Seasons grid */}
      {view !== 'celebrities' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {seasons.length === 0 && (
            <div className="col-span-full py-20 text-center text-[10px] tracking-[0.2em] uppercase text-zinc-400">
              No seasons yet.
            </div>
          )}
          {seasons.map(season => (
            <Link key={season.id} href={`/library/seasons/${season.id}`} className="group flex flex-col">
              <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-2.5 relative">
                {season.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={season.cover_image_url}
                    alt={season.name}
                    className="w-full h-full object-cover media-img group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                    <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-400">
                      {season.period}{season.year}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-400">{brandLabel(season.brand)}</p>
              <p className="text-sm font-semibold tracking-tight mt-0.5">{seasonLabel(season.period, season.year)}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Celebrities grid */}
      {view === 'celebrities' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {celebrities.length === 0 && (
            <div className="col-span-full py-20 text-center text-[10px] tracking-[0.2em] uppercase text-zinc-400">
              No celebrities yet.
            </div>
          )}
          {celebrities.map(celebrity => (
            <Link key={celebrity.id} href={`/library/celebrities/${celebrity.id}`} className="group flex flex-col">
              <div className="aspect-[3/4] bg-zinc-100 overflow-hidden mb-2.5 relative">
                {celebrity.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={celebrity.cover_image_url}
                    alt={celebrity.name}
                    className="w-full h-full object-cover media-img group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                    <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-400">
                      {celebrity.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold tracking-tight">{celebrity.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
