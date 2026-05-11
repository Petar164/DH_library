'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteFolderButton({ folderId }: { folderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this folder? Media inside will not be deleted.')) return
    setLoading(true)
    await fetch(`/api/folders/${folderId}`, { method: 'DELETE' })
    router.push('/library/folders')
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-30 flex-shrink-0"
    >
      <Trash2 className="w-3.5 h-3.5" /> Delete
    </button>
  )
}
